# v0.4 document regression verification

The two retained templates consume the same ordered `ResumeDocument` blocks for PDF and DOCX. Structured employment is displayed as position / employer, followed by confirmed month-and-year dates and location, then responsibilities and results. An unknown end date is never interpreted as current employment; `isCurrent` must be explicit. The renderer keeps a position, its period and its short set of descriptions together when the group fits on a page. Long descriptions can still flow over pages. Hidden sections stay hidden, source ISO dates are unchanged, and legacy flat experience remains available.

The renderer does not shorten or invent factual content. It is downstream of the Career Engine factual validator and does not itself verify the truth of supplied fixture text.

## Executed on 2026-11-01

`npx vitest run tests/documents.test.ts`: **21 tests passed**. These check selectable Unicode PDF text, editable DOCX text, chronology and employer order, dates, all selected projects, hidden experience, unknown end dates, legacy documents, long identifiers, minimum 9pt type, A4 dimensions and two-page stress cases.

`node --import tsx scripts/qa-documents.ts /tmp/matchcv-document-qa-v04` generated 12 PDFs and 12 DOCX files from six entirely fictional profiles, in both retained templates. The profiles are layout fixtures, not proof that live AI generation has passed natural-language evaluation.

| Fictional scenario | Employers | PDF pages per template | DOCX pages per template |
| --- | ---: | ---: | ---: |
| Junior | 1 | 1 | 1 |
| Mid-level | 3 | 1 | 1 |
| Senior Project Manager | 4 | 2 | 2 |
| Executive | 5 | 2 | 2 |
| Large project portfolio | 4, plus 12 project descriptions | 2 | 2 |
| Career change | 3 | 1 | 1 |

All 12 DOCX files were actually converted with the canonical `render_docx.py` LibreOffice workflow, and their resulting pages inspected alongside Poppler-rendered PDF pages. PDF and DOCX page counts matched in all scenarios. A character-bounds audit found no text outside the content area; PDF type sizes were at least 9pt. Polish diacritics, chronology, multi-page continuation and distinct template hierarchy were checked. During inspection, a sparse trailing page in the mid-level fixture was corrected by adjusting shared paragraph spacing, without deleting content or reducing type below 9pt.

Artifacts were generated outside the checkout. Only fictional source fixtures and the reproducible generation script belong in Git. Actual user CVs were not used.

## Reproduce

1. Run `npm ci` and `node --import tsx scripts/qa-documents.ts /tmp/matchcv-document-qa-v04`.
2. Rasterize each generated PDF with `pdftoppm -png input.pdf output-prefix`.
3. Render each DOCX with LibreOffice, preferably the document skill's `render_docx.py input.docx --output_dir output --emit_pdf`; otherwise use an isolated LibreOffice user profile and `soffice --headless --convert-to pdf` followed by Poppler.
4. Inspect every resulting page. Compare extracted text to source fixture claims and confirm page boundaries, diacritics and heading positions.

Passing layout regression does not establish production Supabase/Auth/Storage availability, external AI editorial quality, or successful account flows. Those are reported separately.
