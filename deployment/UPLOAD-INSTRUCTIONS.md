# Texas Fool ’Em — production FTP upload

Approved candidate: version 16, source commit `21f540b22ada8cc5da28ca473e0598e555afb12b`.
Target: https://games.devprez.com/arcanarchy/texas-fool-em

## Upload exactly this

1. Unzip `texas-fool-em-production-ftp.zip` on your computer.
2. In your FTP app, open the **games.devprez.com web root**. In the connection currently shown in Cyberduck this appears to be `/games.devprez.com/public_html`; verify that this is the folder containing the existing `arcanarchy` directory and its working Break the Wheel `index.html` and `Build` folder.
3. Open that remote `arcanarchy` directory.
4. Upload the **whole local `upload/arcanarchy/texas-fool-em` folder** into it. The result must be `arcanarchy/texas-fool-em/index.html` — not `arcanarchy/texas-fool-em/texas-fool-em/index.html`.
5. Include the hidden `.htaccess` file inside **texas-fool-em only**. Use binary/automatic transfer for media. Normal permissions are 755 for directories and 644 for files.
6. Open https://games.devprez.com/arcanarchy/texas-fool-em . A normal directory redirect to the same URL with a trailing slash is expected and preserves `?room=CODE`.
7. Tell Codex the upload has finished so the actual HTTPS URL and a real phone join can be tested.

Do not upload the containing `arcanarchy` folder over the existing one. Do not replace the existing `/arcanarchy/index.html`, `Build`, `StreamingAssets`, root `.htaccess`, or any existing game files. This upload adds one child directory only. No DNS changes or root rewrite changes are needed.

## Runtime requirements

The web host must run PHP 8.0+ with cURL and permit outbound HTTPS to `arcanarchy-texas-fool-em.sirmycho.chatgpt.site`. Existing server headers indicate PHP support, but PHP/cURL at the final folder must still be verified after upload.

The frontend, upgraded characters, rooms, music, SFX, styles and scripts are uploaded to your domain. The scoped `api/game.php` and `api/talk.php` gateways use the existing approved Sites backend and its D1 database. This preserves multiplayer, room persistence, chat, authorization and game rules. **Keep that Sites deployment active and public.** This is not a standalone replacement of the D1 backend with FTP files.

No credentials, database password, account token, npm installation or server build is required on your FTP host. The gateway only forwards two fixed game endpoints, validates same-origin browser requests, passes seat authorization, verifies upstream TLS, and returns no-store JSON. Static media are served directly by the host. Root asset paths have been scoped to `/arcanarchy/texas-fool-em/`; copied room links use that route.

## Post-upload checks

- Main page: https://games.devprez.com/arcanarchy/texas-fool-em
- Backend check: https://games.devprez.com/arcanarchy/texas-fool-em/api/game.php?lobby=1 (must return JSON with `tables`, not PHP source or HTML).
- Lore page: https://games.devprez.com/arcanarchy/texas-fool-em/universe/
- Audio manifest: https://games.devprez.com/arcanarchy/texas-fool-em/audio/manifest.json
- Existing game: https://games.devprez.com/arcanarchy/ (must remain unchanged).

Open a two-human table, copy its invite, join it from the phone, send a Table Talk message, start a hand and raise/call. Refresh both devices and confirm the room/environment and chip totals persist. On the phone, tap Audio settings, enable Ambient music, and confirm mute/unmute plus Music volume 0. Browser audio needs a tap; optional music remains off by default.

## Troubleshooting and rollback

- A 404 usually means the new folder was uploaded into the wrong web root or nested twice.
- A 503 mentioning cURL means the host must enable its PHP cURL extension. No game-file changes are needed.
- A JSON `Invalid seat token` error after creating a table can indicate the host strips the Authorization header; retain the included scoped `.htaccess` file and ask the host to pass Authorization to PHP.
- If `.htaccess` causes a 500, disable only the `.htaccess` inside this new folder and check the host's permitted directives. Do not edit the existing parent rules.
- Do not enable full-page caching for `.php` or HTML in this game folder.
- Rollback consists only of renaming/removing the new `texas-fool-em` folder. Existing Break the Wheel files are unaffected.
