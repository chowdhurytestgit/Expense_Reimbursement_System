# Schema

- **Table by Table Breakdown:**
  - `users`: Stores user credentials and role definitions.
    - `id` (String, PK), `email` (String, Unique), `hashed_password` (String), `name` (String), `role` (Enum: EMPLOYEE, APPROVER).
  - `expense_reports`: Main entity capturing high-level report metadata.
    - `id` (String, PK), `title` (String), `start_date` (DateTime), `end_date` (DateTime), `status` (Enum: DRAFT, SUBMITTED, APPROVED, REJECTED, PAID), `is_archived` (Boolean), `owner_id` (String, FK to users), `total_amount` (Numeric 10,2), `submitted_at` (DateTime, Nullable), `created_at` (DateTime).
  - `expense_lines`: Individual line items belonging to a report.
    - `id` (String, PK), `report_id` (String, FK), `date` (DateTime), `amount` (Numeric 10,2), `category` (String), `description` (String).
  - `report_history`: Immutable audit trail tracking state changes.
    - `id` (String, PK), `report_id` (String, FK), `actor_id` (String, FK), `old_status` (String, Nullable), `new_status` (String), `reason` (String, Nullable), `comment` (String, Nullable), `created_at` (DateTime).
  - `alert_dismissals`: Tracks stale alert acknowledgments per approver.
    - `id` (String, PK), `report_id` (String, FK), `approver_id` (String, FK), `dismissed_at` (DateTime).

- **Relationships:**
  - **One-to-Many:** `users` → `expense_reports` (Owner), `users` → `report_history` (Actor), `expense_reports` → `expense_lines`, `expense_reports` → `report_history`.
  - **Many-to-Many / Join Tables:** `alert_dismissals` (linking reports and approvers with dismissal metadata).

- **Constraint Enforcement Location:**
  - **Database Level:** Foreign key constraints with cascade deletes, unique constraints on emails and alert dismissals, and strict `Numeric(10,2)` type precision for financial calculations.
  - **Application Level:** Self-approval prevention (`current_user != report.owner`), lifecycle state transition validity, mandatory rejection reasons, dynamic server-side aggregation of line item totals, and multi-stage stale alert reappearance rules.

- **Deliberate Denormalization:**
  - `total_amount` is cached directly on the `expense_reports` table and updated dynamically via server hooks whenever lines are added or removed. This prevents expensive runtime `SUM()` subqueries across millions of lines during pagination, sorting, and dashboard fetches.

- **What Would Break First at 100x Data:**
  - The dashboard weekly payment trend aggregation and server-side ILIKE string searches over report titles will begin to bottleneck. Mitigation path: add composite indexes on `(status, submitted_at)`, index `owner_id`, and implement PostgreSQL full-text search (`pg_trgm`) for efficient text matching.