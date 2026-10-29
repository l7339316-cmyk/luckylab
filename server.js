const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));

const players = new Map();
const rooms = new Map();
const games = ["roulette", "slide", "case-battles", "coinflip"];
const names = ["Nova", "Pixel", "Mango", "Orbit", "Echo", "Comet", "Juno", "Frost", "Byte", "Clover"];
const pick = a => a[Math.floor(Math.random()*a.length)];
function getPlayer(id) {
  if (!players.has(id)) players.set(id, { name: pick(names) + String(Math.floor(10+Math.random()*89)), bux: 1000, coins: 5000, room: null });
  return players.get(id);
}
function publicPlayer(p) { return { name:p.name, bux:p.bux, coins:p.coins }; }
function roomState(room) {
  return { id: room.id, game: room.game, players: [...room.players].map(id => ({ id, ...publicPlayer(getPlayer(id)) })), round: room.round, endsAt: room.endsAt, status: room.status, lastResult: room.lastResult };
}
function emitRoom(room) { io.to(room.id).emit("room-state", roomState(room)); }
function finishRound(room) {
  if (!room || room.status !== "countdown") return;
  room.status = "result";
  if (room.game === "roulette") {
    const n = Math.floor(Math.random()*37); room.lastResult = { title: "Roulette", value: n, color: n===0 ? "green" : (n%2 ? "red" : "black") };
  } else if (room.game === "slide") {
    const n = +(1 + Math.random()*9).toFixed(2); room.lastResult = { title: "Slide", value: n.toFixed(2)+"×", multiplier:n };
  } else if (room.game === "case-battles") {
    const n = Math.floor(100 + Math.random()*9900); room.lastResult = { title: "Case battle", value: n+" points", points:n };
  } else {
    room.lastResult = { title: "Coinflip", value: pick(["Heads","Tails"]), side: pick(["Heads","Tails"]) };
  }
  io.to(room.id).emit("round-result", room.lastResult);
  emitRoom(room);
  setTimeout(() => {
    if (!rooms.has(room.id)) return;
    room.status = "waiting"; room.endsAt = null; room.round += 1; room.lastResult = null; emitRoom(room);
  }, 4500);
}
function startRound(room) {
  if (room.status !== "waiting" || room.players.size < 1) return;
  room.status = "countdown"; room.endsAt = Date.now()+10000; room.lastResult = null; emitRoom(room);
  room.timer = setTimeout(() => finishRound(room), 10000);
}
function getOrCreateRoom(game) {
  let room = [...rooms.values()].find(r => r.game === game && (r.status === "waiting" || r.status === "countdown") && r.players.size < 8);
  if (!room) {
    const id = game.slice(0,3).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase();
    room = { id, game, players:new Set(), round:1, endsAt:null, status:"waiting", lastResult:null, timer:null };
    rooms.set(id, room);
  }
  return room;
}
io.on("connection", socket => {
  const p = getPlayer(socket.id);
  socket.emit("hello", { ...publicPlayer(p), id:socket.id });
  socket.on("set-name", name => {
    const clean = String(name||"").trim().replace(/[<>]/g,"").slice(0,18);
    if (clean.length >= 2) { p.name = clean; socket.emit("profile", publicPlayer(p)); if(p.room && rooms.has(p.room)) emitRoom(rooms.get(p.room)); }
  });
  socket.on("join-game", game => {
    if (!games.includes(game)) return;
    if (p.room && rooms.has(p.room)) {
      const old = rooms.get(p.room); old.players.delete(socket.id); socket.leave(old.id); emitRoom(old);
    }
    const room = getOrCreateRoom(game);
    p.room = room.id; room.players.add(socket.id); socket.join(room.id);
    socket.emit("joined", roomState(room)); emitRoom(room);
    if (room.players.size >= 1 && room.status === "waiting") startRound(room);
  });
  socket.on("leave-room", () => {
    if (p.room && rooms.has(p.room)) {
      const room=rooms.get(p.room); room.players.delete(socket.id); socket.leave(room.id); p.room=null;
      if(room.players.size===0){if(room.timer)clearTimeout(room.timer);rooms.delete(room.id);}
      else emitRoom(room);
    }
  });
  socket.on("disconnect", () => {
    if (p.room && rooms.has(p.room)) {
      const room=rooms.get(p.room); room.players.delete(socket.id);
      if(room.players.size===0){if(room.timer)clearTimeout(room.timer);rooms.delete(room.id);}
      else emitRoom(room);
    }
    players.delete(socket.id);
  });
});
server.listen(PORT, () => console.log(`LuckyLab running at http://localhost:${PORT}`));
