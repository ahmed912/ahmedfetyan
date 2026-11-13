# Design rules (user standing order, 13 Nov)
Every task and feature is judged by how Ahmed will actually use it. Applies to architect, builder and runner.

0. **Scope: do what was asked, nothing more.** If there is a better way to do something, write it as a short suggestion for Ahmed to accept or ignore. Never build or apply it unasked. This applies to the planner too: plans contain only what he requested, with ideas in a separate "Suggestions" list at the end.
1. **Journey first.** Before building, write a 5-line "day in use" projection: when he opens it, what he wants, the fewest taps, what he sees after. Put it at the top of each plan round. If the journey is not simple, redesign before coding.
2. **Whole feature, not half.** A feature ships with all its logic: add, edit, move, undo, delete or archive, empty state, and how it shows everywhere it appears (Today, Plan, Review, projects, buckets).
3. **Simple and calm.** Show the next 1 to 3 things, collapse the rest. Counts are for projects and milestones, never tiny steps. Defaults are sensible so he types as little as possible.
4. **Editable by him.** Everything the app or Claude creates (names, dates, buckets, sprints) can be changed in the app without help.
5. **No surprises.** Every change has Undo or a rollback. Data changes get a backup first.
6. **Seamless.** Same gestures and words in every place. Calm glass style, no new icons, no em dashes.
7. **Test the journey.** Each round has a Playwright check that follows the projected journey at 390 and 1300.
