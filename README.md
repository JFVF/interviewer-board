# Interview Board

Coordinates interviewers and candidates during a hiring loop: who's interviewing whom, what
stack each person covers, and where each candidate is in the process.

- `backend/` — Java 17, Spring Boot 4, Maven, Spring Data JPA. H2 in-memory DB by default, a
  `postgres` profile for real persistence.
- `frontend/` — React (Vite), `lucide-react` for icons, `papaparse` available for future CSV
  work on the client (CSV import for interviewers currently happens server-side).

## Running the backend

Requires a JDK 17+.

```bash
cd backend
./mvnw spring-boot:run
```

Runs on `http://localhost:8081`, with an H2 in-memory database (no setup needed). The H2
console is available at `http://localhost:8081/h2-console` (JDBC URL
`jdbc:h2:mem:interviewboard`, user `sa`, empty password).

To use Postgres instead, set `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` and run with the
`postgres` profile:

```bash
SPRING_PROFILES_ACTIVE=postgres DB_URL=jdbc:postgresql://localhost:5432/interviewboard \
  DB_USERNAME=postgres DB_PASSWORD=postgres ./mvnw spring-boot:run
```

### API

- `GET/POST /api/interviewers`, `PUT/DELETE /api/interviewers/{id}`
- `POST /api/interviewers/import` — multipart CSV upload, columns `name`, `stack` (stack is
  `;`-separated skills)
- `GET/POST /api/candidates`, `PUT/DELETE /api/candidates/{id}`
- `PATCH /api/candidates/{id}/status` — body `{ "status": "SCHEDULED" }`
  (`SCHEDULING` / `SCHEDULED` / `DONE` / `REJECTED`)

An interviewer is "available" when none of their assigned candidates are in an active status
(`SCHEDULING` or `SCHEDULED`).

### Tests

```bash
cd backend
./mvnw test
```

JUnit 5 + Mockito unit tests for `InterviewerService` and `CandidateService` (including the
availability logic and CSV import parsing), plus a `@WebMvcTest` for `InterviewerController`.

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000` and expects the backend on `http://localhost:8081` (override
with `VITE_API_URL`). CORS is already configured on the backend for this origin.

### Tests

```bash
cd frontend
npm test
```

Vitest + React Testing Library, covering `TagInput`, `StatusFilter`, `AssignInterviewers`,
`InterviewerToggleChips`, and the `api` client's fetch handling.

## Status

Phase 0 (scaffold) and Phase 1 (data model) are done, wired end-to-end: interviewer/candidate
CRUD, skill filters, availability, status badges, and CSV import for interviewers all talk to
the real API instead of in-memory state. Both backend and frontend have unit test coverage.

Next up per the original plan: Phase 3 (multi-user/auth, if needed) and the Phase 4 feature
backlog (job-title filter, calendar view, candidate CSV import/export, skill-mismatch warnings,
notifications, interview notes).
