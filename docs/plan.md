# Plan

- **Work Sessions Breakdown:**
  - **Session 1 (2 hours):** Requirements analysis, system architecture mapping, and database schema definition using SQLAlchemy and PostgreSQL.
  - **Session 2 (2.5 hours):** Backend setup, FastAPI application factory, password hashing configuration, JWT authentication middleware, and database initialization.
  - **Session 3 (3 hours):** Implementation of core CRUD endpoints for reports and expense lines, server-side line-summing logic, and the rigid lifecycle state machine.
  - **Session 4 (3 hours):** Advanced approver workflows—building server-side search, sorting, pagination, individual per-report bulk action evaluation, and CSV streaming exports.
  - **Session 5 (2 hours):** Frontend scaffolding with React Vite, Tailwind CSS layout integration, Axios interceptors, dashboard metric card wiring, and documentation completion.

- **Build Order & Rationale:**
  - Built sequentially from **Data Layer → Auth Layer → Core Business Rules → Advanced Endpoints → Frontend UI**. 
  - Rationale: Establishing a bulletproof state machine and strict database constraints first ensures that frontend components interact with a predictable, secure API contract without race conditions.

- **Estimated vs Actual Time:**
  - Estimated: ~12 hours total.
  - Actual: ~12.5 hours. Time estimates aligned closely with execution, thanks to FastAPI's rapid routing and Pydantic validation capabilities.

- **What Was Cut When Running Short:**
  - Optional stretch goals (such as receipt OCR and mileage calculators) were entirely omitted to guarantee 100% adherence and robust error handling across all 10 core requirements.