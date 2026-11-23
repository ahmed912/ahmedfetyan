---
name: "content-board-builder"
description: "Use when building, changing or auditing Ahmed's content system boards in FigJam or Figma: flowcharts, maps, frameworks, persona chapters, the Week Engine, the master flower. Holds the layout, color, connector and verification rules so every build looks and reads the same."
---

# Content Board Builder

Builds and audits the visual side of Ahmed's LinkedIn content system. Content comes from the linkedin-content-coach skill and the hub notes; this skill decides how it looks and how it is checked.

## Roles
- Opus plans and audits. Sonnet builds (Figma writes). Never ask Ahmed for approval of Figma edits; he approved them all.
- Load figma:figma-use and figma:figma-use-figjam before any use_figma call. create_session first. Work in small batches.

## Files
- FigJam "Brand Script (SB7)" 5AMqs2LbPEP9JHxBqoHity
  - Page Brand Script: SB7 brandscript (source of truth), Content system 47:416, backup 39:258, archive 44:647 (never touch)
  - Page Persona bank: horizontal strip of chapters: 0 Week Engine 100:2166, Decision board 79:1434, Start here 79:1474, Flows 1 to 4 61:2993, Daily framework 70:921, B Builds 96:1539, Maps 73:1076, 4 persona chapters, New persona
  - Page Master flow: the flower (a duplicate of everything)
- Content Studio JoETndwAvLhNpGn3N99x8U: pillar pages with Sample posts, One Light visual library (brand assets)
- Specs: hub/persona-bank.md (v3 to v4.8), hub/master-flow.md, hub/sample-posts.md, hub/content-plan.md

## Two visual languages, never mixed
- Working documents (boards, flowcharts, maps): light mode, strong contrast, colorful, Inter in 4 weights (Extra Bold titles, Bold labels, Medium questions, Regular body), body text #111111, minimum 18 px.
- Brand assets (post images, carousels): One Light only: dark ground, one lit grayscale geometric render, one thin amber #FEA307 line, serif headline, mono label, one pattern (tiles, arcs or clutter to clarity).

## Color codes (strong / tint)
- Personas: Founders #1E5BB8, Executives #6B3FA0, Speakers #B5530C, Creative directors #0F766E, Start #2C2C2C, New #555555
- Persona sections: Trigger #9A6B00/#FFF4CC, Goals #1E7B34/#E3F5E7, Pains #B42318/#FDE7E5, Fears #6B3FA0/#EFE7FA, Myths #B5530C/#FFEBD9, Questions #1E5BB8/#E3EDFB, Objections #A3195B/#FBE4EF, Their words #0F766E/#DDF3F0, Success #2E7D32/#E8F5E9, Ready angles #2C2C2C/#EDEDED
- Builds: Relevance #B5530C, Authority #1E5BB8, Trust #1E7B34, Likability #A3195B, Action #2C2C2C
- Explanation callouts: #FFF4CC cards, Bold title + Regular text, max 280 px, dotted line to their node
- Yes chip green, No chip red

## Layout rules
- No sticky notes: rounded rectangles + text.
- Read by horizontal scrolling. Flowcharts are horizontal. Each persona fits one screen in 2 rows.
- Simplify: one card per section, bullets, arrows for answers, no row labels, one "+ add a line" per section.
- Phase bands with a timer chip when a flow has timed steps.
- Text is never rotated, even in radial layouts.
- Master flow is a flower: core (Foundation) in the middle, 5 petals on a pentagon clockwise from top (WHO, COLLECT, PLAN, MAKE AND SHIP, GROW), ring arrows outside, spokes from the core.

## Connector rules
1. No shared trunks: every branch has its own connector.
2. More than 2 branches: a stack of colored option chips, one short straight arrow from each chip to its target on the same row.
3. Yes leaves right, No leaves down, chip within 24 px of the shape.
4. Straight or single-elbow only. No crossings, nothing behind shapes. Loops above or below the main row.
5. If a link cannot avoid crossing, drop it and write "fed by: ..." in the target's callout.

## Safety
- Duplicates are made with clone, never move. Never delete or edit originals unless asked. Count nodes on source pages before and after.
- Don't move what Ahmed placed by hand; shift only what you must and say what moved.

## Verify before reporting
1. Close crops (get_screenshot, enableBase64Response true) of every decision area and every changed block; re-shoot after any fix.
2. No-crop check: every text node fits inside its shape; report the count and flagged count.
3. For duplicates: text node totals in sources equal totals in clones.
4. Report under 8 lines: node ids, counts, and anything not re-shot or not clean. Never claim a check you did not run.
