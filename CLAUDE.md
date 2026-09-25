# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Interview Board coordinates interviewers and candidates during a hiring loop. It has two independent
projects: `backend/` (Java 17, Spring Boot 4, Maven, Spring Data JPA) and `frontend/` (React 19 + Vite).
There is no root build; run commands from inside each directory.

## Commands

Backend (`cd backend`, requires JDK 17+):

```bash
./mvnw spring-boot:run                      # http://localhost:8081, SQLite file backend/interviewboard.db
./mvnw test                                 # all tests
./mvnw test -Dtest=InterviewerServiceTest   # one test class
./mvnw test -Dtest=InterviewerServiceTest#methodName   # one test method
SPRING_PROFILES_ACTIVE=postgres DB_URL=jdbc:postgresql://localhost:5432/interviewboard \
  DB_USERNAME=postgres DB_PASSWORD=postgres ./mvnw spring-boot:run   # Postgres instead of SQLite
```

The default SQLite database (`SQLITE_PATH` overrides the file location) persists across restarts; delete
the file to reset. The pool is capped at one connection because SQLite allows a single writer. The
schema comes from `ddl-auto=update`; there are no migrations. `InterviewBoardApplicationTests`
overrides the URL to an in-memory SQLite database.

Frontend (`cd frontend`):

```bash
npm install
npm run dev                                   # http://localhost:3000
npm test                                      # vitest run (jsdom, globals enabled)
npx vitest run src/components/TagInput.test.jsx   # one test file
npx vitest run -t "test name"                 # tests matching a name
npm run lint                                  # oxlint (not ESLint)
npm run build
```

## Architecture

**Backend** follows a `web` (controllers) → `service` → `repository` layering under
`com.interviewboard`. Controllers only exchange DTOs (`dto/`); services map between JPA entities
(`model/`) and DTOs through private `applyDto` / `toDto` methods and throw `ResponseStatusException`
for 404 and 400 errors. There is no global exception handler.

- API surface: CRUD on `/api/interviewers` and `/api/candidates` (`GET`/`POST`, `PUT`/`DELETE /{id}`),
  plus `PATCH /api/candidates/{id}/status` with body `{ "status": ... }` (`CandidateStatus`: SCHEDULING,
  SCHEDULED, DONE, REJECTED).
- `Candidate` owns the `@ManyToMany` (EAGER) to `Interviewer` through the `assignments` join table.
  `Interviewer` has no back-reference. On the wire, candidates carry `interviewerIds`, not nested
  objects.
- Skills are `@ElementCollection` string sets (`interviewer_skills`, `candidate_skills`) backed by
  `LinkedHashSet` to preserve insertion order.
- Interviewer **availability is derived, not stored**. `InterviewerService.toDto` loads all
  candidates and counts the ones in `SCHEDULING` or `SCHEDULED` that reference the interviewer. That
  gives `available` (count == 0) and the active count. Any change to candidate status or assignments
  therefore changes interviewer DTOs.
- CSV import (`POST /api/interviewers/import`, multipart field `file`) is parsed by hand in
  `InterviewerService.importCsv`: a `name` column is required, an optional `role` column holds a case-insensitive
  `InterviewerRole` (DEV, AT, DEVOPS, QA; unknown values reject the file), an optional `stack` column holds
  `;`-separated skills, and fields are split on commas without quote handling.
  `sample-interviewers.csv` at the repo root is example input.
- CORS for `/api/**` is set to allow only `http://localhost:3000`, in `web/WebConfig.java`. If the
  frontend port changes, update it there too.

**Frontend**: `App.jsx` holds all state. It fetches interviewers and candidates together and passes
them, a derived `allSkills` list, and a `reload` callback to `InterviewersTab` and `CandidatesTab`.
Components call `api.js` for mutations, then call `reload()` to refetch everything; nothing is
updated optimistically. `api.js` is the only place that talks to the backend. `VITE_API_URL`
overrides the base URL and must include the `/api` suffix (default `http://localhost:8081/api`).
`src/roles.js` mirrors the backend `InterviewerRole` enum (value and display label). If you add or rename
a role, update both. An interviewer's `role` is nullable. The interviewer filter (`src/interviewerFilter.js`)
matches each tag case-insensitively against the interviewer's skills and role, using either the enum value
or the label. An interviewer is shown only when every tag matches. Icons come from `lucide-react`. `papaparse` is installed but not yet used, because CSV parsing
happens on the server.

## Testing notes

- Backend service tests are plain JUnit 5 + Mockito with mocked repositories.
  `InterviewerControllerTest` is a `@WebMvcTest`.
- Frontend tests use Vitest + React Testing Library + `@testing-library/user-event`, with
  `jest-dom` matchers loaded in `src/setupTests.js`.

## Roadmap context

Phase 0 (scaffold) and Phase 1 (data model, wired end to end) are done. Next up are Phase 3
(multi-user/auth, if needed) and the Phase 4 backlog: job-title filter, calendar view, candidate CSV
import/export, skill-mismatch warnings, notifications, and interview notes.
