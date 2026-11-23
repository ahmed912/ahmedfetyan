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
Ahmed: the One Light monochrome page is hard to read. This page is a working document, not a brand asset: use FigJam colors and real hierarchy.
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
Rules: one idea per card. 12 words max on the headline. Real proof beats a branded card: never use a card for a Prove post if a real slide exists. Arabic posts get the Arabic mirror cover.

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

### Flow 2. Which image?
Start: the post needs an image
→ Decision "Real slide and client permission?" yes → use the real slide (placeholder text if needed) → End
no → Decision "Does the post open with a question?" yes → Question card
no → Decision "One sourced number carries the post?" yes → Number card
no → Takeaway card
All cards → One Light layout 01 or 04, render from the pillar row, amber line above the headline → End

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
