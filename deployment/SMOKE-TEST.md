# Production upload package smoke test

Status: **production deployment and physical-phone smoke tests passed**.

Approved source: candidate 16 / `21f540b22ada8cc5da28ca473e0598e555afb12b`.
Target URL: https://games.devprez.com/arcanarchy/texas-fool-em
Existing live candidate: https://arcanarchy-texas-fool-em.sirmycho.chatgpt.site

## Passed before handoff

- Approved production build was already successful and deployed as Sites version 16. This package uses its compiled client files and initial rendered game/lore documents; only deployment URL prefixes, leave-table root URL, room invite URL and API gateway paths are changed. No art, CSS layout, gameplay rules or audio behavior changes.
- All four approved 1254×1254 character PNGs and all 13 MP3s remain byte-identical to the approved candidate.
- All 103 static game resources returned byte-identical content over HTTP from the exact `/arcanarchy/texas-fool-em/` folder structure. This includes every room background, character, music/SFX file, script and stylesheet.
- PHP gateway syntax validated and executed using PHP 8.5 with cURL. Requests successfully reached the actual approved Sites/D1 multiplayer backend.
- Four independent API clients completed simultaneous joins, capacity/host/private-card checks, Fool one-use checks, a raise/call sequence, five hands, consistent scores and rematch through the new PHP endpoints.
- Solo and mixed-human/AI integration passed through the new endpoints, including a complete five-hand solo match and rematch.
- Browser loaded a three-opponent game with green Empress, Magician and High Priestess, with no broken images, no console errors and no horizontal overflow at desktop width.
- Refresh restored the same room, environment, result and seat. The `?room=CODE` parameter remains on the scoped game URL.
- Direct navigation to the scoped lore page loaded correctly; Texas links stay under the new folder, and Break the Wheel links remain `https://games.devprez.com/arcanarchy`.
- Audio settings reported installed assets ready. Ambient music can be enabled in the scoped package; all audio files are local to the new folder. Final physical-phone audibility on the target domain remains pending.
- Foreign-origin POST rejected with 403. Backend transport verifies TLS and forwards to only the two fixed multiplayer/chat endpoints. No credentials are included in the package.
- Existing Break the Wheel page fetched for a before/after fingerprint. No remote game files, parent routes, root rules or DNS were modified.

## Must verify after FTP upload

- Actual target host serves PHP/cURL and preserves the Authorization header.
- HTTPS without certificate errors; bare directory URL redirects correctly and retains room query.
- Main/lore routes and refresh on the public domain; no host caching of API responses.
- Real phone joins a fresh `https://games.devprez.com/arcanarchy/texas-fool-em/?room=CODE` invite; chat, raise/call, environment and chips agree; refresh persists state.
- Phone music/SFX audible after a tap; mute/unmute, zero volume and loop behavior work.
- Break the Wheel still loads with its existing Unity files.

## Remaining dependency

Multiplayer/chat/D1 storage continue to run on the approved Sites deployment. Keep that deployment active and public. A fully independent backend migration would be a separate hosting task and is not included in this scoped FTP deployment.

Prior release evidence: 54 unit tests and 97 randomized fresh-game checks passed. The previous physical iPhone test passed music, mute/unmute and zero volume; it does not replace the required new-domain phone check.

## Public-domain verification after upload

- HTTPS route responds correctly; bare directory redirects to the trailing-slash URL.
- Public PHP gateway returned valid lobby JSON, and a two-human room AMV8MB was created through the browser.
- 99 production resources matched packaged SHA-256 hashes, including all character PNGs, environments and 13 audio files. Two unused `.gitkeep` placeholders are deliberately blocked by the host (403); the game does not request them.
- Existing Break the Wheel entry HTML still matches its pre-upload SHA-256 fingerprint.
- Phone join/play/chat/refresh and phone audibility remain pending.

## Physical phone multiplayer progress

Phone joined production room AMV8MB as Wanderer 422 / High Priestess via room code; host received “Phone ready” in Table Talk. Host dealt and checked; phone Raise synchronized to host with 3-chip stakes; host called; authoritative showdown awarded Wanderer 422 3 chips. Both devices used the production domain. Phone direct-invite refresh recovery and audio/control confirmation are pending.

## Final phone verification — passed

User confirmed phone refresh in room YS7FE8 restored the same host seat/lobby with Launch Guest and two CPUs still seated. The desktop guest joined using the direct production `?room=YS7FE8` link. Earlier room AMV8MB verified physical-phone chat, raise, host call, synchronized showdown and 3-chip award. User confirmed production music sounds good, and Mute, Unmute and Music volume 0 all work.

No further upload or deployment action is required. The approved visual layout is unchanged.

Known limitation: the seat key is sessionStorage scoped to the browser tab. Refreshing the same tab restores the seat; closing the tab or opening an invite in a different tab may lose access to that seat during an active match, while the nickname remains saved. This limitation was observed during the phone test.

Operational dependency: retain the existing public Sites backend for multiplayer/chat/D1 persistence.
