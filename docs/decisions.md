# Decisions

## Decision 1
- **Chose:** Python FastAPI + SQLAlchemy backend paired with a React.js (Vite) frontend.
- **Rejected:** Monolithic Django or Next.js full-stack framework.
- **Why:** Separating the API layer from the SPA ensures clean separation of concerns, strict type validation via Pydantic, and fast frontend bundling, aligning closely with modern enterprise micro-architecture patterns.

## Decision 2
- **Chose:** Append-only `report_history` table for tracking status transitions.
- **Rejected:** Overwriting a single `status` column in place or updating a simple modified timestamp.
- **Why:** Goal 9 mandates an immutable, unalterable audit trail containing old/new statuses, actors, rejection reasons, and comments. An append-only log guarantees historical integrity.

## Decision 3
- **Chose:** Separate `alert_dismissals` table tracking `dismissed_at` timestamps.
- **Rejected:** A simple boolean flag (`is_dismissed`) directly on the report model.
- **Why:** Goal 10 specifies that dismissed stale alerts must reappear if the report remains undecided after a *further* set number of days. A timestamp enables precise delta calculations against elapsed time.

## Decision 4
- **Chose:** Dynamic server-side calculation for report totals (`total_amount`).
- **Rejected:** Allowing the client payload to pass a custom total amount during submission.
- **Why:** Prevents tampering vulnerabilities and strictly enforces Goal 3 rules (totals are always calculated by the server from line items).

## Decision 5
- **Chose:** Iterative per-report evaluation loop within a transactional wrapper for bulk actions.
- **Rejected:** An atomic all-or-nothing batch transaction across all selected report IDs.
- **Why:** Goal 7 requires bulk actions to evaluate each report individually and return detailed success/failure metadata—specifically naming reports rejected because the approver owned them while letting valid approvals pass.
- **Later reversed:** Initially attempted a pure batch SQL update query for performance, but realized it lacked granular error reporting per row. Switched to sequential row-level evaluation with individual try/except blocks to satisfy exact compliance requirements.