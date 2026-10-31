# Implementation record — v0.3

Initial repository inspection: `main` contained only a nine-byte README. No application code was available to reuse. Existing personal CV/portfolio attachments were deliberately not used as public fixtures.

Execution sequence:

1. Foundation: strict Next.js App Router, React/Tailwind, local shadcn-style Button, Supabase SSR auth and protected routes, relational migrations/RLS and private Storage.
2. Career intelligence: 99 bilingual structured questions, incremental persistence, skip/resume logic, normalized entity editors, canonical provenance/confirmation registry.
3. Import/analysis: validated PDF/DOCX extraction, source hash deduplication, review workflow, pasted advertisement extraction and conservative public URL retrieval.
4. Evidence/CV: modular compatible AI functions, deterministic fallback matching/ranking, fact-ID claims and independent exact-source validation, confidential/excluded evidence filtering.
5. Documents: three templates, editable/reorderable/hideable sections, approval gate, selectable Unicode PDF and editable DOCX, private export storage and personal data export/deletion.
6. Delivery: PostgreSQL/PGlite isolation tests, Vitest/RTL/service tests, production build, CI, staging Playwright tests, deployment/security instructions and honest acceptance gaps.

Status: source implementation delivered for all phases. External Supabase/OpenAI/Vercel activation and full browser acceptance remain unverified. This is a reviewable integration MVP, not a certified production launch.
