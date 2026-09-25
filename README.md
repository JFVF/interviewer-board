# Interview Board

Coordinates interviewers and candidates during a hiring loop: who's interviewing whom, what
stack each person covers, and where each candidate is in the process.

- `backend/` — Java 17, Spring Boot 4, Maven, Spring Data JPA. A local SQLite file by default,
  a `postgres` profile for a shared database.
- `frontend/` — React (Vite), `lucide-react` for icons, `papaparse` available for future CSV
  work on the client (CSV import for interviewers currently happens server-side).

## Running the backend

Requires a JDK 17+.

```bash
cd backend
./mvnw spring-boot:run
```

Runs on `http://localhost:8081`, with a SQLite database (no setup needed). Data is stored in
`backend/interviewboard.db` and survives restarts; delete that file to start fresh, or set
`SQLITE_PATH` to put it elsewhere. Inspect it with any SQLite client, e.g.
`sqlite3 backend/interviewboard.db`.

To use Postgres instead, set `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` and run with the
`postgres` profile:

```bash
SPRING_PROFILES_ACTIVE=postgres DB_URL=jdbc:postgresql://localhost:5432/interviewboard \
  DB_USERNAME=postgres DB_PASSWORD=postgres ./mvnw spring-boot:run
```

### API

- `GET/POST /api/interviewers`, `PUT/DELETE /api/interviewers/{id}`
- `POST /api/interviewers/import` — multipart CSV upload, columns `name` (required),
  `role` (optional, case-insensitive `Dev` / `AT` / `DevOps` / `QA`; an unknown role rejects the
  file) and `stack` (optional, `;`-separated skills). See `sample-interviewers.csv`.
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
`InterviewerToggleChips`, `InterviewerForm`, the interviewer skill/role filter, and the `api`
client's fetch handling.

## Running with Docker

The whole app runs as **one image and one container**: the root `Dockerfile` builds the React
frontend, bundles it into the Spring Boot jar, and Spring Boot serves both the page and `/api` on
port 8081. The image contains no data; the SQLite database is created empty on first start.

```bash
docker compose up --build -d     # http://localhost:3000
docker compose logs -f app       # follow logs
docker compose down              # stop; data is kept
docker compose down -v           # stop and DELETE the database
```

Without compose:

```bash
docker run -d -p 3000:8081 -v interview-board-data:/data interview-board:latest
```

- The database lives in a Docker volume mounted at `/data` (`interviewer-board_data` when using
  compose). It survives restarts and rebuilds. Always mount a volume there, or the data is lost when
  the container is removed.
- Back up the database: `docker compose cp app:/data/interviewboard.db ./backup.db`.
- To seed an empty volume with an existing database file, copy it in **before the first start**.
  The copy runs as the container's user, so the app can write to it:

  ```bash
  docker compose up --no-start
  docker compose run --rm --no-deps \
    -v "$PWD/backend/interviewboard.db:/seed/interviewboard.db:ro" \
    --entrypoint sh app -c 'cp /seed/interviewboard.db /data/interviewboard.db'
  docker compose up -d
  ```

- The image build skips tests; run `./mvnw test` and `npm test` separately.

### Publishing to Docker Hub

The image is multi-arch (`linux/amd64` and `linux/arm64`, so it also runs on Apple Silicon). Both
build stages run on the build machine's own platform and the final stage only copies files, so no
emulation is needed. Build and push in one step (a multi-arch image is pushed as a manifest list):

```bash
docker login
docker buildx build --platform linux/amd64,linux/arm64 \
  -t <namespace>/interview-board:0.1.0 -t <namespace>/interview-board:latest --push .
```

Anyone can then run it with
`docker run -d -p 3000:8081 -v interview-board-data:/data <namespace>/interview-board:latest`.

## Status

Phase 0 (scaffold) and Phase 1 (data model) are done, wired end-to-end: interviewer/candidate
CRUD, skill filters, availability, status badges, and CSV import for interviewers all talk to
the real API instead of in-memory state. Both backend and frontend have unit test coverage.

Next up per the original plan: Phase 3 (multi-user/auth, if needed) and the Phase 4 feature
backlog (job-title filter, calendar view, candidate CSV import/export, skill-mismatch warnings,
notifications, interview notes).
