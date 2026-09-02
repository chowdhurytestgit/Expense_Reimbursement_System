# AI prompts

The prompts you actually used, in the order you used them, grouped by what you were trying to achieve. For each significant one: what you asked, what you got back, and what you had to correct.

Include at least one prompt that produced something wrong, and what you did about it.

## 1. Database Schema & Relational State Machine Design

### Prompt
> "Design a SQLAlchemy PostgreSQL schema for an enterprise Expense Reimbursement System adhering to 10 strict business rules: database-level role segregation, immutable audit logging, server-side dynamic line-item auto-summing, and recurring stale-approval alerts with dismissal state tracking."

### What you got
> Clean SQLAlchemy ORM models (`User`, `ExpenseReport`, `ExpenseLine`, `ReportHistory`) with foreign keys, cascading deletes, and enumeration constraints. However, it initially relied on a simple boolean flag (`is_dismissed`) for stale alerts.

### What you corrected
> Recognized that a boolean flag breaks the requirement for stale alerts to reappear if left undecided a further set number of days after dismissal. Replaced the boolean with an explicit `AlertDismissal` join model tracking a `dismissed_at` timestamp, allowing time-delta calculations on subsequent queue fetches.

---

## 2. FastAPI Transactional Routing & Business Rule Enforcement

### Prompt
> "Write a FastAPI router module for handling report submission, role-based approval/rejection checks, and bulk actions that evaluate each report individually—specifically catching self-approvals, checking state validity, and returning a detailed per-report result object."

### What you got
> A robust FastAPI implementation with dependency injection (`get_current_user`), atomic transaction blocks (`db.commit()`), and a loop for bulk processing. However, using Pydantic's `EmailStr` field threw an `ImportError` during runtime initialization because the underlying email validator package was missing from the environment.

### What you corrected
> Added `email-validator` to the backend dependencies and pinned `bcrypt==4.0.1` to resolve a known version mismatch exception (`AttributeError: module 'bcrypt' has no attribute '__about__'`) between newer bcrypt builds and Passlib during password hashing.

---

## 3. Frontend Layout Architecture & State-Driven Routing

### Prompt
> "Create a React (Vite) dashboard layout featuring a sidebar navigation, a top header with a live polling alert badge count, a protected routing configuration using React Router DOM, and responsive Tailwind CSS metric cards."

### What you got
> Clean Tailwind layout code and route structures, but the initial dashboard component imported a modular `Card` wrapper component from `../components/Card` that had not yet been declared in the component directory tree, causing Vite bundle pre-transform errors.

### What you corrected
> Created the missing `src/components/Card.jsx` stateless wrapper component, explicitly configured the React Router layout with an `index` route inside the `DashboardLayout` outlet, and wrapped Axios calls in try/catch blocks with default fallback values to ensure zero white-screen crashes on first load.