# App
## Architecture
- Source in app/: orig.html plus module*.js, style*.css, build.py. Live build source is app/live/ (data files and secrets excluded).
- Build: python3 build.py && node --check main.js.
- Phone layout (module33): only Gym, Money and the Capture bar; Settings switch "Simple phone layout" restores the full layout per device.
## Supabase
- Live app code is the table app_code, one version per publish. Data docs sit in the same project.
- Backups go to a Supabase backup table before any data change (e.g. kind pre-data-apply-20261114).
- Leftover TODO: drop temporary function public.apply_docs_tmp (its secret is deleted, unusable).
## Publish flow
- Build, gzip+base64 in 60000 char parts, fresh secret, migration enables upload_app_tmp2 with sha256(secret).
- Python POSTs the parts to /rest/v1/rpc/upload_app_tmp2 with the publishable key from app/site/config.js.
- Migration disables the function again, delete the secret, compare md5 of parts with string_agg md5 in app_code.
## Netlify shell
- app/site/: boot.js stores app and data in IndexedDB, sw.js v2. Deployed 19 Nov.
- Fallback: redeploy app/site/boot.prev.js and sw.prev.js (fix forward).
## Tests
- Playwright in v3/*.js, harness v3/h.js, data via MOCKDATA env.
- Run changed tests plus nearest; full suite before publish.
## Rollback
- Delete the newest version's rows in app_code. Latest live: 1795241732 (previous 1795197272).
- Data rollback: restore docs from the backup, or Settings > Undo task diet.
