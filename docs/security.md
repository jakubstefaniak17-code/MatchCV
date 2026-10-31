# Security and privacy review

## Implemented boundaries

- Supabase cookie sessions validated server-side with `auth.getUser`; no client-only authorization.
- Every protected API obtains its current user independently. Repository lookups filter user_id. RLS with composite owner FKs prevents cross-owner links.
- Mutations require exact same Origin. Zod validates inputs. Service role is used only by account deletion and never client code.
- Upload extension/MIME/signature, byte and extracted text limits; DOCX uncompressed central-directory budget; private owner-prefix storage. Scanned PDFs fail clearly. Uploaded content is untrusted, not executable.
- AI system rules are separate from JSON user data. Imported and interview facts remain unconfirmed. Only confirmed, included, non-confidential facts enter CV composition. No full CV/answer logging.
- Deterministic exact-text/source-ID validation at save and export; changed/rejected/confidential facts invalidate old documents. Missing evidence is not absence of competence.
- Database-backed rate RPC for imports, analysis, generation, followups and exports. Rate data cannot be edited by authenticated clients. Auth endpoint abuse limits are Supabase's configured Auth limits; add platform WAF limits in production.
- URL imports are default-off, exact-host allowlisted, HTTPS, no credentials/redirects, public DNS addresses with connection pinning, bounded bodies, robots check. No login/CAPTCHA bypass.

## Deletion

Settings requires typing DELETE. Server verifies session, removes private Storage objects recursively before `auth.admin.deleteUser`; foreign keys cascade user-owned database records. If deletion fails, surface a retryable error; it is not an atomic distributed transaction. An operator must monitor partial failures. Backups and external AI-provider retention follow separate documented operator policies; do not promise immediate deletion from backups/provider logs.

## Export

Personal JSON export includes all listed user-owned relational data and five-minute signed links for private uploaded/generated files. Treat that export as confidential. Download file links within five minutes. Export is not sent by email.

## Before real-user launch

- Exercise A–L against a dedicated staging Supabase and configured external provider.
- Obtain legal review of privacy/terms, controller identity, retention, processing basis and international transfers. Publish operator contact details.
- Choose production SMTP, auth rate/WAF settings, dependency review/alerts, backup/restore practice and monitoring.
- Sandboxed document parsing/OCR and malware scanning are future hardening. Current synchronous parser limits do not provide complete protection against every hostile PDF/ZIP.
- Secrets rotation and provider spend controls remain operator responsibilities.

No claim of audited security or GDPR compliance is made.
