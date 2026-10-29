# Arcanarchy: Texas Fool ’Em

## Contest MVP
2–4 remote players. No accounts, money, tournaments, or complex betting. Optional AI rivals and room-scoped Table Talk supplement human multiplayer. A five-hand match targets 5–8 minutes. A six-character room code and invite link connect mobile and desktop players.

## Rules
A 52-card deck uses Wands, Cups, Swords, Pentacles; ranks 2–10, Page (J), Queen, King, Ace. Each player receives two secret cards. Three shared cards (the flop) appear. In seat order, check, raise, or fold. There is at most one raise per hand. A raise increases the hand's prize from 2 to 3 points, and every remaining player must call or fold. After decisions, the turn and river reveal together. Make the best five-card poker hand from your two plus the five shared cards. Aces can be high or low in a straight. Suits are equal. Tied winners each receive the displayed prize. Folding earns zero. Last remaining player wins immediately. Most points after five hands wins; equal totals share the match.

Each player has one Fool token per match. Before your first betting decision of a hand, spend it to turn either private card into a wildcard. The server finds its strongest legal value automatically. You can still fold after spending it. It does not return until a rematch.

One public omen is dealt each hand: Stillness (normal rules), Magician (the river is wild for everyone), Tower (the entire flop is replaced after decisions), or Wheel (the prize doubles). Wildcards can represent any standard card, but cannot duplicate another card within the selected five-card hand. Five of a kind is excluded.

Decisions have a 45-second clock. On expiry, check if no raise is pending; otherwise fold. Any client's next sync advances the expired turn. The starting seat rotates each hand. Any player can advance from results; only the host starts a match or rematch. The roster locks for the match. Refresh restores a seat on the same browser. Rooms expire after 24 hours of inactivity.

## Technical plan
React + TypeScript on Vinext / Cloudflare Workers, Cloudflare D1. Client polls authenticated room views once per second. Server owns shuffle, hands, legal moves, scoring, and deadlines. Per-player random bearer tokens remain in session storage; URLs contain only the room code. Opponent hands remain server-side until showdown. D1 compare-and-swap revisions prevent simultaneous actions overwriting each other. Self-contained CSS/SVG tarot art follows the supplied violet-black / acid pink / cyan / aged-gold identity. Original artwork can replace it later without changing the engine.

## Verification and launch
Engine fixtures for poker ranks, wildcards, legal turns, scoring, folds, timeouts and rematches. Two isolated browser seats for create/join/start/Fool/check/call/showdown, plus mobile layout. Production D1 migration, source archive, public audience, and hosted multiplayer smoke test. Test results and deployment status belong in README.

## V2 additions
Solo creates one human seat plus the Magician AI and starts immediately. Multiplayer retains the original room-code flow; hosts may fill any of the remaining three seats with the Magician, High Priestess, or Fool AI before starting. Roster changes are host-only, capped at four seats, and locked during a match. AI players have explicit AI labels.

AI policy receives only its own two cards and the public flop/omen/round/raise state. It evaluates made hands and drawing potential, adjusts for the Tower's replacement rule, occasionally bluffs, and strategically spends its Fool. It never receives the hidden deck, turn, river, or opponent hands. A 1.5-second delay precedes AI actions, which advance through the same server rules as human actions. Client sync drives simulation; closing every client pauses the simulation until a client returns.

The original art library supplies suit illustrations and Major Arcana portraits. Ranks and suit labels remain separate overlays. Break the Wheel is promoted through a shared-universe feature on the home screen and after the match, linking to `/universe`. Lore references use the recovered visual bible's archetypes: Fool as threshold, Magician as directed will, Priestess as hidden knowledge, and the slot game's original Wild as Strength Unbound. The Wild and Fool remain mechanically distinct across the two games.

Contest acceptance: remote human room joining must continue to work; rules must be accessible in the UI; the tested release must be reachable at its public URL. AI is an additional practice option and does not stand in for the two-human multiplayer test.

## Gold & Table Talk release
Restore original distressed gold UI assets and teal-jewel accents first, verify the existing table, then add room-scoped human text chat. Game rules, human multiplayer, and AI policy are unchanged. Table Talk persists in its own D1 table, uses existing room-seat authorization, accepts up to 300 characters, and is accessible in lobby/play/results. It renders plaintext, derives sender identity on the server, supports idempotent sends, limits message frequency, and shows the last 50 messages. Chat does not mutate gameplay state or feed the AI. Voice is deferred to a separate assessment after the text-chat playtest.

Design inspiration: the character-focused social-club table atmosphere described on the official Poker Night at the Inventory store page (https://store.steampowered.com/app/3897800/Poker_Night_at_the_Inventory/). No Telltale/Skunkape character art, dialogue, or game assets are used.
