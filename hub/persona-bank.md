# Persona bank (content for the FigJam "Persona bank" page)
Written 23 Nov 2026. Source: brand script v1 + Content Studio Brand page Part 1. Draft lines are educated guesses: replace them with real client words over time.
Heroes from the brand script: Founders, Executives and teams, Speakers. Peer persona: Creative directors.

=====================================================================
## BUILD SPEC (for the builder)
=====================================================================
Where: FigJam fileKey 5AMqs2LbPEP9JHxBqoHity. New page "Persona bank" if the API allows pages; else one new top-level section "Persona bank" placed to the right of everything, starting at the same top edge.
Layout: COLUMNS SIDE BY SIDE, each read top to bottom. One column per compartment, never one long strip:
  Column 1 "Start here": page title, How to use this page, Content goals and formats, Branded image cards.
  Column 2 Founders. Column 3 Executives and teams. Column 4 Speakers. Column 5 Creative directors. Column 6 New persona + New field templates.
  Each column 1200 wide, 160 px gap between columns, all columns top-aligned. Each column is its own frame/section, height hugs its content (no empty dark space at the bottom).
  Inside a column everything stacks vertically; never place two sections side by side inside a column.
  Drop the jump list; the column titles are the navigation.
Elements: text layers and rounded rectangles only. No sticky notes. No icons.

Brand reference (the ONLY direction): Content Studio page "Visual library · One Light", frame "One Light · Applications" (node 151:185). Dark ground, off-white serif headlines, small grey mono labels, a short thin amber line (about 120 px) sitting just above each headline. No cream pages, no brown, no fills in amber.

Text hierarchy (exactly 5 levels, use consistently):
- L1 Page title: 120 px, serif (Thmanyah Serif Display, stand-in DM Serif Display), Cream.
- L2 Persona title / major block title: 72 px, serif, Cream.
- L3 Section title (Trigger moments, Goals, ...): 40 px, serif, Cream.
- L4 Label: 20 px, IBM Plex Mono Medium, UPPERCASE, tracking +8%, Cream at 70% opacity. Never longer than a few words.
- L5 Body: 24 px, IBM Plex Sans Regular, line height 140%, Cream. Max 80 characters per line.
Max 3 text styles per box (label + title + body). Everything left-aligned.
Spacing: 160 px between personas, 64 px between sections, 24 px between rows, 40 px padding inside boxes.

Color and contrast (WCAG AA minimum):
- Page ground: Basalt #1A1B1D.
- Cards and rows: #222428 fill, 1 px #404B50 (Slate) border, 16 px corner radius.
- Persona header: no band. Amber line, then the L2 title on the Basalt ground, like the layouts.
- Text: Cream #E8E2D0 on Basalt (about 13:1). Mist #708290 only for text 24 px and up, never for body.
- The amber line: #FEA307, 2 px, 120 px long, placed just above each L1 and L2 title, exactly as in the Applications layouts. Nowhere else. Never text, never a fill.
- No drawn shapes, patterns or images. The page is a working document: type, lines and cards only.
- "Add new" rows: transparent fill, 2 px dashed Mist border, placeholder text Cream at 60%, 24 px.
- Do not use color alone to carry meaning: every box also has a text label.


### BUILD SPEC v3 (23 Nov, overrides every color and type rule above)
Ahmed: the One Light monochrome page is hard to read. He likes LIGHT MODE, STRONG CONTRAST, COLORFUL. Body text #111111 (not grey), labels and titles in the strong colors only (never the tint), section tints visible but light enough for 7:1 body contrast, white row cards, 2 px borders in the strong color around each section block. This page is a working document, not a brand asset: use FigJam colors and real hierarchy.
Background: FigJam's light canvas. Columns keep the same layout (6 columns side by side, top to bottom).
Font: Inter. Four weights, used consistently:
- L1 page title: 96 px, Extra Bold (or Black), #1E1E1E.
- L2 column title (persona name): 64 px, Extra Bold, white on the persona header band.
- L3 section title: 36 px, Bold, in the section's strong color.
- L4 row label: 16 px, Semi Bold, UPPERCASE, +6% tracking, in the section's strong color.
- L5 body: 22 px, Regular, #1E1E1E, line height 150%.
- Truth or answer text under a myth, question or objection: 20 px, Medium, #444444, starting with "Truth:" / "Answer:".

Persona colors (header band fill, white title, all pass AA):
- Start here: #2C2C2C. Founders: #1E5BB8 (blue). Executives and teams: #6B3FA0 (violet). Speakers: #B5530C (orange). Creative directors: #0F766E (teal). New persona: #555555.
- Header band: full column width, 200 px tall, 24 px radius, persona name + one-line "who" in white Regular 22.

Section colors (same in every persona, so they become a code): strong color for title, label and a 8 px left bar; tint as the section block fill.
| Section | Strong | Tint |
|---|---|---|
| Who / Brand script want | #555555 | #F1F1F1 |
| Trigger moments | #9A6B00 | #FFF4CC |
| Goals | #1E7B34 | #E3F5E7 |
| Pains (external) | #B42318 | #FDE7E5 |
| Fears (internal) | #6B3FA0 | #EFE7FA |
| Beliefs and myths | #B5530C | #FFEBD9 |
| Questions they ask | #1E5BB8 | #E3EDFB |
| Objections to hiring | #A3195B | #FBE4EF |
| Their words | #0F766E | #DDF3F0 |
| Success picture | #2E7D32 | #E8F5E9 |
| Ready angles | #2C2C2C | #EDEDED |
Rows: white cards (#FFFFFF, 12 px radius, 1 px #E0E0E0 border) inside the tinted section block, label above the text.
"Add new" rows: white, 2 px dashed in the section's strong color, placeholder "Add new..." in #6B6B6B.
Start here column: add a "Color key" block listing every section with its color chip and name (chip = 24 px rounded square).
Keep all text exactly. No stickies, no icons, no em dashes.

Structure top to bottom:
1. Page title "Persona bank" + one line "Read this first every week, then the pillars, then the Content Studio."
2. Block "How to use this page" (section 1 below).
3. Block "Content goals and formats" (section 2) as a table.
4. Block "Branded image cards" (section 3).
6. Four persona blocks, each starting with a Basalt header band, sections in the order given, each section ending with 2 empty "Add new" rows.
7. Block "New persona (empty template)" with every section title and 2 empty rows each.
8. Block "New field" with 3 empty rows labeled "Field name / What goes here / Example".
Verify with screenshots at 100% zoom on a phone-width crop and a full-height crop. Report the node ids.

=====================================================================
## 1. How to use this page
=====================================================================
Weekly order: 1 this page, 2 the pillar cards in the Content system, 3 the Content Studio file.
To make a post: pick one line from one persona section. Pick a pillar. Pick the goal. The goal picks the format.
Every Sunday: add at least 3 new lines from the week's calls, DMs, comments and Upwork messages, in the client's own words.
Mark a line "used" with the date when it becomes a post. Reuse a line after 3 months with a new angle.

=====================================================================
## 2. Content goals and formats
=====================================================================
| Goal | What the post does | Best format | Usual pillars | Ends with |
|---|---|---|---|---|
| Educate | Teaches one rule they can apply today | Carousel (8 slides). Short version: text + takeaway card | Before and after, Win the room | The lesson |
| Prove | Shows that your work wins | Text + 1 or 2 real slide images. Monthly: 5-slide case carousel | Work that won | The result |
| Connect | Builds trust in you as a person | Text only, or text + personal photo | My path, Arabic lane | A feeling, no ask |
| Sell | Invites them to work with you | Text + branded image (question card or takeaway card), or a 60 s video | How I work | Book a call |
| Spark | Starts a conversation, widens reach | Text only, a clear opinion | Win the room, Arabic lane | One question |
Rule: one goal per post. If a post tries to educate and sell, it does neither.
Weekly mix: 2 Educate, 1 Prove, 1 Sell, 1 Connect or Spark.

=====================================================================
## 3. Branded image cards (your brand identity)
=====================================================================
Use when a text post has no real slide to show. Built on the One Light Applications layouts: dark ground, one lit grayscale render from your Visual library (pick from the pillar row), a fade into the dark, the short amber line, serif headline in off-white, small mono label. Use layout 01 (LinkedIn post) or 04 (Quote post) as the template.
- Question card: the post's opening question as the serif headline. Example: "What does a winning deck feel like?" Mono label: the topic in 3 words.
- Takeaway card: the post's takeaway sentence as the serif headline. Example: "Put your slides in the order your investor asks." Mono label: "WIN THE ROOM".
- Number card: one big number in Plex Sans Thin (96 px and up) + one line saying what it counts + a mono source line. Use only with a source.
Rules: one idea per card. 12 words max on the headline. Choose by where the point lives: in a slide → show the slide; in an idea or sentence → branded card. Showing permission is a separate check (placeholder text if needed). Arabic posts get the Arabic mirror cover.

=====================================================================
## PERSONA 1. FOUNDERS
=====================================================================
Who: founders and CEOs of startups, pre-seed to Series A, worldwide with a strong Gulf base. Raising money or selling to big clients. Busy, product-minded, short on time.
Brand script want: a clear yes in the room that matters.

### Trigger moments
- A first investor meeting just got booked.
- An accelerator or demo day date is announced.
- An investor says "send me your deck".
- The round closes in 6 weeks and the deck is still a Google Doc.
- A big client asks for a company profile before a meeting.

### Goals
- Get the next meeting, then the funding.
- Look ready and serious next to bigger competitors.
- Explain a complex product in one breath.
- Stop rebuilding the deck before every meeting.

### Pains (external)
- Slides crammed with everything they know.
- The story starts with the product, not the problem.
- Numbers with no comparison or context.
- An AI-made deck that looks like everyone else's.
- No visual system: every slide looks different.

### Fears (internal)
- Looking unprepared or amateur in front of investors.
- Months of work judged in a few minutes.
- A weaker idea with a clearer deck wins the money.
- "I know my idea is good, but I can't make them see it."

### Beliefs and myths (and the truth)
- "More slides show more effort." Truth: every slide must earn its place.
- "Investors read every word." Truth: they skim for reasons to continue or stop.
- "The demo will carry it." Truth: the demo only lands if the problem landed first.
- "AI can make my deck now." Truth: AI makes slides, not decisions about what matters.
- "Design is decoration, numbers decide." Truth: design decides which number gets seen.

### Questions they ask (and the answer direction)
- How many slides should a pitch deck have? Direction: as many as the investor's questions, usually 10 to 15.
- Problem or solution first? Direction: problem, in the investor's language.
- Same deck to send and to present? Direction: no. The sent deck must work without you.
- How do I show small traction? Direction: show the trend and the speed, not the size.
- Can't I just use a template? Direction: a template fixes looks, not order.

### Objections to hiring (and your answer)
- "Too expensive for a startup." Answer: clear scope and price before you pay anything, 50% to start.
- "No time to brief a designer." Answer: one call, then I shape the story.
- "A designer won't get my business." Answer: I start from your investor's questions, not from colors.
- "AI is faster." Answer: AI speeds my work. The story, hierarchy and cuts stay human.

### Their words (use in hooks)
- "Make it look professional."
- "Investor-ready."
- "I need it by Thursday."
- "It doesn't feel right but I don't know why."
- "Can you make it pop?"

### Success picture
They walk in calm. The investor asks follow-up questions instead of skimming. They get the second meeting and send the deck with pride.

### Ready angles
- Myth "More slides show more effort" / Win the room / Spark / text only.
- Question "Problem or solution first?" / Win the room / Educate / carousel.
- Objection "AI is faster" / How I work / Sell / text + takeaway card.
- Trigger "send me your deck" / Before and after / Educate / carousel.

=====================================================================
## PERSONA 2. EXECUTIVES AND TEAMS
=====================================================================
Who: C-level leaders, directors, strategy and BD teams in companies, government entities and agencies. They present to boards, ministries and big clients: C-level decks, reports, bid books, company profiles.
Board note: high stakes, need impression, clear data viz.

### Trigger moments
- A board meeting or quarterly review is on the calendar.
- A tender or bid deadline is announced.
- A minister, VIP or major client visit is confirmed.
- A new strategy must be presented to the whole company.
- The annual report is due.

### Goals
- Get approval and a clear decision.
- Look like a market leader, not one more vendor.
- Make dense data readable in seconds.
- A deck the team can reuse after the meeting.

### Pains (external)
- 60 slides of data, no clear message.
- Every department adds its own slides.
- Charts that show everything and prove nothing.
- Inconsistent slides made by many hands.
- Arabic and English versions that do not match.

### Fears (internal)
- The board nods, decides nothing, and the idea fades in follow-up emails.
- Being questioned on a number they cannot defend.
- Looking less professional than a competitor in a bid.
- Their own reputation tied to one presentation.

### Beliefs and myths (and the truth)
- "Executives want all the data." Truth: they want the one insight and the proof behind it.
- "A report must be long to be serious." Truth: it must be easy to find things in.
- "Our brand template is enough." Truth: a template is not a story.
- "Arabic is the English version flipped." Truth: right to left changes the whole page.

### Questions they ask (and the answer direction)
- How do we fit everything in? Direction: main deck plus appendix.
- Which chart should we use? Direction: write the comparison first, it picks the chart.
- How do we keep 10 contributors consistent? Direction: a small system of slide types.
- Can it work in Arabic and English? Direction: design both paths from the start.

### Objections to hiring (and your answer)
- "Our team or agency can do it." Answer: I work with your team, scope agreed first.
- "Procurement takes too long." Answer: clear scope, timeline and NDA up front.
- "Our data is confidential." Answer: NDA when you need it, you decide if it is ever shown.
- "We need it in 3 days." Answer: updates at every step, feedback windows throughout.

### Their words
- "The board needs to see the big picture."
- "Make it executive."
- "One page summary."
- "It has to look world class."
- "Can we make the data clearer?"

### Success picture
The room sees what they see and decides. The deck is quoted after the meeting. The team reuses the system for the next one.

### Ready angles
- Myth "Executives want all the data" / Win the room / Spark / text only.
- Question "Which chart should we use?" / Before and after / Educate / carousel.
- Pain "Charts that prove nothing" / How I work / Educate / text + process screenshot.
- Objection "Our data is confidential" / How I work / Sell / text + takeaway card.

=====================================================================
## PERSONA 3. SPEAKERS
=====================================================================
Who: keynote speakers, event speakers, webinar hosts, thought leaders. TED style talks, conferences, panels.
Board note: TED style, seek simplicity, creativity is key.

### Trigger moments
- Accepted to speak at a conference.
- A keynote or TEDx date is confirmed.
- A webinar series is launching.
- The organizer asks for slides by a deadline.

### Goals
- The audience remembers one idea and acts on it.
- Slides that support them, not compete with them.
- Look and feel distinctive on stage.
- Be invited again.

### Pains (external)
- Slides full of their speaker notes.
- Bullet points the audience reads instead of listening.
- Generic stock photos.
- Slides that do not work on a big screen or a small laptop.

### Fears (internal)
- The audience looks at their phones.
- Forgetting the flow and reading from the slides.
- Being forgettable among 20 speakers.

### Beliefs and myths (and the truth)
- "Slides are my notes." Truth: notes belong to the speaker, slides belong to the audience.
- "More visuals means more engaging." Truth: one strong image beats ten.
- "Creative means complex." Truth: on stage, simple is creative.

### Questions they ask (and the answer direction)
- How much text per slide? Direction: one idea, often a few words.
- How many slides for 20 minutes? Direction: depends on rhythm, not minutes.
- Should I use video? Direction: only if it says what words cannot.
- How do I make a talk memorable? Direction: one idea, repeated, with one image.

### Objections to hiring (and your answer)
- "I'm the content, slides don't matter." Answer: the right slides make you the focus.
- "I always change my talk last minute." Answer: feedback windows throughout, a system you can edit.
- "I just need it to look nice." Answer: nice is not remembered. One clear idea is.

### Their words
- "TED style."
- "Clean and minimal."
- "I want it to feel different."
- "Don't make it look corporate."

### Success picture
The audience quotes their one line after the talk. Organizers invite them back. They feel free on stage, not tied to the screen.

### Ready angles
- Myth "Slides are my notes" / Win the room / Spark / text only.
- Question "How much text per slide?" / Before and after / Educate / carousel.
- Success picture / Work that won / Prove / text + stage photo or slides.

=====================================================================
## PERSONA 4. CREATIVE DIRECTORS (peer persona)
=====================================================================
Who: creative directors, studio leads and senior designers. They hire freelancers or send overflow work. They care about craft, process and AI workflow.
Brand script: second brand script later. For now, craft posts in How I work.

### Trigger moments
- A studio has more deck work than its team can handle.
- A pitch deadline lands on a busy week.
- A client needs a bilingual Arabic and English deck.
- They need a presentation specialist, not a generalist.

### Goals
- A freelancer they trust to deliver at their standard.
- Work that needs few revisions from them.
- Bilingual and data-heavy decks done well.
- Use AI without losing quality.

### Pains (external)
- Freelancers who design without understanding the story.
- Missed deadlines and silence.
- Arabic layouts done by designers who don't read Arabic.
- Messy files nobody else can edit.

### Fears (internal)
- A freelancer damaging their client relationship.
- Their name on work below their standard.

### Beliefs and myths (and the truth)
- "Presentation design is junior work." Truth: it decides deals.
- "AI will replace deck designers." Truth: it replaces layouts, not judgment.
- "Any designer can do Arabic." Truth: RTL is its own craft.

### Questions they ask (and the answer direction)
- How do you set up files for a team? Direction: named styles, role-named layers, a grid.
- How do you use AI without losing quality? Direction: AI follows the system, you make the decisions.
- How do you handle RTL? Direction: design the reading path first.

### Objections to hiring (and your answer)
- "Freelancers are unreliable." Answer: updates at every step, video walkthrough with delivery.
- "Will you respect our process?" Answer: I work inside your system and files.
- "Can you work white label?" Answer: your work stays yours, shown only if you decide.

### Their words
- "Overflow."
- "Pixel perfect."
- "Clean handoff."
- "Can you match our style?"

### Success picture
They hand over a brief and get back work they would sign. You become their first call for decks.

### Ready angles
- Myth "AI will replace deck designers" / How I work / Spark / text only.
- Question "How do you handle RTL?" / How I work / Educate / carousel or Arabic lane.
- Pain "Messy files" / How I work / Educate / text + file screenshot.

=====================================================================
## NEW PERSONA (empty template)
=====================================================================
Who / Brand script want / Trigger moments / Goals / Pains / Fears / Beliefs and myths / Questions they ask / Objections to hiring / Their words / Success picture / Ready angles. Two empty "Add new" rows under each.

=====================================================================
## NEW FIELD (empty template)
=====================================================================
Three rows: "Field name", "What goes here", "Example". For anything that does not fit above.

=====================================================================
## FLOWCHARTS (new column "How to make a post", placed right after "Start here")
=====================================================================
Build with FigJam diagram shapes and connectors (load figma-generate-diagram skill and use generate_diagram, or native FigJam shapes). Top to bottom flow inside the column. Use the v3 colors: start/end nodes #2C2C2C with white text, steps white with 2 px #1E5BB8 border, decisions as diamonds with #FFF4CC fill and #9A6B00 border, "no" paths in #B42318, "yes" paths in #1E7B34. Labels Inter, 20 px min.

### Flow 1. From idea to post
Start: raw material (a project, a question someone asked, a comment, a DM, an old project)
→ Who sat in the client's chair? Pick the persona
→ Pick one line from that persona's bank (trigger, pain, fear, myth, question, objection)
→ Pick the pillar
→ Pick ONE goal
→ Decision "Goal?": Educate → carousel (or text + takeaway card) | Prove → text + 1 or 2 real slides | Connect → text only or personal photo | Sell → text + branded image or 60 s video | Spark → text only
→ Write the skeleton: hook, proof, one guide line, ending, one CTA
→ Apply the 5 moves: hero's moment first, withhold, turn on its own line, brand script proof only, cut design explanations
→ Pre-publish check (Flow 3)
→ Schedule in the slot (08:30 Egypt, Wed 15:30)
→ Post, stay online 60 min, reply to every comment
End: log results, mark the bank line "Posted"

### Flow 2. Which image? (slide or branded image)
Start: the post needs an image
→ Decision "Where does the point live?"
   In a slide (proof, a before and after, a chart, a craft detail) → SLIDE → then "Can this slide be shown as is?" no → use placeholder text or rebuild it → End
   In an idea or a sentence (lesson, myth, question, story, process) → BRANDED IMAGE → Decision "How does the post work?"
      Opens with a question → Question card
      One sourced number carries it → Number card
      Ends on a lesson → Takeaway card
      All cards → One Light layout 01 or 04, render from the pillar row, amber line above the headline → End
   In a person or a moment of my story → PERSONAL PHOTO → End
   Text-only post (Win the room, Spark) → NO IMAGE → End

### Flow 3. Pre-publish check
Start: draft ready
→ "Hero's problem in lines 1 and 2?" → "Visual proof, not just words?" → "Exactly one guide line?" → "Do lines 1 to 3 earn the ...more?" → "Helps a decision maker see the insight and decide?" → "Exactly one CTA?"
Every "no" → Fix that one thing → back to Start
All "yes" → Publish

### Flow 4. The weekly cycle (a loop)
All week: add lines to the bank after every call, DM and comment
→ Sunday: plan 5 post cards (45 min)
→ Sunday or Monday: write 4 posts (2 h)
→ Tuesday: build the carousel (90 min)
→ Daily: publish at the slot + 5 comments on founders' posts (20 min)
→ Thursday afternoon: review the numbers, change ONE thing (20 min)
→ loops back to "All week"

=====================================================================
## MAPS AND FRAMEWORKS (new column "Maps and frameworks", placed right after "How to make a post")
=====================================================================
Ahmed learns best from maps, flowcharts and frameworks. Visual first, words short. Same v3 colors and Inter weights. Each block: L3 title, one-line caption, then the visual.

### Map 1. The brand system (mind map)
Center node (dark #2C2C2C, white text): "North Star: help decision makers see the one insight that matters, and design it so the decision is obvious."
Branch A "Brand script" → Hero (founders and leaders, want: a clear yes) · Villain (clutter) · Guide (empathy + 3 authority lines) · Plan (Talk, Shape, Win) · CTA (Book a call / weekly carousel) · Failure (judged in seconds) · Success (you win the day)
Branch B "Personas" → Founders · Executives and teams · Speakers · Creative directors (each node in its persona color)
Branch C "Pillars" → Work that won · Before and after · Win the room · How I work · My path · My thinking (Arabic)
Branch D "Goals and formats" → Educate: carousel · Prove: text + real slides · Connect: text or photo · Sell: branded image or video · Spark: text only
Branch E "Brand look" → One Light: dark room, one lit form, amber line, serif headline, mono label

### Framework 1. SB7 as a story strip (7 numbered boxes left to right, wrapping to 2 rows if needed)
1 A character (founders and leaders) → 2 has a problem (clutter hides the point) → 3 meets a guide (I know how it feels; $57M, 6 countries, Top 1%) → 4 who gives them a plan (Talk, Shape, Win) → 5 and calls them to action (Book a call) → 6 that helps them avoid failure (judged in seconds) → 7 and ends in success (you win the day)

### Framework 2. Post skeleton (5 stacked bars, widest at top, like a funnel)
Hook (villain or fear, never "I") → Proof (real slide, before and after, result) → Guide line (empathy OR one authority fact) → Ending (stakes or success) → CTA (one only)
Side note: "Lines 1 to 3 must work alone. LinkedIn cuts after about 3 lines."

### Framework 3. The 5 moves (5 numbered cards in a row)
1 Start from the hero's moment · 2 Withhold: say what it was not first · 3 The turn gets its own line · 4 Proof only from brand script lines · 5 Cut sentences that explain the design

### Framework 4. The 7 craft places (a scorecard grid, 7 rows x columns 1 to 5)
Hook · Tension · Specificity · The turn · Voice · Rhythm · Ending. Each row: name, one-line rule, five empty score boxes.

### Framework 5. Persona x pillar matrix (grid, rows = 4 personas in their colors, columns = 5 pillars)
Each cell: one ready angle in 8 words or fewer, taken from the persona's "Ready angles" or myths. Empty cells say "Add an angle".
Founders: Work that won "The $413B opening slide" · Before and after "Problem or solution first?" · Win the room "More slides show more effort" · How I work "AI is faster? Not the decisions" · My path "Listen fully before you decide".
Executives and teams: Work that won "The bid book's second read" · Before and after "Which chart should we use?" · Win the room "Executives want all the data" · How I work "Our data is confidential" · My path "Add an angle".
Speakers: Work that won "Add an angle" · Before and after "How much text per slide?" · Win the room "Slides are my notes" · How I work "Add an angle" · My path "Add an angle".
Creative directors: Work that won "Add an angle" · Before and after "Add an angle" · Win the room "Add an angle" · How I work "AI will replace deck designers" · My path "Add an angle".

### Framework 6. Weekly rhythm as a calendar strip (5 day columns Sun to Thu)
Each day: pillar (colored chip), format, Egypt time. Sun: Win the room or My path, 08:30 · Mon: Work that won, 08:30 · Tue: Win the room, 08:30 · Wed: How I work, 15:30 · Thu: Before and after carousel, 08:30. Under the strip: "+1 Arabic post any day 08:30. No Friday."

=====================================================================
## DAILY FRAMEWORK FLOWCHART (first and largest block in "How to make a post")
=====================================================================
Title: "Daily framework: a post from scratch". Caption: "About 60 minutes. Follow the arrows every posting day."
Top to bottom flow. Each step node shows the step name (Bold) + time chip (e.g. "5 min"). Grouped into 5 colored phases with a phase label on the left:
PHASE 1 CHOOSE (blue #1E5BB8) · PHASE 2 FIND (orange #B5530C) · PHASE 3 WRITE (violet #6B3FA0) · PHASE 4 CHECK (red #B42318) · PHASE 5 SHIP (green #1E7B34).

Start: "Open the Persona bank and today's slot"
Decision "What day is it?"
  Sun → Win the room, or My path every other week · 08:30
  Mon → Work that won · 08:30
  Tue → Win the room · 08:30 (also build Thursday's carousel today, 90 min)
  Wed → How I work · 15:30
  Thu → Before and after carousel (already built Tue) → jump to PHASE 4
  Fri or Sat → No post. Capture lines and rest → End
PHASE 1 CHOOSE
  Decision "Anything new from yesterday? (call, DM, comment, Upwork)" yes → "Add it to the bank in their words" (3 min) → continue; no → continue
  "Pick the persona: who sat in the client's chair?" (2 min)
  "Pick one bank line: trigger, pain, fear, myth, question or objection" (3 min)
  "Pick ONE goal" (1 min) → Decision "Goal?" Educate → carousel or takeaway card · Prove → real slides · Connect → text or photo · Sell → branded image or video · Spark → text only
PHASE 2 FIND
  "Answer today's pillar question" (5 min):
    Work that won: what did the deck have to win, and what was the turn?
    Win the room: what do they believe, why does it fail, what instead?
    How I work: which decision did I make that AI would not?
    My path: which scene from medicine shows this?
  Decision "Do I have real proof (slide, result, quote)?" no → "Pick another bank line" → back to "Pick one bank line"; yes → continue
PHASE 3 WRITE
  "Write 5 hooks, pick the strongest" (5 min)
  "Dump: write it badly, all of it" (10 min)
  "Cut: one idea, 120 to 200 words, delete the warm-up paragraph" (10 min)
  "Shape: one idea per line, turn on its own line, one CTA" (5 min)
  "Image: real slide, or question / takeaway / number card" (5 min)
PHASE 4 CHECK (each a yes/no diamond; every no → "Fix this one thing" → back to the diamond)
  "Hero's problem in lines 1 and 2?" → "Lines 1 to 3 earn the ...more?" → "Visual proof?" → "One guide line only?" → "Helps a decision maker decide?" → "One CTA?"
PHASE 5 SHIP
  "Post at the slot" → "Stay 60 min, reply to every comment" (20 min active) → "5 comments on founders' posts" (10 min) → "Mark the bank line Posted (Sheet + FigJam)" (1 min) → End: "Tomorrow: check the numbers, change one thing on Thursday"
Side note box (yellow #FFF4CC, border #9A6B00): "Stuck at any step? Go back one step, not to the start. No proof means a different line, not a weaker post."


=====================================================================
## DECISION BOARD (new FIRST column, left of "Start here")
=====================================================================
Title: "Decision board". Caption: "Every choice for a post, on one board. Read a row, pick, move down."
Layout: 8 horizontal rows stacked top to bottom, each row a colored card (v3 colors, light mode, strong contrast):
left cell = number + DECISION (Extra Bold 32), middle cell = "Ask yourself" (Medium 22, italic), right cell = options as colored chips, each chip = option (Bold) + "pick when..." (Regular 18).

1 PERSONA (blue) · Ask: Who sat in the client's chair?
   Founders: a startup raising money or selling · Executives and teams: a board, bid, report or company profile · Speakers: a keynote, talk or webinar · Creative directors: craft, files, process, AI
2 PILLAR (orange) · Ask: What am I showing?
   Work that won: a result · Before and after: a fix on a slide · Win the room: advice or a myth · How I work: my process or a decision · My path: me, medicine, values · Arabic lane: an opinion in Arabic
3 GOAL (violet) · Ask: What should the reader do after reading?
   Educate: learn one rule · Prove: believe I deliver · Connect: feel close to me · Sell: contact me · Spark: react and discuss
4 FORMAT (teal) · Ask: The goal decides
   Educate: carousel, or text + takeaway card · Prove: text + 1 or 2 slides · Connect: text only or personal photo · Sell: text + branded image, or 60 s video · Spark: text only
5 IMAGE (pink) · Ask: Where does the point live?
   In a slide: SLIDE (proof, before and after, chart, craft detail) · In an idea or sentence: BRANDED IMAGE (question card if it opens with a question, number card if one number carries it, takeaway card if it ends on a lesson) · In my story: PERSONAL PHOTO · Text-only post: NO IMAGE
   Small note under the row: "Can the slide be shown? If not, placeholder text or rebuild. This is a check, not the choice."
6 HOOK (yellow) · Ask: What stops a founder scrolling?
   A number + stakes · A myth they believe · A moment ("Slide 4. The investor stopped.") · A fear ("Months of work, judged in seconds.") · Never start with "I"
7 CTA (green) · Ask: One action only
   Sell: Book a call · Before and after: follow for Thursday · Educate, Prove, Spark: one soft question · Connect: none
8 TIME (grey) · Ask: Which slot?
   Sun, Mon, Tue, Thu 08:30 Egypt · Wed 15:30 · Arabic any day 08:30 · No Friday
Bottom strip (dark #2C2C2C, white text): "The 5 baby steps: WHO? · WHAT HURTS? · WHAT DID I SEE? · SAY IT SIMPLY · CHECK AND POST"

=====================================================================
## UPDATE: FLOWCHARTS HORIZONTAL + PERSONA MIND MAP
=====================================================================
1. All flowcharts (Daily framework and Flows 1 to 4) run LEFT TO RIGHT, not top to bottom. Phases of the Daily framework become colored horizontal lanes or bands in order: CHOOSE, FIND, WRITE, CHECK, SHIP. Decisions branch up and down; loops return with curved connectors above or below the main line. Because they are wide, place the flowcharts in their own wide section ABOVE all the columns (full board width), one flowchart per row, Daily framework first.

2. Persona mind map (place in "Maps and frameworks", or as a wide block next to the brand map). Center node: "Who I write for" (dark #2C2C2C, white, Extra Bold). Four branches in persona colors, each with the same 7 leaves (one short line each, max 8 words):

Founders (#1E5BB8)
- Who: startup founders and CEOs, pre-seed to Series A
- Wants: get the next meeting, then funding
- Trigger: "Send me your deck"
- Pain: slides crammed with everything they know
- Fear: looking amateur in front of investors
- Myth: "More slides show more effort"
- Best angle: problem first, investor questions in order

Executives and teams (#6B3FA0)
- Who: C-level, strategy and BD teams, government
- Wants: approval and a clear decision
- Trigger: board meeting, bid deadline, VIP visit
- Pain: 60 slides of data, no message
- Fear: the board nods and decides nothing
- Myth: "Executives want all the data"
- Best angle: one insight, then the proof

Speakers (#B5530C)
- Who: keynote, TEDx and webinar speakers
- Wants: the audience remembers one idea
- Trigger: talk accepted, slides due
- Pain: slides full of speaker notes
- Fear: the audience looks at their phones
- Myth: "Slides are my notes"
- Best angle: one idea, one strong image

Creative directors (#0F766E, peers)
- Who: studio leads hiring or sending overflow
- Wants: a freelancer at their standard
- Trigger: too much deck work this week
- Pain: designers who skip the story
- Fear: their name on weak work
- Myth: "AI will replace deck designers"
- Best angle: craft decisions AI can't make

Leaves use the same section colors as the bank (Trigger yellow, Pain red, Fear purple, Myth orange) as small colored tags before the text, so the map and the columns speak the same color code.

=====================================================================
## v4 SIMPLIFY (23 Nov, overrides row and card layout above; same data, same colors)
=====================================================================
Problem: persona columns are huge (one card per line, a label on every row, two Add new rows per section, duplicate titles, truncated names).
Apply to the 5 persona columns (Founders, Executives and teams, Speakers, Creative directors, New persona):
1. Header: one band per persona. Persona name in full (no truncation, wrap if needed), then "Who:" line and "Wants:" line inside the band. Delete the separate "Who" and "Brand script want" sections. Remove duplicate titles: if a FigJam section name shows above the band, either rename the section to the same name and drop the extra chip, or rebuild the column as a plain frame so only one title shows.
2. One card per section, not one card per line. Card = colored title bar (section name, Bold 26, white on the strong color) + ONE text block listing the lines as bullets ("•"), Regular 20, #111111, line height 140%, 8 px between bullets.
3. Myths, questions and objections: each bullet is the line, then a second indented line in Medium 18 #444444 starting with "→ " plus the truth or answer. No "Truth:" or "Answer:" labels needed.
4. Delete all per-row labels (TRIGGER, GOAL, etc.). The section title already says it.
5. Replace the two Add new rows with ONE dashed line at the bottom of each card: "+ add a line" in #6B6B6B, 16 px.
6. Column width 900, card padding 24, 24 px between cards. Columns hug their content.
7. New persona column: same structure with empty bullets ("• ...") and the + add line; New field block stays one small card.
Target: each persona column roughly one third of its current height. Keep every line of text exactly (only the labels are removed). Re-run the no-crop check over all text nodes.
Do not change the Decision board, Start here, Maps and frameworks or Flowcharts, except moving columns left to close gaps after the persona columns shrink.

### v4.1 TRANSVERSE (overrides v4 point 6 layout)
Each persona is a HORIZONTAL ROW, read left to right: the persona header card first (name, Who, Wants), then its section cards side by side in this order: Trigger moments, Goals, Pains, Fears, Beliefs and myths, Questions, Objections, Their words, Success picture, Ready angles. Card width 520, 24 px gap, all cards in a row top-aligned and the same height as the tallest card in that row.
Personas stacked as rows, 120 px apart: Founders, Executives and teams, Speakers, Creative directors, New persona (+ New field card at the end of its row).
Place the persona rows below the Flowcharts section. Decision board, Start here and Maps and frameworks stay as columns, placed to the left of the persona rows (or above them if that reads better), no overlaps.

### v4.2 WHOLE PAGE READS BY HORIZONTAL SCROLLING (overrides all earlier placement)
Ahmed reads by scrolling sideways. Lay the ENTIRE page out as ONE horizontal strip with a fixed height of 2400 px (fits one screen at a comfortable zoom). Nothing below the strip, nothing stacked above it.
Order left to right, each chapter starts with a narrow chapter divider card (full strip height, 320 wide, chapter color fill, white chapter number + title, rotated or large):
 1 Decision board (its 8 rows become 8 cards flowing in columns) · 2 Start here (how to use, color key, goals and formats, branded cards) · 3 Daily framework flowchart · 4 Flows 1 to 4, one after another · 5 Maps and frameworks (brand mind map, persona mind map, frameworks 1 to 6) · 6 Founders · 7 Executives and teams · 8 Speakers · 9 Creative directors · 10 New persona + New field.
Inside a chapter, cards flow top to bottom and wrap into the next column to the right when the 2400 px height is reached (newspaper columns). Column width 520 for cards, 120 px gap between chapters, 24 px between cards.
Flowcharts keep their left-to-right flow; if one is taller than 2400, scale its spacing down, never its text below 18 px.
Persona chapters: header card (name, Who, Wants) first, then the 10 simplified v4 section cards flowing in columns.
Remove the old vertical columns and the old rows after rebuilding. Re-run the no-crop check.

### v4.3 EACH PERSONA FITS ONE SCREEN, IN 2 ROWS (overrides v4.2 for persona chapters)
Each persona chapter is one 16:9 block (about 3840 x 2160) that fits on one screen when zoomed to fit:
 Row 1: header card (name, Who, Wants) + Trigger moments + Goals + Pains + Fears + Beliefs and myths
 Row 2: Questions + Objections + Their words + Success picture + Ready angles (+ the "+ add a line" note for new sections at the end)
Cards 600 wide, 24 px gaps, all cards in a row equal height. Body 20 px stays the minimum; tighten line height to 130% and bullet spacing to 6 px before shrinking anything else. If a card is still too tall, let that one row grow, but keep the block within about 2400 px tall.
The strip height becomes the persona block height, and the other chapters flow within the same height. New persona chapter uses the same 2-row grid.

### v4.4 CONNECTOR READABILITY (whole board, every flowchart)
Problem: branches share one trunk line and their labels pile up on the trunk, far from their own arrows (seen in the Daily "What day is it?" fan and across the board).
Rules for ALL flowcharts (Daily framework, Flows 1 to 4, mind maps):
1. No shared trunks. Every branch out of a decision gets its own connector, leaving from its own side or point of the shape.
2. Fan-outs with more than 2 branches: replace connector labels with option chips. Decision → one plain connector → a stacked column of colored option chips (each chip holds the label text, Bold 20) → one short straight arrow from EACH chip to its own target on the same row.
3. Yes/No branches: "Yes" leaves from the right, "No" from the bottom. The label sits as a small chip right at the start of its own connector (within 24 px of the shape), green for Yes, red for No.
4. Straight or single-elbow connectors only. No connector crosses another connector or passes behind a shape. Loops run above or below the main line with clear space.
5. Daily framework day chips in calendar order: Sun, Mon, Tue, Wed, Thu, Fri or Sat. The Thu jump to CHECK starts from the Thu chip and runs along the top.
Verify with close crops of every decision area, then run the no-crop check.

=====================================================================
## v4.5 BUILDS DIMENSION (23 Nov): what the reader concludes about Ahmed
=====================================================================
Goal = what the post DOES. Builds = what the reader CONCLUDES about Ahmed after reading. One main Builds per post.
Founders hire a remote freelancer only when all five are filled. Ahmed's usual gap is Trust.

Builds colors (strong / tint), light mode, Inter 4 weights as v3:
Relevance #B5530C / #FFEBD9 · Authority #1E5BB8 / #E3EDFB · Trust #1E7B34 / #E3F5E7 · Likability #A3195B / #FBE4EF · Action #2C2C2C / #EDEDED

### The five Builds (recipe data, used by every flow below)
RELEVANCE · Reader thinks: "He gets my problem." · Brand script: empathy, villain (clutter), internal fear
  Mine from: Trigger moments, Pains, Fears, Their words · Pillar: Win the room · Goal: Educate or Spark
  Format: text only, or text + question card · Proof ingredient: their exact words or a real scene
  Hook: a fear or a moment ("Months of work, judged in seconds.") · CTA: one soft question
  Check: Would a founder say "that's me" by line 2?
AUTHORITY · Reader thinks: "He knows how to fix it." · Brand script: authority lines, real work
  Mine from: Beliefs and myths (the truth), Ready angles, real projects · Pillar: Work that won, Before and after · Goal: Prove or Educate
  Format: text + real slide, or the Thursday carousel · Proof ingredient: a real slide, a before and after, or one authority line ($57M behind, 6 countries, Top 1%)
  Hook: a number + stakes · CTA: soft question, or follow for Thursday
  Check: Is there something on screen they could not have done themselves?
TRUST · Reader thinks: "He's safe to hire." · Brand script: plan (Talk, Shape, Win), promises
  Mine from: Objections to hiring, Questions they ask · Pillar: How I work · Goal: Sell or Prove
  Format: text + branded image (number or takeaway card), or 60 s video · Proof ingredient: one promise + a real moment it was kept (deadline, NDA, feedback window, scope before payment)
  Hook: the objection in their words ("What if I pay and hate the result?") · CTA: Book a call
  Check: Does it remove one risk of hiring me?
LIKABILITY · Reader thinks: "I like how he thinks." · Brand script: identity (ex-doctor turned presentation strategist), philosophical line
  Mine from: My path stories, values, learning, Arabic lane · Pillar: My path, Arabic lane · Goal: Connect
  Format: text only, or text + personal photo · Proof ingredient: a real moment from medicine, learning or freelance life
  Hook: a lesson line · CTA: none
  Check: Would they know it's my voice without my name on it?
ACTION · Reader thinks: "I know the next step." · Brand script: plan, CTA, success ("You win the day")
  Mine from: Success picture, Questions they ask · Pillar: How I work · Goal: Sell
  Format: text + branded image · Proof ingredient: Talk, Shape, Win + one promise
  Hook: a situation ("Have a document that needs to become a deck?") · CTA: Book a call, or Start a project
  Check: Is the next step one sentence and one click?

Monthly balance (20 posts): Authority 6 · Relevance 5 · Trust 5 · Likability 3 · Action 1 to 2.

### Placement
New chapter "Builds" in the horizontal strip, placed right after the Flowcharts chapter (Section 1, 61:2993), same chapter divider card style as the others. Inside it, left to right: Flow 5, Flow 6, Flow 7. Follow v4.4 connector rules and the no-crop check.

### Flow 5. Which Builds next? (horizontal, run at the Thursday review, feeds Sunday card 1)
Start (dark): "Thursday review" → "Open the sheet tab 'Builds balance'" → diamond "Any Builds at 0 this month?"
  Yes (green, right) → "Plan that one first" → joins "Plan Sunday card 1 with it"
  No (red, down) → "Pick the one furthest below its target" → joins the same step
→ diamond "Which Builds?" → option chips stacked (Relevance, Authority, Trust, Likability, Action in their colors), one arrow from each chip to "Use its recipe (Flow 6)" boxes on the same row (or one merged box)
→ "Plan Sunday card 1 with it" → End (dark): "Card ready".

### Flow 6. The five recipes (5 horizontal lanes stacked, one per Builds, each lane in its color)
Each lane, left to right, 7 boxes joined by straight arrows:
  [Builds chip] → "They think: ..." → "Mine: ..." → "Pillar + goal: ..." → "Format: ..." → "Proof: ..." → "Hook: ..." → "CTA: ..." → diamond "Check: ..." (Yes → "Write it", No → back above the lane to "Mine", loop above)
Use the recipe data above, short.

### Flow 7. The trust ladder (journey map, horizontal)
Stranger (grey card) → Relevance "He gets my problem" → Authority "He knows how" → Likability "I like how he thinks" → Trust "He's safe to hire" → Action "I know the next step" → Booked call (dark card, white text).
Under each step: one small line of example posts:
  Relevance: myth post, fear post · Authority: case study, Thursday carousel · Likability: My path, Arabic post · Trust: promises, how a deadline was kept · Action: Talk, Shape, Win + Book a call.
Caption above: "A founder climbs one step per post they read. Leave no step empty."

### Additions to existing blocks
- Decision board: insert a new row after 3 GOAL: "BUILDS · Ask: What should they conclude about me?" chips: Relevance: he gets my problem · Authority: he knows how · Trust: he's safe to hire · Likability: I like how he thinks · Action: I know the next step. Renumber the rows below (9 rows total). Row color: use the 5 Builds colors on the chips, neutral row card.
- Flow 1: after "Pick ONE goal", add a box "Pick ONE Builds (what should they conclude?)".
- Daily framework, CHOOSE phase: after the Goal chips merge, add one box "Pick ONE Builds" before FIND. Shift right, keep connectors clean.
- Brand mind map: add Branch F "Builds" → Relevance · Authority · Trust · Likability · Action (in Builds colors).

=====================================================================
## v4.6 FLOW 8. PLAN THE WEEK (Sunday, 45 min): decide, prioritize, connect
=====================================================================
Place it as the FIRST flow in the "Builds" chapter (before Flow 5), largest block, horizontal, 4 phase bands like the Daily framework:
DECIDE (blue #1E5BB8) · PRIORITIZE (orange #B5530C) · CONNECT (violet #6B3FA0) · CHECK (red #B42318), then a dark End card.
Follow v4.4 connector rules. Time chip under each phase.

PHASE 1 DECIDE (10 min)
Start (dark): "Sunday, 45 min. Open the sheet and the board"
→ "Read Thursday's review: the weakest Builds + the ONE change" 
→ diamond "Any fresh client work this week?"
   Yes (green, right) → "It becomes Monday's Work that won" 
   No (red, down) → "Pick the top-scored bank line" (small note: score Buyer, Proof, Sales use, Effort, 0 to 2 each)
   both join →
→ "Pick ONE theme for the week: one founder fear or myth" (example chip: "Too many slides")

PHASE 2 PRIORITIZE (15 min): fill the 5 slots by importance, not by day
Stacked priority chips, numbered, each with an arrow to its slot box on the same row:
  P1 Thu carousel · Before and after · Educate + Authority · "the anchor, never cut"
  P2 Wed How I work · Sell · Trust or Action · "the money post, never cut"
  P3 Mon Work that won · Prove · Authority
  P4 Tue Win the room · Educate · Relevance
  P5 Sun Win the room or My path · Connect · Likability · "first to cut: post from the ready bank"
→ "For each slot, pick the highest-scoring idea that fits"
Note card beside: "Short on time? Cut from P5 upward. Never cut P1 or P2."

PHASE 3 CONNECT (10 min): the week tells one story about the theme
A 5-step arc, chips left to right, each with day + role:
  Sun "Name it" (Relevance or Likability: why this fear matters, a story)
  → Mon "Show it solved" (Authority: a case where fixing it won)
  → Tue "Teach the rule" (Relevance: the myth and the truth)
  → Wed "How we'd fix yours" (Trust: Talk, Shape, Win + Book a call)
  → Thu "See it on a slide" (Authority: the before and after carousel)
  Arabic post: "My take on the theme, in Arabic" (Likability), side chip.
Under the arc, 3 small "connect" tactics cards:
  "Reuse one line from Their words in 2 posts" · "End Tue with: Thursday I'll show the slide" · "Comment the previous post's link under the new one"

PHASE 4 CHECK (10 min)
4 diamonds in a row, Yes right (green), No down (red) to its own fix box:
  "Founders in at least 3 of 5?" → No: "Swap the weakest slot to a founder angle"
  "Exactly one Sell (Wed)?" → No: "Keep Wed, soften the rest"
  "Weakest Builds from Thursday is in?" → No: "Put it in P4 or P5"
  "Proof ready for every slot?" → No: "Swap that slot with a ready bank post"
End (dark): "5 cards on the Decision board. Sheet Status = Idea. Write Monday."

Under the whole flow, a "Week card" template row (one table, 10 columns, light): Theme · Slot · Priority · Persona · Pillar · Goal · Builds · Bank line · Proof ready? · Hook. 5 empty rows (Sun to Thu) + 1 Arabic row. Editable text, not cropped.

=====================================================================
## v4.7 AUTHORITY FLOOR + REACH FORMATS
=====================================================================
1. Flow 3 Pre-publish check: add a diamond after "Visual proof, not post words?": "Authority marker in it?" Yes right, No down to "Add one: real slide, sourced number, named principle, decision + why, true pattern, one authority line, a position with reasons". Small test line under it: "Could a generic designer or ChatGPT write this? Then add a marker."
2. Builds chapter: add a card grid "Reach formats (1 to 2 a week)", 7 cards in one row, each = format (Bold) + example hook (Regular) + what it earns (chip: Saves / Shares / Comments / Dwell):
   Famous deck teardown · "Airbnb's first deck has one slide I'd change." · Shares
   Big-gap before and after · "Same data. 47 words to 6." · Saves
   Myth-bust · "Stop putting your logo on every slide." · Comments
   Framework carousel · "The slide order investors read in." · Saves
   Story with a turn · "The investor stopped at slide 4." · Dwell
   AI-slides tie-in · "AI made this pitch deck. Here is what it hid." · Comments
   Sourced number · "Investors spend minutes, not hours, on your deck." (cite the source) · Shares
   Under the grid, a red-outline card "Never": engagement bait, rage, mocking, invented numbers, tagging strangers.

=====================================================================
## v4.8 THE WEEK ENGINE (6 hours, one sitting, zero memory needed)
=====================================================================
Purpose: Ahmed opens this at the start of every week, remembers nothing, has 6 hours, and leaves with the whole week written, designed, checked and scheduled.
Placement: a NEW FIRST chapter of the whole Persona bank strip (left of the Decision board), titled "Start of week: the Week Engine". It is the first thing he sees. Largest block on the page.
Layout: one horizontal flow in 7 phase bands with a timer chip on each (v3 colors), a "Remember card" before phase 1, a "Stuck rules" card strip under the flow, and a running clock bar along the top (0h, 1h ... 6h marks aligned to phases). v4.4 connector rules, no-crop check.

REMEMBER CARD (dark #2C2C2C, white text, read in 2 min):
"North Star: help decision makers see the one insight that matters, and design it so the decision is obvious.
Hero: founders and leaders with a high-stakes presentation. Want: a clear yes. Villain: clutter. Fear: looking unprepared.
One-liner: Months of work get judged in seconds. I shape your story into a clear, human presentation, so you win the day.
Week: Sun Win the room or My path · Mon Work that won · Tue Win the room · Wed How I work (Book a call) · Thu Before and after carousel · + 1 Arabic. No Friday.
Every post: one persona, one goal, one Builds, one authority marker, one CTA."

PHASE 0 RESET · 15 min (grey)
"Open 4 things: this board, the Sheet (Persona bank), Content Studio, LinkedIn" → "Read the Remember card" → "Read last Thursday's note: weakest Builds + one change" (if none: "Weakest = Trust")

PHASE 1 DECIDE · 30 min (blue)
diamond "Any client work or result from last week?" Yes right → "It becomes Mon Work that won + Thu carousel material" · No down → "Sheet: filter Status = New, pick the top-scored line" (Buyer, Proof, Sales use, Effort, 0 to 2)
→ "Pick ONE theme: one founder fear or myth" → "Check the edge: my view, my proof, my signature?" diamond, No down → "Pick the next line"

PHASE 2 PICK · 30 min (orange)
Priority chips each to its slot: P1 Thu carousel · P2 Wed How I work · P3 Mon Work that won · P4 Tue Win the room · P5 Sun · + Arabic
→ "Fill the Week card: persona, pillar, goal, Builds, bank line, authority marker, hook idea"
→ 3 quick diamonds: "Founders in 3 of 5?" · "Exactly one Sell?" · "Weakest Builds included?" (No → own fix box each)
Story arc chips under it: Sun name it → Mon show it solved → Tue teach the rule → Wed how we'd fix yours → Thu see it on a slide

BREAK · 10 min (white card, dashed)

PHASE 3 WRITE · 2 h (violet), in priority order, one timer each
"P1 Thu carousel script, 8 slides: hook, problem, before, 3 fixes, after, CTA · 30 min"
→ "P2 Wed · 25 min" → "P3 Mon · 25 min" → "P4 Tue · 20 min" → "P5 Sun · 15 min" → "Arabic · 5 min note, write natively later in the week"
Repeating method chip above the row: "Each post: 5 hooks, pick 1 → ugly draft → 5 moves → cut to 120 to 200 words"

BREAK · 15 min

PHASE 4 VISUALS · 1 h 45 (teal)
"Carousel: clone the template in Content Studio, drop in the script and slides · 75 min"
→ diamond "Where does each post's point live?" chips: In a slide → "Export the real slide (placeholder text if needed)" · In an idea → "Branded card from One Light layouts" · In a story → "Personal photo" · Text only → "No image" (each own arrow, merge) · 30 min total

PHASE 5 CHECK · 30 min (red)
"Run the pre-publish check on each post, 5 min each" → "Read each one aloud" → diamond "All pass?" No down → "Fix one thing, recheck" (loop below)

PHASE 6 SHIP · 15 min (green)
"Schedule all posts in LinkedIn at their slots (Wed 15:30, others 08:30 Egypt)" → "Sheet: Status = Drafted, add dates" → "Move one spare post to the ready bank" → End (dark): "Week done. Daily: 20 min of comments only."

STUCK RULES strip (yellow #FFF4CC cards, Bold title + Regular line):
"Stuck over 5 min on a choice? Take the default: Founders, their fear of looking amateur, Win the room."
"No idea at all? Open the Sheet, sort by Score, take the top line. Don't think, pick."
"Running over time? Cut P5, post it from the ready bank. Never cut P1 or P2."
"Carousel too heavy this week? One before and after image instead."
"Hate a draft? Ship it if it passes the check. Done beats perfect."
"Sunday 08:30 post: comes from the ready bank, written last week."
