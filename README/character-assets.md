# Approved upgraded defaults

The four user-supplied production masters are used unchanged in public/art/characters/approved-masters/. Each retains its original 1254×1254 RGBA canvas.

- Fool: Magenta Fortune-Teller Fantasy Portrait.png
- Magician: Celestial Witch in Crimson and Gold.png
- High Priestess: Celestial High Priestess in Blue and Gold.png
- Empress: Enchanted Forest Queen Portrait.png (green botanical)

All four reaction states (default, smile, react, lose) resolve to the same upgraded default for each persona. Existing reaction events remain intact; later approved expressions require only asset mapping changes in lib/presentation/personas.ts. No older reaction art is used. Images are contained without masks or transparent-pixel trimming.

Solo games sample unused Arcana randomly, excluding the human persona. Three CPUs use all remaining Arcana in randomized seat order.
