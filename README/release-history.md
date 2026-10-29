# Arcanarchy: Texas Fool ’Em — Gold & Table Talk edition

A public multiplayer tarot poker game by Mycho James, with solo and mixed-table AI, original Arcanarchy card paintings, and a shared-universe feature for the Break the Wheel slot game.

## Play
Enter your name and create a multiplayer room. Copy its invite link for friends on separate devices. They enter names and join the prefilled room; the host starts with 2–4 seats. The host can also add or remove AI seats before starting. Play Solo starts immediately against the Magician and supplies the name Wanderer if no name is entered. Every mode uses the same five-hand rules, with one personal Fool wildcard per match.

How to Play is available before and during matches. It includes hand rankings, Page = Jack, all omens, tie scoring, turn clocks, Fool use, and AI behavior. Solo supplements human multiplayer; it does not replace the contest's remote-player mode.

## Preserved v1
The original source commit is `d899bcd8d63cc89cc16bd81599e03e23d56ba9cc`, tagged locally `v1-contest-baseline`. The original v1 source ZIP and deployment archive remain untouched in the parent outputs folder. Sites also retains its saved version 1. The public URL serves the newest verified release.

## Implementation
React + TypeScript on Vinext / Cloudflare Workers, backed by persistent D1. One-second polling synchronizes room views. Server-side shuffles, legal actions, scoring, and revision checks keep the state authoritative. Random bearer tokens in session storage restore seats after refresh. Opponents' private hands, the undealt deck, and future community cards stay on the server until showdown.

The AI is a built-in heuristic game opponent, not a language-model API. Its policy receives a narrow observation containing only its own hand, the visible flop, public omen/raise/round state, and whether it trails in points. Tests verify that replacing hidden opponent cards, the future board, or deck does not change that observation or its deterministic decision. AI profiles vary aggression, bluff frequency, and Fool spending. It follows the same legal actions and one-Fool limit. A short thinking delay makes turns visible; polling advances them, including after a human folds.

Original artwork is documented in ART-CREDITS.md. WebP copies preserve the source art and load quickly. Numeric cards share suit illustrations; separate UI badges determine rank. No gameplay depends on the artwork filename. The shared-universe page at `/universe` uses the recovered design bible's archetypes and promotes Break the Wheel by name. DevPrez is linked as the creator's site; no unverified direct slot-game URL is advertised.

## Develop
Node 22.13+ required. Install with `npm ci`. Build with `npm run build`. Initialize local D1 from the schema migration in `drizzle/` using Wrangler and generated `dist/server/wrangler.json`, then run `npm run dev`. The hosting manifest declares the `DB` binding. No new database migration was needed for v2 because room state is stored as version-compatible JSON.

Checks:
- `node --experimental-strip-types --test tests/game.test.mjs tests/ai.test.mjs`
- `node tests/multiplayer.mjs http://127.0.0.1:5173`
- `node tests/solo.mjs http://127.0.0.1:5173`
- `npx tsc --noEmit`
- `npm run build`

## Verification
16 engine/AI fixtures passed. Four independent human API clients passed a complete five-hand match and rematch. A solo client completed five hands without AI stalls, and two human clients plus AI reached showdown. Browser checks cover original art, solo entry, Fool selection/transformation, AI response, showdown, refresh recovery, rules, lore navigation, and desktop/phone layouts. Production verification is recorded in the v2 launch notes after deployment.

## MVP boundaries
- Refresh recovers a seat in the same browser session; closing that session or switching devices does not transfer the seat.
- Human admission pauses during a match. Hosts can end the match and reopen the same table between hands; substitute CPUs vacate then.
- AI and timeouts advance on the next authenticated client sync. Rooms do not simulate unattended matches.
- No accounts, voice, real money, or paid API dependency. Confirmed host departure transfers hosting to the next human; offline/disconnected hosts are not automatically replaced.
- Rooms expire after 24 hours without game-state changes; physical cleanup of expired records is not included.
- Fonts use Google Fonts with fallback fonts.
- Automated clients and browser sessions were tested; a final human match on two physical devices is recommended before submission.

## Publish and own
This is the complete editable source, including backend, art, tests, schema, and migration. The game can be moved to a compatible Cloudflare Workers setup. Sites publishing uses the exact pushed source commit and a matching build archive, preserving the public audience. Never commit credentials or local runtime state. No contest form is submitted by this application.

## Gold & Table Talk update
The original distressed-gold plaque, wheel emblem, and occult frame now shape the interface, with teal jewel accents, violet surfaces, larger rival portraits, and warm table lighting. Poker Night at the Inventory informed the social table atmosphere; all integrated art comes from the user's Arcanarchy library.

Table Talk is room-scoped plaintext messaging for seated human players. It works in the lobby, during hands, and after matches. AI players do not consume chat and do not respond to it. Voice has deliberately not been added.

Chat uses a separate D1 table and `/api/talk` endpoint, preserving the game-state revision path. Access requires the room's existing random seat token; knowing a room code alone does not authorize reading messages. Sender name and ID come from server state. Inputs are limited to 300 characters, rendered as text, and throttled atomically per seat. Client-generated message IDs make retries idempotent. The UI restores the latest 50 messages after refresh and merges updates without duplicates. Collapsing the panel shows new-message counts.

The additive migration is `drizzle/0001_dear_rafael_vega.sql`. New local databases need both migrations in order; existing databases apply only pending migrations. The platform applies the new hosted migration during publication. The new `tests/table-talk.mjs` integration test checks authorization, room isolation, identity spoofing, validation, origin protection, plaintext storage, retry deduplication, concurrent throttling, and chat alongside a live game move.

Room membership controls access; chat is not an end-to-end encrypted channel. No accounts or personal details are needed. Chat remains associated with its room and is inaccessible after the room's 24-hour inactivity expiry; physical retention cleanup is not implemented.

## Audio-ready update
A centralized Web Audio service observes authoritative table transitions and new remote chat messages. Gold/teal controls provide master mute, separate SFX and music volume, and optional ambience, persisted on the device. Playback unlocks only after user interaction; restored history stays silent. No audio dependency was added.

No real audio assets were present. This release intentionally remains silent until files listed in [the audio manifest](README/audio-assets.md) are installed. The build indexes only real files; missing/corrupt files fail silently. The mix and seamless loop still require listening checks once assets exist.

28 engine, AI, and audio tests passed. Independent multiplayer, solo/mixed AI, and room-chat integrations passed. Browser checks covered solo AI, host/joined showdown, refresh, persisted controls, and phone layout.

## Local persona banter
Four AI personas share authored, game-state-driven Table Talk lines: Fool, Magician, High Priestess, and Empress. Hosts can invite a specific available persona in the lobby. The Empress uses the existing strategic AI policy; this release does not rebalance poker behavior.

`lib/banter/personas.ts` defines probabilities and persona frequency, `dialogue.ts` holds authored pools, and `index.ts` selects lines with a deterministic event hash. Ordinary actions use 20%, raises 30%, Wheel six-point raises 50%, chaos/outcomes 80–90%, and start/rematch 65%, reduced for the quieter Priestess. A nine-second per-bot cooldown and 2.5-second table cooldown take priority. One line at most is emitted per event; showdown and outcome are alternatives. Pools cycle without repeating until exhausted. There are no chips in this points game, so no low-chip trigger.

Dialogue is generated only on successful authoritative mutations and stored in the room's optimistic-concurrency-controlled state. Failed competing saves cannot publish their lines. Table Talk merges the last 30 AI lines with human history; reads, React renders, and reconnects never generate lines. Message IDs remain stable. Dialogue memory is excluded from game views. No migration, external LLM/API, or new dependency is required. AI never reads human chat or hidden opponent cards. Existing rooms initialize the optional state on their next event.

Verification: 34 unit tests across engine, AI, audio, and banter; full multiplayer/solo/chat regressions; additional multi-client dialogue history, repeated sync, and attribution checks. Audio remains asset-ready and silent pending real files.

## Common room, seat plans, and guaranteed solo replies
Choose the human and CPU counts before creating a table: every combination totaling 2–4 seats with at least one human is supported. Waiting hosts can adjust the plan, choose personas, and remove a CPU to open a human seat. Planned human seats must fill before dealing. A listed table is opt-in; only its host nickname, room code, and aggregate seat counts appear publicly. Unlisted rooms retain room-code joining. The common room refreshes every five seconds. “Request open seat” immediately admits the player if a seat is still free; simultaneous admissions use the existing room revision check. There is no approval queue.

Confirmed leaving releases the seat in a waiting room. During a match, a substitute CPU keeps the seat's cards, score, and pending turn; hosting transfers to the next human. The remaining humans finish normally. A host can explicitly end the match between hands and reopen the table; scores reset and substitutes leave. The last human's confirmed departure closes the table. Refresh is reconnection, not departure. Offline/disconnected players still use the existing turn timeout; they do not automatically release their seat.

In one-human/one-CPU tables, each successful human decision produces a scripted persona line regardless of banter probability/cooldown. Each accepted human chat message also receives one local authored response. These lines do not interpret the message. Larger tables retain selective game-driven banter. Chat responses use a unique ID derived from the human message and persona; retries repair an interrupted response write without duplication. Responses cycle through four persona lines. No LLM or external AI API is used.

Human and AI speakers have distinct teal, gold, violet, and rose accents. Colors remain assigned to player identities across removals, refreshes, and substitute takeovers. AI attribution remains explicit, so color is not the only identity cue. Old rooms initialize optional fields without a database migration.

Validation: 40 engine/AI/audio/banter/lobby unit tests, TypeScript and production build; independent multiplayer, solo/mixed AI, human chat, authoritative banter, and lobby integration tests. Browser checks covered planned seats, listed-room entry, cancel/confirm departure, guaranteed solo reply, refreshed history, and phone chat layout.

## Character-stage release
The active game now uses a single theatrical table composition, with only the other 1–3 players seated across from the local player. Humans choose a Tarot persona at entry and may change it while waiting. Solo play randomly selects eligible AI rivals, excluding the human Arcana and avoiding duplicate identities. Personas persist as additive room data, with safe defaults for existing rooms. No framework, game rules, AI decision policy, database schema, or seat-token authorization was replaced.

The latest supplied sprite atlas is the canonical temporary reference; all four palettes, five expression states, swap-in individual image support, supplemental references, and future room/dealer/cat extension points are documented in [README/character-assets.md](README/character-assets.md). The preceding release remains tagged and exported alongside all earlier saved versions.

Winnings are now labeled chips throughout the interface and new game logs. They retain the existing award system and five-hand match. Table Talk retains one poll and its existing room authorization, with temporary speaker callouts and a compact transcript overlay. Existing audio controls and asset-ready silent behavior remain intact.

Validation: 44 unit tests; independent multiplayer, solo/mixed AI, chat, lobby, and persona integration checks. Browser verification covers remote human persona identity, three opponents in a four-seat match, one-opponent solo play, refresh recovery, state expressions, compact chat, mobile portraits, and no-scroll desktop compositions at 1280×720 and 1024×600.

## Observatory staging/environment pass
This coherent presentation pass gives the table a padded rail and wooden apron in front of the seated characters, rather than framing them in panels. The moonlit Observatory includes architectural windows, brass celestial instruments, warm lights, and shadow. Source atlas art is reused unchanged; the Magician's crop is expanded and side masking removed. Identity markers and callouts remain readable above the furniture. The compact Hierophant stays small. Cats now use full figures at room/rail positions; isolated eyes on the felt are disabled.

The desktop entrance exposes nickname, persona, multiplayer create/join, and direct solo-versus-1/2/3-CPU choices above the fold. The existing room creation and game engine perform solo setup; no rules or AI policies change. Universe copy now connects the Arcana becoming aware across **Arcanarchy: Break the Wheel** and **Arcanarchy: Texas Fool ’Em**, linking the former to https://games.devprez.com/arcanarchy.

Validation: 47 unit tests, TypeScript, independent multiplayer/private-card/seat tests, solo and mixed play, a complete three-CPU five-hand match, dialogue/chat, and persona persistence. Browser checks cover three-opponent and large one-opponent staging, Magician silhouette, full-cat states, desktop no-scroll gameplay at 1280×720 and 1024×600, mobile overflow, and the start form above the 1280×720 fold. Earlier source archives and saved releases remain intact.
