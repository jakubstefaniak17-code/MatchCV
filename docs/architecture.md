# Architecture and extension points

Next.js App Router handles public/auth/protected pages and route handlers. Supabase SSR cookies are refreshed in proxy; each protected server/API path independently checks identity. `lib/db/repository.ts` centralizes owned reads and persistent expensive-operation rate limits. `lib/career/schemas.ts` validates distinct relational entity types.

Career entities (experiences/projects/achievements/skills/education/certifications/languages) are separate relational records. Their editable values produce candidate canonical facts. Facts retain type, source reference, structured value, status, confirmation timestamp and privacy flags. Imports additionally create fact_sources referencing private documents and content hashes. Existing facts are never silently overwritten by a contradictory import or structured edit.

`lib/interview` deterministically manages the Product Kit question bank of exactly 40 Polish questions and answered/skipped/import-covered distinctions. AI followups are an optional service. The question seed matches the code bank; it is not a single static questionnaire string.

`lib/ai` separates resume parsing, extraction, followups, requirement analysis, evidence matching, composition and additional validation. Each has typed input/schema output, operation/prompt version, timeout/retry and usage callback. Provider returns JSON mode; Zod rejects malformed output. Exact-source validation is independent of model opinion.

`lib/jobs` holds the offline parser and constrained URL fetcher. Requirement evidence is stored relationally. Automatic lexical matches are deliberately conservative and require human review before being treated as proof.

`lib/resume` retrieves usable facts, ranks/selects role-relevant evidence, composes section order and validates fact references. Templates change ordering and typography. `lib/documents` extracts text and generates selectable Unicode PDF and editable DOCX; generated private files are indexed in generated_documents.

The operation functions are separate from route orchestration so imports and AI work can move to a background runner without changing factual schemas. Job offers, requirements and CV versions form extension points for future application tracking and recommendations. This release does not send applications or recruiter messages.

## Deliberate limitations

The conservative generation policy allows selecting/ordering exact approved statements rather than freely paraphrasing professional claims. Language switches document headings and instructions; source facts retain their original language. The user must confirm translations/new wording before use. The UI is Polish-first with the supplied Polish interview and document options, not a fully localized English application shell. Direct employment chronology and contact details should be supplied as structured experiences/facts. There is no autonomous OCR, employment verification, recruiter messaging or paid billing.
