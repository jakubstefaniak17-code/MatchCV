# v0.4 acceptance and remaining limits

## Implemented modules

- Career Engine2.0: typed approved relational snapshots, reverse chronology, semantic vocabulary candidate retrieval/ranking/verification, fact-linked summary and employment claims, deterministic quantity/currency/credential/name/responsibility checks, source-bound editorial approval keys, target-language gate, explicit basic mode. No silent professional-AI fallback.
- Career Setup1.0: separate welcome andfive-step routes, typed partial identity autosave, private PDF/DOCX import, grouped review/structured corrections, fixed persisted optional question selection from existing40 bank, real readiness summary, versioned PostgreSQL progress and route guard. Existing users retain history and access with supplementary setup.
- Career Atelier: three task areas, expandable career timeline/inline editing, connected offer flow, document preview/editor/mobile tabs, persistent document history and two retained templates.
- Import: unconfirmed/excluded proposals, separate truth/publication decisions, reviewed source snapshots materialize separate relational entries. Wrong proposals can be edited/rejected; contradictions are never silently merged. Raw source quotation remains user-review data and is excluded from composition payload.
- Migration:202611010001_onboarding.sql adds onboarding_progress RLS/RPC CAS, setup identity/language fields, auth trigger and legacy-account migration. Account export includes setup; account deletion cascades it.

## Execution evidence

Baseline75tests passed before changes. Current run161tests passed across16suites; TypeScript strict, ESLint and production Next.js build passed. Turbopack incremental persistence repeatedly failed in this executor (including a Rust cache panic). Production build now explicitly uses the supported Next.js webpack builder to avoid this cache-specific failure; routes/framework are unchanged. These are local code checks, not external auth/provider success.

Document QA:12PDF+12DOCX, six synthetic careers×two templates, all24rendered with Poppler/LibreOffice.36pages visually/structurally checked;9pt minimum, selectable Unicode, no clipping. See docs/document-qa-v04.md and scripts/qa-documents.ts.

Local Playwright browser installation failed: official Chromium download returned an invalid/truncated ZIP. Browser-launch failures and skipped staging cases are not passes. Synthetic UI separately inspected through cloud browser:4-role career chronology, document library, full CV editor and approval flow. No actual Supabase session or provider was configured.

## Acceptance matrix

| Flow | Automated coverage | Real staging |
|---|---|---|
| Registration/login/recovery | Existing auth UI/API and public browser smoke | Not verified without SMTP/Supabase |
| First-login/direct URL guard | Server layout tests, fresh-account PG trigger | Conditional Playwright setup-staging |
| Five steps and CAS |9actualPGtests,11API/readiness tests,8setupUI tests | Not verified across real devices |
| PDF/DOCX import | Document parser/format tests, review UI tests | Private Storage/provider not verified |
| Truth/publication/private exclusions | API, PG, UI and engine privacy tests | Two live accounts not supplied |
| Selected questions/resume | Original interview persistence tests +fixed selection PG/API | Real logout/login not verified |
| CV quality/chronology/style edits | Engine2qualitysuite and source-bound review tests | Live model wording/latency not measured |
| Export/layout |21documenttests plus24actualrenderedfixtures | Synthetic browser download passed CI; real Storage needs staging |
| Mobile | Responsive components and tab tests, Playwright mobile source | Local Chromium unavailable |

## Deliberate remaining limitations

This is a tested implementation increment, not a claim that the full production MVP definition is met. Deployment/auth/SMTP/private uploads/cross-device resume/model charges require the staging configuration in deployment-and-merge.md. The hosted review remains explicitly synthetic and cannot exercise real setup/auth/import.

Semantic matching uses a transparent bilingual domain vocabulary and cautious partial evidence, not a universally calibrated semantic model. Missing information never means absence of competence. Uncertain paraphrases require user editorial review; deterministic checks do not prove the truth of arbitrary prose. New numbers, responsibility inflation, credentials and unsupported categories remain blocked. Language detection is conservative, not a complete linguistic/style audit; real provider output still needs human acceptance. Basic drafts intentionally retain source language.

Import parsing depends on readable text; scans require OCR. Proposed structured data needs review, especially dates. Year-only periods are preserved in provenance, never converted to invented January dates. Some industry-specific mappings, language edge cases and multi-entity relationships will need real-world iteration. No autonomous applications, recruiter messages, billing or paid infrastructure were added.

GitHub Validate run41303962637 on commitc6aaabd completed successfully, including desktop/mobile synthetic browser tests (six executed cases). Four real-staging cases remained skipped. The subsequent supplementary-setup regression is additionally tested locally and rechecked by the final branch workflow.
