# Launch audio sources and edits

Audio assets were prepared from the user's local downloads on October 28, 2026.
Original recordings remain outside the game. No unrelated commercial tracks,
voice recordings, or synthesized placeholder cues are included.

| Installed cue | Source recording | Author / source |
| --- | --- | --- |
| card-deal-01…04.mp3 | Playing cards being delt, ID 29099 | SomeoneCool15 / freesound_community, Pixabay |
| card-reveal.mp3 | Card Sounds, ID 35956 | henrygillard / freesound_community, Pixabay |
| fold.mp3 | shuffleandcardflip1, ID 40942 | freesound_community, Pixabay |
| ui-select.mp3 | Select click, 1109 | Mixkit |
| notify.mp3 | Interface option select, 2573 | Mixkit |
| win.mp3 | Page forward single chime, 1107 | Mixkit |
| loss.mp3 | Page back chime, 1108 | Mixkit |
| fool.mp3 | Card Sounds + Select click + Software interface remove 2576 + Page forward single chime | Derived composite of the above Pixabay/Mixkit recordings |
| omen-reveal.mp3 | Card Sounds + Page forward single chime | Derived composite |
| table-ambience.mp3 | Parlor of Secrets — Vintage Witchy Tarot Instrumental, 537898 | MoonPetalMedia, Pixabay; selected by the user |

Primary references:
- https://pixabay.com/sound-effects/film-special-effects-playing-cards-being-delt-29099/
- https://pixabay.com/sound-effects/film-special-effects-card-sounds-35956/
- https://mixkit.co/free-sound-effects/interface/
- https://pixabay.com/service/license-summary/
- https://mixkit.co/license/#sfxFree

The official Pixabay pages above identify the card recordings and their
Content License. Mixkit lists the interface recordings under its Sound Effects
Free License. The music attribution and ID are retained from the user-supplied
download filename; the item-specific music page could not be fetched during
this pass. No claim is made about automated Content ID behavior on video hosts.

Edits: selected and trimmed card transients; removed leading silence; short
edge fades and DC removal; conservative peak normalization; a low-frequency
cut on SFX; shorter/chambered win/loss cues; a mixed reversed recorded gesture
for Fool. All SFX are under 1.2 seconds. MP3 exports use 128 kb/s mono.

The chosen music uses a 62-second source excerpt starting at 20 seconds,
with a 2-second circular crossfade to create a 60-second stereo loop. Export:
160 kb/s MP3, approximately 1.2 MB. Decoded peak: 0.409; decoded loop boundary
sample delta: 0.000564 or less. Perceptual musical continuity should still be
judged by listening on the real phone/desktop test.

Music is off by default. Its 18% default slider value is additionally reduced
to one quarter on its bus. SFX default to 65%. Master mute and separate zero
levels persist per device. Hidden pages stop audio; returning does not replay
missed cues. The exact file manifest is public/audio/manifest.json.
