# feat: MatchCV v0.3 career evidence workspace and resume exports

## Result

Builds a Next.js application on the previously README-only repository. Users can maintain structured career entities and provenance facts, answer a bilingual 99-question interview, review PDF/DOCX imports, analyze advertisements, compose role-specific fact-grounded drafts, edit/approve them, and export selectable PDF or editable DOCX.

Supabase SSR authentication, protected APIs, ownership filters, forced RLS/composite owner keys, private Storage, persistent operation limits, account export and deletion are implemented. A configurable compatible AI layer has independent schemas/prompts/usage tracking; conservative deterministic workflows remain usable during outages.

## Validation

41 Vitest/RTL/PostgreSQL/service tests pass. TypeScript, ESLint and production build pass. Real generated PDF/DOCX were re-imported to assert Unicode selectable text. Three synthetic roles produce different evidence selections. PostgreSQL tests exercise actual tenant isolation, not only SQL string checks.

Playwright browser execution is blocked locally by unavailable Chromium and invalid official download archives. Dedicated staging credentials are required to run authenticated browser tests. No external Supabase/OpenAI/Vercel deployment was configured or verified.

## Limitations

Exact approved fact wording is retained: free AI rewriting/translation is intentionally deferred. The shell is Polish-first, with bilingual questions and document options. Evidence matching in the application is conservative lexical matching; an AI matching module is available but is not used to declare competence verified. Imported facts are reviewable atomic claims; normalized entity reconciliation remains manual. Auxiliary schema relations are not all populated by the current UI. Templates are deliberately minimal and need further typography/chronology/contact layout QA.

Review docs/validation.md for A–L acceptance evidence and docs/deployment.md for Vercel/Supabase configuration. Legal pages require review before public real-user launch.
