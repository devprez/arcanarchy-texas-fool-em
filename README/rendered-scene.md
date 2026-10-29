# Observatory presentation pass

The supplied Observatory, velvet tabletop, and matching v2 rail atlas are separate production PNG layers in `public/art/rooms/rendered`. Their original files are copied unchanged. Rail v1 remains supplemental reference. Legacy SVG room/table assets and earlier release archives are retained.

`lib/presentation/stage.ts` selects the room and rail regions. `app/rendered-scene.css` controls staging and responsive composition. `CHARACTER_OVERRIDES` in `lib/presentation/personas.ts` remains the replacement point for future transparent individual character assets. Atlas 2 is still canonical; it provides upper-body art, not full-body transparent sprites. Priestess frames include the available right-side artwork and Magician frames include the hat.

No game rules or multiplayer state were replaced. The Fool turns one private card wild once per match; it does not redraw a card. Scene dealer lines are derived from public state and do not write chat or replay events.
