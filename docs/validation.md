# Executed verification — 31 October 2026

## Results

- `npm test`: **41 passed** across six suites: 11 engine, 11 PostgreSQL, 8 actual workspace-handler orchestration, 5 interview, 4 React auth UI, 2 synthetic demonstration/document roundtrip.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- `npm run build`: passed (Next.js 16.4.3), all requested public/protected/API routes compiled. Rechecked after final parser and export changes.
- `npm run seed:questions`: passed; produces the idempotent SQL seed.
- `git diff --check`: passed.
- Public landing and login rendered in the cloud browser. Authenticated screens could not be exercised without configured services. Live reset-button observation was inconclusive, while React event tests passed. Do not treat this as full browser acceptance.
- `npm run test:e2e`: **blocked** before browser execution because the Playwright Chromium executable is unavailable. Attempted official browser installation failed with truncated/invalid ZIP downloads. No E2E pass is claimed. CI installs Chromium in GitHub Actions and runs desktop/mobile smoke tests; the staging login/persistence test skips unless E2E_EMAIL and E2E_PASSWORD are supplied.

PGlite executes actual PostgreSQL migration SQL and both seeds; only auth/storage platform schemas and JWT uid function are represented by minimal test fixtures. Tests verify real database roles, forced RLS, tenant SELECT/UPDATE/INSERT restrictions, cross-owner composite foreign keys, storage path policies, rate limits and cascading deletion. This does **not** verify Supabase SMTP, sessions, HTTP APIs, deployed Storage bytes or backups.

Workspace-handler tests execute application route functions with mocked auth/database/provider transports and the real deterministic engine. They catch orchestration contract issues; they do not prove a live provider or Supabase connection.

## Acceptance matrix

| Criterion | Evidence | Remaining live verification |
| --- | --- | --- |
| A Registration/login | Auth routes, Supabase SSR, protected layout; 4 auth UI tests | Real signup, verification mail, session/refresh and reset delivery |
| B Interview persistence | 99 bilingual bank, skip/resume engine; SQL answer/skip constraints | Browser close/reopen against Supabase |
| C CV import | Real PDF/DOCX text roundtrip, signature/size/ZIP limits, review flow | End-to-end private Storage upload with live auth/provider |
| D Career profile | Normalized editors, canonical fact review, owner constraints | Deployed UI integration |
| E Job analysis | Parser and actual handler fallback tests, modular AI analyzer | Live provider output and approved website retrieval |
| F Evidence mapping | Requirement→fact-ID mapping tests; source review UI | Semantic quality with diverse real advertisements |
| G CV generation | Three synthetic roles have different summary/skills/achievements; handler test | Live AI quality and complete staging workflow |
| H PDF/DOCX | Valid generated files re-imported with Polish selectable text | Production Vercel font tracing/download roundtrip |
| I Data isolation | 11 PostgreSQL tests plus handler foreign-owner denial | Two-account live Supabase storage/auth test |
| J Factual grounding | Unconfirmed/excluded/confidential filtering; exact text/ID validation and stale-export check | Human evaluation of potentially misleading context |
| K AI failure | Retry/failure tests, import/analysis/generation fallbacks, auth error preservation | Real provider outage smoke test |
| L Responsive UI | Responsive CSS, desktop landing/login inspection, mobile Playwright test authored | Mobile browser execution blocked by missing Chromium |

## Known product limits

- CV fact wording is deliberately exact approved source text. It can be selected/reordered, or replaced with a newly confirmed source fact. Automatic translation/free rewriting is not enabled; language switches headings and prompts. This is narrower than fully fluent bilingual resume rewriting.
- The application shell is Polish-first; interview and document options support PL/EN. Full English interface localization remains work.
- Offline import produces reviewable lines, not a semantically complete normalized employment parser. AI proposes typed atomic facts; users can maintain the separate structured entities in Profile. Entity reconciliation and contradiction resolution remain manual, with source history preserved.
- Evidence matching in the application is conservative deterministic lexical matching (`partial`/`not_established`). A typed AI matching service exists as an extension point. There is no automatic claim of verified competence or independent employment verification.
- SQL schemas for sources, skills relations, sessions, CV sections and evidence are ready; some UI workflows use canonical facts/CV JSON instead of fully populating every auxiliary relation. CV section JSON is a document representation, not the career database.
- Three document templates emphasize different ordering/typography but are deliberately minimal. Contact header/chronological employer grouping, multi-page widow/orphan polish and broader font scripts need further design work. Embedded font covers Latin/Polish and common symbols.
- Imports/AI are synchronous and bounded; no background worker/OCR/antivirus, direct signed uploads, application submission or recruiter messaging.
- No external service was activated, no paid infrastructure was purchased, and no Vercel deployment is claimed.
