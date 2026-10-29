# LuckyLab — Virtual Game Lounge

A polished, virtual-only prototype with solo games and server-synced multiplayer rooms.

## Included
- Solo: Dice, Blackjack, Mines, Towers, Keno, Limbo, Plinko
- Multiplayer rooms: Roulette, Slide, Case Battles, Coinflip
- Two separate virtual balances: Bux Tokens and Coins
- Display names, browser-persisted demo balances, demo bonus claim
- Shared room roster, server countdown, and common round result
- Responsive dark UI

## Run it
1. Install Node.js 18 or newer.
2. Extract this folder.
3. Open a terminal in this folder.
4. Run `npm install`
5. Run `npm start`
6. Visit http://localhost:3000

To test multiplayer, open that URL in two or more tabs or browsers. Each browser connection can join the same waiting room for a game. To let people on other devices connect on the same Wi-Fi, use your computer's local network IP and allow the server through your firewall. Public hosting needs a proper host and security review.

## Important prototype limits
- All balances are virtual and have no cash value.
- No deposits, purchases, transfers, withdrawals, or payment integrations.
- Multiplayer server player balances are temporary and reset when connections end/server restarts. Solo balances are stored in each browser.
- Multiplayer rounds share a result and timer, but do not yet support wagers, player-vs-player settlement, durable accounts, or chat.
- This is a learning prototype, not production-ready. It has not had a security audit and should not be used for real-money gambling.
- Some game odds and payouts are simplified demo mechanics. Review and test the game logic before any public launch.
