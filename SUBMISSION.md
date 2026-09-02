# Submission

## Links

- **GitHub repository:** https://github.com/chowdhurytestgit/Expense_Reimbursement_System
- **Live application:** https://expense-reimbursement-frontend.vercel.app

## Notes for the reviewer

The FastAPI backend is hosted on Render's free tier. The first request may take up to 50 seconds to complete as the container wakes up from an idle state. The PostgreSQL database is hosted on Supabase and is always active. 

For the bulk approval workflow (Goal 7), selecting multiple reports evaluates them sequentially on the server. If an approver accidentally selects a report they own, it will gracefully fail that specific item and list the reason in the UI, while successfully approving the rest.

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@company.com | Demopass123! |
| Approver | approver@company.com | Demopass123! |

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | React (Vite) + Tailwind CSS | Provides a highly responsive, clean SPA user experience with rapid UI prototyping capabilities. |
| Backend | Python + FastAPI | Excellent performance, strict Pydantic type validation for request payloads, and automatic OpenAPI documentation. |
| Database | PostgreSQL + SQLAlchemy | Required strict relational integrity for the immutable audit logs (ReportHistory) and complex constraints (preventing self-approval). |
| Hosting | Vercel (UI), Render (API), Supabase (DB) | Best-in-class free tier services that separate concerns cleanly between static assets, API computation, and data persistence. |

## Goal checklist

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Accounts and roles | Done | Enforced strictly in FastAPI route dependencies. |
| 2 | Expense reports | Done | Full CRUD with soft-delete (archiving). |
| 3 | Expense lines | Done | Totals are calculated dynamically by `func.sum` on the backend. |
| 4 | A report lifecycle with rules | Done | Implemented via explicit state machine logic and database transactions. |
| 5 | Assigned approvers | Done | Many-to-many relationship established; custom filtered views built. |
| 6 | Finding reports | Done | Server-side pagination, sorting, and ILIKE searching implemented via SQLAlchemy. |
| 7 | Acting on many reports at once | Done | Custom `/bulk-action` endpoint iterates over selections and handles individual row transactions and failures. Export to CSV streams directly from the API. |
| 8 | A dashboard | Done | Dedicated metrics endpoint feeds React components. |
| 9 | History you cannot rewrite | Done | `ReportHistory` table is append-only. API has no PUT/DELETE methods for this table. |
| 10| Stale-approval alerts | Done | Frontend polls `/alerts` endpoint to populate the navigation badge. |

## How much time did you actually spend?
Approximately 11.5 hours spread across 5 days.

## What would you do next, with another 12 hours?
Implement the OCR-assisted amount extraction for receipt photos using a lightweight Python library (like Tesseract or an external API) and build out a dedicated multi-level approval chain for expenses exceeding a specific threshold.

## What are you least happy with in this codebase, and why?
The stale-approval alert logic (Goal 10) currently relies on polling the backend on page load. In a production environment, I would transition this to a lightweight WebSocket connection or Server-Sent Events (SSE) to push notifications to the user without redundant network requests.