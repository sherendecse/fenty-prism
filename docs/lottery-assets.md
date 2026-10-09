# Fortune draw assets

The transparent bamboo tube and single red stick in public/images/lottery were generated using OpenAI image generation on 2026-10-06 for this Site. Original requests: a gold tan bamboo divination tube containing many red sticks, and one matching red stick with a blank face. No reference image used. PNG outputs were trimmed to their alpha bounds, resized, and converted to WebP for animation.

The numbered draw and fictional four-line verses are entertainment. Matching runs locally from scenario, face contours, makeup experience, time budget, chosen and avoided color families, MBTI style cues and local favorites. No paid AI API calls or daily fortune claims are used.

A blank ivory die asset was generated on 2026-10-06; game-controlled pips are rendered over its face. One and four use red pips; other values use dark pips. Two independent random values map to 36 fictional bilingual interpretations.

## Moon-block sprites
Generated with built-in imagegen for the third surprise game: two matching red lacquer wooden jiaobei halves, flat and convex faces, warm gold-lit edges, isolated transparent background, no text. Source: exec-424d3956-a3bb-4ff9-a1b4-0f2a7ea89a13.png. Cropped to separate alpha-preserving WebP sprites at public/images/lottery/cup-flat.webp and cup-round.webp.

Updated convex sprites: generated red lacquer jiaobei with thick rounded sidewalls and a strongly domed back, transparent background. Source exec-cd9ae034-5621-42b5-b654-d5bafd8c9b94.png; alpha-trimmed and converted to cup-flat-v2.webp and cup-round-v2.webp. Horizontal proportions preserve visible volume.

Closed pair sprite generated with built-in imagegen on 2026-10-06: two thick red lacquer jiaobei pressed flat-face to flat-face, convex backs outward, upper-left three-quarter camera, crescent bulge to the right, distinct joining seam. Source exec-088db085-a52d-4759-a730-56d6e3114301.png, alpha-preserving resized WebP public/images/lottery/cup-closed-v1.webp. Used for initial shaking, crossfades into separate halves during the one-second drop.

Closed-pair v2: built-in imagegen used the supplied image(2).png as an angle reference, no hands or background retained. Diagonal upper-left to lower-right tips, oblique top view, two distinct rims. Source exec-2721dbe1-4b34-4c0e-8452-360b0e76e56b.png; cropped to alpha bounds and WebP. Explicit cup-left/cup-right classes prevent the closed sprite from displacing child-index animation selectors. Both halves stay visible throughout the same one-second drop.

Closed-pair v3: built-in imagegen precise-object edit with v2 closed-pair as target and original rounded red lacquer cup as material reference. Retained diagonal angle and two-piece seam; removed paint wear and exposed wood, restored smooth glossy red lacquer. Source exec-a2215717-8e8a-4966-99bf-6bdf34d7895c.png, alpha-trimmed resized WebP cup-closed-v3.webp. Shake centered lower; drop settles normal faces to zero rotation, standing-edge outcome is upright rather than diagonally tilted.
