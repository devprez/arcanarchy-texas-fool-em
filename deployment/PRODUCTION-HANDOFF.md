# Production handoff

Live URL: https://games.devprez.com/arcanarchy/texas-fool-em/

Approved candidate 16 is uploaded and operational. No further manual deployment steps are required.

Passed: HTTPS, query-preserving directory redirect, all 99 production resources matching packaged hashes, character and room art, music/SFX delivery, gateway operation, direct invite join from a second client, physical-phone chat/raise/call/scoring, same-tab phone refresh recovery, music playback and mute/unmute/zero-volume controls. Break the Wheel entry HTML remains byte-identical to the pre-deployment fingerprint. No visual changes made during deployment.

Known limitation: closing the game tab may lose its seat key; use the same tab and refresh to reconnect. A saved nickname alone does not restore a seat in an ongoing match.

Keep https://arcanarchy-texas-fool-em.sirmycho.chatgpt.site active and public: it continues to provide the multiplayer/chat/D1 backend.

See SMOKE-TEST.md for detailed evidence and the distinction between local package checks and public-domain/physical-phone verification.
