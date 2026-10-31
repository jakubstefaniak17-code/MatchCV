# Vercel + Supabase deployment

1. Create Supabase in an appropriate region and apply migration then seed as described in README. Keep database backups enabled according to your retention needs.
2. Verify all user-owned tables have enabled/forced RLS; check two staging accounts cannot read/update/link each other's records. Review the storage policies for `career-documents`, which must remain private.
3. Enable Email auth and configure SMTP, confirmation policy, password recovery and production callback URL. Add exact preview callback URL if testing auth on Vercel previews.
4. Import the GitHub repository into Vercel. Framework preset Next.js, Node 22.x, install `npm ci`, build `npm run build`, output default.
5. Add `.env.example` values through Vercel environment settings. Assign independent Supabase projects to preview and production. Set `APP_URL` to the exact preview/production origin. Do not expose service-role or AI credentials through NEXT_PUBLIC variables.
6. Choose an AI provider/model, verify JSON-mode support and set token prices. Enabling an external provider may incur charges; the source code does not purchase or activate a service. Confirm processing agreement, region and retention for real personal data.
7. Optional: approve a small exact hostname allowlist for job URL imports after reviewing robots policy/site terms. Empty list leaves pasted text fully functional.
8. Deploy preview. Test registration, verification link, login, password reset, interview persistence, import review, job analysis, evidence, generation, approval, both exports, personal export, and account deletion. Test AI outage and cross-account isolation.
9. Inspect server logs for unexpected sensitive data. Confirm private Storage downloads require auth or short-lived links, then promote after staging review.

## Runtime limits

Import and orchestration are synchronous, short bounded jobs. AI makes at most two attempts, 15-second per-request timeout. Vercel plan execution/body limits may be smaller than the application 5 MB limit; configure/test the selected plan (commonly a lower request body cap applies). Large uploads need signed direct upload plus queued parsing in a later version. Scanned PDFs require external OCR. The PDF font is traced into the server bundle via `outputFileTracingIncludes`.

No Vercel API or Supabase project credentials were supplied in the build environment. Consequently no hosted preview or external-service acceptance is claimed.

## Browser smoke tests

Start `npm run dev -- --port 4173` locally, then `npm run test:e2e` (or set E2E_BASE_URL to your staging preview). Install Chromium using `npx playwright install chromium` in a network environment with access to official Playwright downloads. CI starts the built application automatically. Set E2E_EMAIL/E2E_PASSWORD only for an isolated synthetic staging account; the test edits Q001 on that account. Never use a real personal profile for this fixture.
