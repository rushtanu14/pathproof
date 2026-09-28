# Verification receipt

Verified locally on September 19, 2026 with Node.js 24.19.0 and npm 11.17.0.

## Fresh results

- `npm run test:coverage`: 43 tests passed across four files; 100% statements, branches, functions, and lines for the domain modules.
- `npm run build`: TypeScript project build and Vite production build passed.
- `npm run test:e2e`: 18 production-browser checks passed across desktop and mobile Chromium, including a control-by-control audit.
- `npm audit --audit-level=moderate`: 0 known vulnerabilities.

The browser suite covers every visible button, link, disclosure, selector and file input; the seeded 6/8 failure, counterexample replay, repair and 8/8 rerun, persistence, corrupt-save recovery, JSON validation, all example options, ambiguity and cycle evidence, full report downloads, zero and maximum input counts, keyboard use, reduced motion, and horizontal overflow.

## Review boundary

The validator is the input trust boundary and rejects unknown fields, malformed conditions, duplicate identifiers, invalid references, and oversized models before they reach the checker. The checker stops on missing or overlapping routes instead of selecting an unstated priority. Exported evidence contains the complete validated model and every enumerated assignment.

The result is exhaustive only for a validated model with fixed boolean inputs. It does not certify a live form, external service, timing behavior, changing inputs, or behavior omitted from the model.
