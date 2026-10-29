# Arcanarchy audio assets and integration

## Current delivery status
The approved launch candidate includes 12 short SFX files and the user's chosen
Parlor of Secrets music loop. See audio-launch-credits.md for sources and edits.
The existing audio service, controls and event routing are retained, with one
additional state-driven Major Arcana reveal cue. The scene layout is frozen.

## Exact paths
Provide real, cleared-for-use recordings/designs at these paths. All sound layers described below should be mixed into the corresponding single short file. Export MP3 without leading silence; keep tails short and peak headroom around −3 to −6 dBFS. Master the source files consistently; the manager applies additional conservative per-cue gains.

| Path under `public/` | Status | Sound brief |
| --- | --- | --- |
| `audio/sfx/card-deal-01.mp3` | Primary deal | 80–180 ms dry paper/card slap; close, tactile, no casino sparkle. |
| `audio/sfx/card-deal-02.mp3` | Optional variant | A different take of the same dry slap, consistent loudness. |
| `audio/sfx/card-deal-03.mp3` | Optional variant | Subtly different paper handling, same family. |
| `audio/sfx/card-deal-04.mp3` | Optional variant | Fourth alternate, same duration/loudness; do not use a new timbre. |
| `audio/sfx/card-reveal.mp3` | Reveal | 180–350 ms card flip or weightier placement, optional very quiet tonal tick. |
| `audio/sfx/ui-select.mp3` | Meaningful selection | 30–90 ms muted distressed-metal/mechanical click. No hover sound. |
| `audio/sfx/fold.mp3` | Fold | 100–250 ms downward paper flick/low muted click; final, not punitive. |
| `audio/sfx/fool.mp3` | Signature | 600–950 ms total. Card flip → metallic latch/scrape → short reverse swell/tonal bend. Strange and dramatic, not loud. Mix the layers into this file. Playback is capped at 1 second. |
| `audio/sfx/win.mp3` | Round win | 600–1200 ms, 2–3 consonant notes. Dark, elegant resolution; no jackpot jingle or long reverb. |
| `audio/sfx/loss.mp3` | Round loss | 350–800 ms low unresolved tone or muted descending gesture. Restrained and quieter than win. |
| `audio/sfx/notify.mp3` | Join / remote chat | 60–200 ms tiny dry bell/chime/click. Join and chat share it at different low gains. |
| `audio/music/table-ambience.mp3` | Optional music | One seamless 30–90 second loop: paper/metal ritual machinery, dark air, restrained tension. No prominent rhythm, melody, or slot-machine sparkle. |

Every cue is optional at runtime: a missing/failed file stays silent without interrupting the game. At least one deal file enables the deal cue; two to four enable randomized variants. Deal rate varies by ±2.5%; small variation on paper/click cues is similarly restrained. Musical win/loss/Fool cues are not pitch-randomized.

### Seamless ambience
Prepare a genuinely seamless source with matched head/tail level and waveform, no audible encoder padding, and no baked fade-out. The decoded AudioBuffer loops sample-accurately from zero to its duration with no timers/re-created sources at each boundary. Verify the actual MP3 through at least three loop boundaries in target browsers; a poorly prepared file cannot be made seamless by declaring `loop=true`. Music is off by default; when enabled, its default 18% slider level is additionally attenuated beneath SFX.

## Installing assets
1. Copy real files into the directories above with the exact filenames.
2. Run `node scripts/prepare-audio.mjs` for local preview, or build normally. The npm `prebuild` hook runs that script automatically for publication.
3. The script lists only real nonempty MP3 files in `public/audio/manifest.json`; it never creates audio. The manager accepts only its known catalog paths.
4. Refresh the page. Open Sound settings, interact to unlock audio, and check each cue. No hard-coded availability flag needs editing.

The launch manifest has 13 installed files. Only known catalog paths are fetched; missing files never produce repeated requests. If a listed file fails to fetch/decode later, it is marked unavailable and not retried every poll. Reload to retry after correcting the file/network issue.

## Architecture and behavior
- `lib/audio/manager.ts`: one lazy AudioContext; master, SFX, and music gain buses; cached fetch/decode; max six overlapping SFX; gentle gain changes; missing-file containment; music lifecycle; localStorage settings.
- `lib/audio/catalog.ts`: exact paths, per-cue gain/rate/duration limits, defaults.
- `lib/audio/events.ts`: pure authoritative-state observer. Stable keys use room, server-issued match ID, round, action/player identifiers. The manager deduplicates keys even if polling and move responses arrive twice or out of order.
- `lib/audio/index.ts`: the only event-to-playback bridge.
- `components/audio-runtime.tsx`: trusted pointer/keyboard activation, visibility/page lifecycle, no autoplay before interaction.
- `components/audio-controls.tsx`: gold/teal master mute, optional music switch, separate sliders, persistent settings, asset status.

No component creates an Audio element or node. Game update responses go through a single observer. Chat polling reports newly received remote messages through the same centralized bridge; first history batches and local messages are silent. The first snapshot after restore, a network failure, a long gap, or tab return is a silent baseline. Old cues are consumed/dropped rather than queued for unmute, asset loading, or reconnect. Background tabs silence music/SFX; returning does not replay missed events.

Game rule calculations, AI policy, and chat storage are unchanged. The sole server metadata addition is a new `matchId` on each start/rematch, which keeps sound IDs distinct across matches and prevents old-response replay. Existing saved rooms remain compatible.

## Controls
Storage key: `arcanarchy-audio-v1`. Defaults: master unmuted, SFX 65%, Music 18%, music disabled. A blocked localStorage does not break gameplay. Music may be muted independently, and zero SFX/Music values really silence that bus. Muting or hiding the page also stops pending/active SFX, so unmuting cannot reveal an old tail or scheduled outcome cue.

## Verification limits and references
Automated tests use in-memory fake Web Audio nodes/buffers to verify behavior; these are test doubles, not fabricated/shipped audio files. Browser tests verify controls, persistence, missing-file silence, reconnect, and continued gameplay. Actual timbre, perceived balance, pitch variation, and loop seam must be auditioned with the supplied files before describing this as an audible mix.

Implementation references: [Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices), [AudioBufferSourceNode looping](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/loop).
