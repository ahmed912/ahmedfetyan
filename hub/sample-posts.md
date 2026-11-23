# Sample posts, one per pillar (Content Studio)
Written 23 Nov 2026. Purpose: show how a finished post looks as text + One Light image inside a real LinkedIn post frame. No carousels.
Every sample is checked against the FigJam brand script (SB7 v1, 21 Nov 2026): hero, villain (clutter), internal fear, guide line, plan wording, CTAs and success line. Authority only uses brand script lines; no unconfirmed results.

=====================================================================
## BUILD SPEC (for the builder)
=====================================================================
File: Content Studio, fileKey JoETndwAvLhNpGn3N99x8U.
Placement: on each pillar page (P1 1:2, P2 1:5, P3 1:3, P4 1:4, P5 1:6), add a frame "Sample post" directly under the page Header and above everything else; shift the rest of the page down so nothing overlaps.
Inside "Sample post", left to right:
  A. LinkedIn post mock (width 552, light mode, like the real desktop feed card):
     - White card #FFFFFF, 8 px radius, 1 px #E0DFDC border, page around it #F4F2EE.
     - Header row: 48 px circle avatar (grey #D9D9D9 placeholder, or Ahmed's photo circle from the Covers page if present), name "Ahmed Fetyan" 14 px semibold #000000E6, under it the profile headline 12 px #00000099 truncated to one line: "Ex-doctor turned presentation strategist | Helping founders, executives & speakers resonate", under it "1d" 12 px #00000099. Right side: "+ Follow" 14 px semibold #0A66C2.
     - Post text 14 px, line height 20 px, #000000E6, font: system sans (Inter if no SF/Segoe). Show the FULL text, keep the blank lines.
     - After the line where LinkedIn's feed would cut (about 210 characters, around line 3), insert a thin dashed #0A66C2 line with a 11 px label "Feed shows '...more' here. Everything above must earn the click." This is a teaching marker, not part of the post.
     - Image: 4:5 (552 x 690), edge to edge in the card, the brand image (B) placed as an instance or clone scaled to fit.
     - Under the image: a row "Like · Comment · Repost · Send" in 14 px semibold #00000099, text only, no icons.
  B. Brand image at full size 1080 x 1350, built by cloning a layout from "One Light · Applications" (frame 151:185) and swapping text and the image fill with the named render from "Dark visual library" (frame 150:3052). Keep the layout's type, amber line and fade exactly.
  C. Annotation column (width 480), on the page's existing dark style, using the file's text styles: label + text rows for GOAL, HERO, FORMAT, IMAGE RECIPE, BRAND SCRIPT (which SB7 parts the post uses), then "WHY IT WORKS" with one row per craft place listed for that sample.
Gap 64 between A, B, C. No carousels. No icons. No em dashes.
Update 00 Start here page index with one line: "Each pillar page now opens with a Sample post."
Verify each page with get_screenshot (enableBase64Response true). Report node ids.

=====================================================================
## P1 WORK THAT WON (page 1:2)
=====================================================================
GOAL: Prove. HERO: Founders. FORMAT: text + 1 image (normally a real slide; this sample uses the brand layout).
BRAND SCRIPT: Problem (external), Guide (authority), Success (before and after: the order changed the first read).
IMAGE RECIPE: clone layout "01 LinkedIn post" (151:188). Image fill: render "P1 04 flow51" (149:766). Headline: "Investors fund problems they can picture." Top label stays "AHMED FETYAN · PRESENTATION STRATEGIST". Note under the image in the annotation: "The point lives in a slide (the $413B opening slide), so the real post shows that slide; placeholder text if the client prefers. The branded card here is only a demo."

POST TEXT:
$413 billion a year.
Spent managing a condition measured by guesswork.

That is the first slide of a pitch deck I designed for a health-tech startup working on diabetes.

Not the product. Not the team.
The cost of the problem.

Then the patient: 60% of diabetics are elderly, using a strip smaller than a fingernail.
Then the market.

By the time the product appeared, the investor was already looking for a solution.

Decks like this one are behind $57M in funding rounds.

Investors fund problems they can picture.

What does the problem cost in your industry?

#PitchDeck #HealthTech #PresentationDesign

WHY IT WORKS:
- Hook: a number plus stakes, no "I" in the first two lines.
- Specificity: 60%, elderly, a strip smaller than a fingernail.
- The turn: "By the time the product appeared, the investor was already looking for a solution."
- Guide line: the brand script authority line ($57M, "behind", not "raised"). Swap in this deck's own result only after the client confirms it in writing.
- Ending: the takeaway, then one soft question.

=====================================================================
## P2 BEFORE AND AFTER (page 1:5)
=====================================================================
BRAND SCRIPT: Problem (villain: clutter), Success (before and after), CTA (transitional: weekly before and after).
GOAL: Educate. HERO: Founders. FORMAT: text + 1 image showing before and after side by side. (The weekly carousel is the main format; this is the single-image version.)
IMAGE RECIPE: clone layout "02 Carousel content" (151:202) as a 1080 x 1350 frame. Replace the render area with two slide placeholders side by side (dark #222428 rectangles, 16:9, 460 wide each) with mono labels "BEFORE" and "AFTER" above them, and the small text "Client slide, placeholder text" under them. Image fill behind them: render "P2 01 flow0" (149:801) at low opacity only if it does not reduce text contrast. Headline: "Start where it's highlighted." Counter label "01 / 01" removed.

POST TEXT:
The answer was already highlighted.

A client sent me a slide called "Why sport".
One paragraph. A few words in it were already highlighted.

Clutter hides the point. Here the point was hiding in plain sight.

That was the clue.
The point was sitting in one sentence.

So that sentence became the headline.
The football and the goal frame carry the idea.
The rest of the paragraph moved to the speaker.

Same words. A different first read.

If a slide has highlighted words, start there. Someone is already telling you what matters.

New before and after every Thursday. Follow so you don't miss it.

#PresentationDesign #SlideDesign #PitchDeck

WHY IT WORKS:
- Hook: a small mystery, the reader wants to know which answer.
- Tension: the clue is named before the fix.
- Specificity: the slide's real name, "Why sport".
- The turn: "The point was sitting in one sentence."
- Ending: a rule they can apply today, then the transitional CTA.

=====================================================================
## P3 WIN THE ROOM (page 1:3)
=====================================================================
BRAND SCRIPT: Problem (villain: clutter, philosophical line), Failure ("judged in seconds"), Want (a clear yes).
GOAL: Educate. HERO: Founders. FORMAT: text + takeaway card. (Text only is also fine for this pillar.)
IMAGE RECIPE: clone layout "04 Quote post" (151:226), resized to 1080 x 1350 by extending the dark area below. Image fill: render "P3 02 flow89" (149:778). Headline: "Put your slides in the order your investor asks." Small line under it: "The Lesson".

POST TEXT:
Your investor is not reading to be impressed.

They are reading for one of two things.
A reason to say yes.
Or a reason to stop.

In the room or in their inbox, months of work get judged in seconds.

Most decks hand them the second one early.
Too many ideas on one slide. A number with nothing to compare it to. The product before the problem.

So build the deck around their questions, not your story's order.
Who has the problem? What does it cost? Why now? Why you?

Answer them in the order they will ask.

A good idea should never lose because it was explained badly.

What question do investors ask you first?

#PitchDeck #Startups #Founders

WHY IT WORKS:
- Hook: breaks a belief (the myth "investors want to be impressed").
- Rhythm: three short lines that build tension.
- Specificity: three concrete mistakes, not "bad design".
- The turn: "build the deck around their questions, not your story's order."
- Ending: one question they can answer from their own meetings.

=====================================================================
## P4 HOW I WORK (page 1:4)
=====================================================================
BRAND SCRIPT: Plan (Talk, Shape, Win, word for word) + one promise, CTA (direct: Book a call).
GOAL: Sell. HERO: Founders and leaders (executives and teams). FORMAT: text + branded image. CTA: Book a call.
IMAGE RECIPE: clone layout "06 Deck section divider" (151:248) re-cut to 1080 x 1350 (giant "01" top left, render lower right). Image fill: render "P4 01 flow29" (149:768). Top label: "TALK · SHAPE · WIN". Headline: "A deck is decided in the text." 

POST TEXT:
This project started with a text document and a deadline.

No brand. No visuals.
The numbers were marked 00 because they were not final yet.

Before I designed anything, I read it the way the audience would.
I marked what a reviewer must see first.
Then what supports it.
Then what can wait.

That became the order of the deck.
Colour, type and imagery came after.

A deck is decided in the text, before the first slide.

Every project with me runs the same way.
Talk: book a call.
Shape: we shape your story.
Win: you walk in ready.
You get a clear scope and timeline before you pay anything.

Have a document that needs to become a deck? Book a call. Link in the comments.

#PresentationDesign #PitchDeck #CompanyProfile

WHY IT WORKS:
- Hook: a situation every reader recognises.
- Specificity: "numbers marked 00".
- The turn: "A deck is decided in the text, before the first slide."
- Guide line: the plan and one promise from the brand script.
- CTA: the one direct CTA of the week.

=====================================================================
## P5 MY PATH (page 1:6)
=====================================================================
BRAND SCRIPT: Guide (empathy line, word for word), identity (ex-doctor turned presentation strategist).
GOAL: Connect. HERO: Founders. FORMAT: text + one personal photo (this sample uses a render until the photo exists).
IMAGE RECIPE: clone layout "08 Featured" (151:263) re-cut to 1080 x 1350, or layout "01 LinkedIn post" (151:188). Image fill: your portrait if available, else render "P5 04 flow21" (149:787). Headline: "Listen fully before you decide anything."

POST TEXT:
Listen fully before you decide anything.

Medical school gave me that habit.
I started design in 2022, and it came with me.

In medicine, you do not treat before you understand the patient.
In design, I do not choose a colour before I understand the audience.

On a pitch for a sports agency, that habit shaped everything.
I listened first.
The shirts, the stadium lines, the two concepts all came from what that audience already loved.

The message the client sent after delivery is the reason I stayed in this work.

I know how it feels when months of work come down to twenty minutes and a few slides.
That is why I listen first.

Good design starts with good questions.

#CareerChange #PresentationDesign

WHY IT WORKS:
- Hook: a lesson line, not "I started design in 2022".
- The scene: medicine and design side by side in two parallel lines.
- Specificity: shirts, stadium lines, two concepts.
- Voice: calm, no bragging, no CTA.
- Ending: one sentence that carries the identity.

=====================================================================
## UPDATE 23 Nov: add brand patterns and lines to every brand image (B frames)
=====================================================================
Source: Content Studio "Brand board v2 · One Light" (78:2): T08 Pattern (78:8, modular tiles: flat tiles, one lit), T09 Form (78:9, arcs continue the curve: thin concentric arc lines), T05 Clutter to clarity (78:10, scattered slide fragments, one amber curved line leading to the lit sphere).
Rules: one pattern or line system per image. Strokes 1 to 2 px in Slate #404B50 or Mist #708290 at 40 to 70% opacity, tiles in #222428 / #2A2D31. Never behind the headline or labels; keep text contrast unchanged. Amber stays a single line (the existing short line above the headline, or the one curved line in Clutter to clarity), never more.
Per image:
- P1 The Work (186:3): T09 arcs. 4 to 6 thin concentric arcs continuing the curve of the sphere render outward, upper right area.
- P2 The Change (187:3): T05 Clutter to clarity. Small scattered slide fragments (outlined rectangles, mini bars) around the BEFORE slide, one amber curved line flowing from BEFORE to AFTER.
- P3 The Lesson (188:3): T08 modular tiles. A band of flat modular tiles (squares, quarter circles, half circles) along the top or right edge, exactly one tile lit (lighter #D9D6CC with soft shadow).
- P4 Working with me (190:3): T09 arcs as thin lines framing the giant "01", plus a faint baseline grid of 3 horizontal hairlines under the steps render.
- P5 My Story (190:66): a single horizon hairline across the image at the lower third (Mist, 1 px) and 3 thin arcs rising from it, quiet.
Copy the vector shapes from 78:8, 78:9, 78:10 where possible instead of redrawing.
Also add one row "PATTERN" to each annotation column C naming the pattern used and why.
