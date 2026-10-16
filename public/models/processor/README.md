# C2C processor visualization

Original procedural geometry and textures created for this project by scripts/bake-processor.mjs. No external model or texture is incorporated. Three.js (existing project dependency, MIT) is used as a geometry authoring tool.

Task 1.2 surfaces are authored by `scripts/bake-hero-surfaces.mjs`: 1024px WebP albedo, 256px indexed PNG roughness and tangent normals. Fine patterns represent macro floorplan, memory/interconnect regions, passivation and package routing, not visible individual transistors. The C2C laser mark is integrated into the brushed-metal albedo and finish; no floating label mesh is used.

The IHS now uses a satin titanium-silver visual finish with a cooler, darker base, softer studio reflection and low-contrast laser tone. Regenerate only its three maps with `node scripts/bake-hero-surfaces.mjs --metal-only`; the die, substrate and board maps remain untouched. Texture dimensions and the existing Standard material shader are unchanged.

`scripts/bake-hero-studio.mjs` authors the original neutral three-softbox PMREM at size 64, compressed as RGBA half-float CubeUV. It is exclusive to the Hero; the separate interactive hardware section retains its original environment. No visitor-side PMREM generation or postprocessing is required. Raster authoring uses the existing Sharp dependency (Apache-2.0).

The existing IHS includes a merged central underside thermal contact land. TIM and thin laminate bevels are limited by physical layer thickness. These local surface corrections do not change the authored explosion, seating or lid closure travel.

Representative educational package, not a specific commercial CPU or a C2C manufactured product. Heights and layer spacing are expanded for legibility; routing is schematic. Mesh dimensions: 4.06 square, approximately 0.4 assembled thickness including contacts.
