# Architecture

- **Moving Pieces & Communication:** 
  - **Client (Frontend):** React.js Single Page Application. Communicates with the backend via REST API over HTTPS.
  - **Server (Backend API):** Python with FastAPI. Handles JWT session authentication, role-based permissions, server-side line calculations, lifecycle state transition checks, and CSV export.
  - **Database:** PostgreSQL managed database using SQLAlchemy ORM for relational queries and integrity.

- **Where Each Piece Runs:**
  - Frontend static assets run on Vercel.
  - Backend API runs on Render.
  - PostgreSQL DB runs on Render Managed PostgreSQL.

- **Request Path for User Action (e.g., Submitting a Report):**
  1. Client sends request to `POST /api/reports/{id}/submit` with a Bearer token.
  2. FastAPI dependency (`get_current_user`) decodes the JWT and fetches the user.
  3. Route handler checks:
     - Is `report.owner_id == current_user.id`?
     - Is report currently `DRAFT` or `REJECTED`?
     - Are there expense lines present?
  4. Database Transaction (`db.commit()`):
     - Updates status to `SUBMITTED`.
     - Appends an entry to `ReportHistory` recording old status, new status, actor, and timestamp.
  5. API responds with the updated report object.