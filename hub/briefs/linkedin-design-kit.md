# Brief: "LinkedIn Design Kit" page in Content Studio

Runner: Sonnet. Supervisor: Opus. Figma file: Content Studio, fileKey JoETndwAvLhNpGn3N99x8U.
Load the figma:figma-use skill first, then create_session. Never move, edit or delete anything on other pages.

## Step 0: read the source of truth (copy, never invent)
- Page "Visual library · One Light": frame "One Light · Applications" (node 151:185) and the frame "Brand board v2 · One Light".
- Collect: every colour hex (ground, off-white, greys, amber #FEA307), fonts (headline serif, mono label, any body font), sizes, the amber line spec, and the brand elements (modular tiles, arcs, clutter-to-clarity, lit renders).
- If a token is missing, write it in the report; do not guess.

## Step 1: new page
Create page "LinkedIn Design Kit" at the end of the page list. Dark canvas background. Lay sections left to right, 400 px apart, each in a Section with a clear title:

1. **Colours**: one swatch per brand colour (name, hex, use). Also create them as local colour variables (collection "One Light") or paint styles.
2. **Type**: create local text styles (prefix "LI/"): Display, H1, H2, H3, Body L, Body, Label (mono, caps, tracking), Caption, Number (big thin). Show a specimen for each with name, font, size, line height, tracking. Sizes for a 1080 px canvas: Display 120, H1 96, H2 72, H3 56, Body L 40, Body 32, Label 22, Caption 20, Number 200. Use the brand fonts read in Step 0.
3. **Brand elements**: clone (never move) the amber line, tiles, arcs, clutter-to-clarity and 2 to 3 lit renders from the brand board; make each a component in a "Elements" group.
4. **Post frames**, each with layout grid (64 px margins, 12 columns, 24 gutter) and a visible "safe area" guide (64 px inset, 1 px, 20% off-white, locked, named "Guide · safe area"):
   - "Post · Portrait 4:5" 1080 x 1350
   - "Post · Square 1:1" 1080 x 1080
   - "Post · Landscape 1.91:1" 1200 x 627
   Each frame: dark ground + one example layout using the brand (label, amber line, headline, render), so it is a ready template.
5. **Featured + profile**:
   - "Featured · Link card" 1200 x 627 (LinkedIn link/featured thumbnail, real size)
   - "Profile · Banner" 1584 x 396 with guides for the photo overlap zone (bottom-left 568 x 264 on desktop) and mobile-safe centre.
6. **Carousel (continuous)**: one frame "Carousel · Canvas" 8640 x 1350 (8 slides of 1080 x 1350, no gaps) with a column layout grid (8 columns, 0 gutter, 0 margin) so slide edges are visible. Add 8 Slice layers named "Slide 01" to "Slide 08", each 1080 x 1350, aligned to the columns, export settings PNG 1x. Put one example image or render that spans across slides 1 and 2 to show the trick. Add a short note: "Design across the canvas; images can cross slide edges. Export the slices, then combine into a PDF for LinkedIn."
7. **Guide notes**: one text card per section (Inter or the body font, light text) explaining how to use it, in plain words.

## Check before reporting
Screenshot the page and each section. No overlaps, nothing outside its section, all text readable. Report: page id, section ids, styles created, any token not found. Max 10 lines.
