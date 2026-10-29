# ARCANARCHY: TEXAS FOOL ’EM

A multiplayer tarot poker game by Mycho James. Two private cards, five shared cards, one Fool ability, and a five-hand match. Play solo against 1–3 CPUs or invite friends on separate devices.

**Play:** https://games.devprez.com/arcanarchy/texas-fool-em/

**Break the Wheel:** https://games.devprez.com/arcanarchy/

## What is included

- Complete React/Vinext application, poker rules, AI, Omens and scripted Table Talk.
- Cloudflare Worker API, D1 schema and migrations.
- Approved character defaults, room environments, cards, chips, music and SFX.
- Automated unit/integration tests.
- The exact approved FTP frontend and PHP gateways in `deployment/ftp/`.

Approved application source: Sites candidate 16, commit `21f540b22ada8cc5da28ca473e0598e555afb12b`. This repository starts from that source snapshot plus the verified production FTP adapter and deployment notes. No credentials, local databases, development sessions or dependency folders are included.

## Local development

Requires Node.js 22.13+ and npm.

```sh
npm ci
npm run dev
```

The local game uses a Cloudflare D1 binding named `DB`. Apply the SQL files in `drizzle/` in order to a new local D1 database before testing room creation. The development URL is normally http://localhost:5173.

```sh
node --experimental-strip-types --test tests/*.test.mjs
npx tsc --noEmit
npm run build
```

Integration examples, after starting the app and initializing its database:

```sh
node tests/multiplayer.mjs http://localhost:5173
node tests/solo.mjs http://localhost:5173
node tests/randomized-solo.mjs http://localhost:5173
```

## Production deployment

The live frontend is served from `games.devprez.com/arcanarchy/texas-fool-em/`. Its scoped PHP gateways use the existing Sites Worker/D1 backend for game state and chat. Keep that backend active and public. Upload `deployment/ftp/` contents into the remote `arcanarchy/texas-fool-em/` folder only. Do not overwrite the existing Break the Wheel files or parent routing configuration.

- [Production handoff](deployment/PRODUCTION-HANDOFF.md)
- [Upload instructions](deployment/UPLOAD-INSTRUCTIONS.md) — the checked-in folder is `deployment/ftp/`, equivalent to `upload/arcanarchy/texas-fool-em` in the original ZIP.
- [Smoke-test report](deployment/SMOKE-TEST.md)

`deployment/ftp/` is the verified prebuilt launch snapshot. Source changes require rebuilding and regenerating the subfolder-specific frontend before uploading; copying a new root-hosted build over this folder will break asset/API paths.

## Launch verification

54 unit tests, TypeScript and production build passed. 97 fresh games verified eligible opponent selection and randomized seats. Public-domain checks verified all 99 production resources, HTTPS, direct room links and preservation of Break the Wheel. Physical-phone testing verified multiplayer chat, raise/call/scoring, same-tab refresh, music and mute/volume controls.

Known limitation: a seat key is stored per browser tab. Refresh the same tab to reconnect; closing it may lose the seat during an active match.

## Art and audio

- [Artwork credits](ART-CREDITS.md)
- [Approved character mappings](README/character-assets.md)
- [Audio credits](README/audio-launch-credits.md)
- [Game design](GAME-DESIGN.md)
- [Earlier development notes](README/release-history.md)
