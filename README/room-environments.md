# Shared room environments

The centralized catalog is `lib/room-environments.ts`. The four supplied WebPs are copied unchanged from `texas_fool_em_room_backgrounds_v2.zip` into `public/art/rooms/environments/`. Contact sheets, chip/UI guides, and comps were not used as production sprites in this focused room-state pass.

`createRoom` chooses one of the five stable IDs on the server. Both multiplayer and solo use this creation path. The existing serialized room record persists only `environmentId`; no schema migration or new service is needed. Joining, GET/reconnect reads, next hand, rematch, and reopening the lobby never select another environment. Legacy rooms with no ID resolve to The Observatory without a random draw or mutation.

GameStage resolves the shared ID into the background and exact HUD name. Backgrounds use cover sizing with preserved aspect ratio; baked-table environments use a bottom-anchored desktop zoom to bring their felt closer to the existing card plane. On phones cover remains unzoomed. When `includesTable` is true, the separate tabletop and both decorative rails are omitted, while all interactive cards, controls, personas, chat and scores remain mounted.

Validation: 49 unit checks, independent-client room lifecycle integration (five hands, refreshed reads, rematch), a five-hand solo match, and existing four-client multiplayer tests. Browser checks cover Observatory fallback/layers, Neon Spire HUD/background correspondence, refresh persistence, and 390px phone layout with no horizontal overflow.

Run the new integration check with:
`node --experimental-strip-types tests/room-environments.mjs http://127.0.0.1:5173`
