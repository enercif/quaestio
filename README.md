# Quaestio

Quaestio is a quiz platform for teachers built with SvelteKit. Teachers create quizzes made of multiple choice, single choice, open text, and programming (mark-the-line) questions, then run them either as a live, timed session with students joining a room code, or as a self-paced practice room students can revisit anytime. Teachers get analytics per room and per student afterwards.

## Tech stack

- **SvelteKit 2 / Svelte 5** — runes everywhere, plus SvelteKit's experimental [remote functions](https://svelte.dev/docs/kit/remote-functions) (`query`/`command`/`form`) for most data fetching and mutations.
- **Postgres + Drizzle ORM** for persistence, **better-auth** (with its organization plugin) for authentication and roles.
- **svelte-realtime** on top of **uWebSockets.js** (via `svelte-adapter-uws`) for the live quiz rooms (WebSocket pub/sub, presence, room state).
- **wuchale** for i18n (German/English), extracted at build time from the component markup — no manual `t('key')` calls.
- **Tailwind CSS v4** + **shadcn-svelte** (`bits-ui`) for styling/UI primitives.

## Getting started

Requirements: Node 22+, [pnpm](https://pnpm.io), Docker (for the local Postgres instance).

```sh
pnpm install
cp .env.example .env   # fill in DATABASE_URL, BETTER_AUTH_SECRET, SMTP, etc.
pnpm db:start           # starts Postgres in Docker
pnpm db:migrate          # applies drizzle/ migrations
pnpm dev                 # http://localhost:5173
```

On first start, no user exists yet — the app shows a setup screen to create the first admin account. Alternatively, set `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` to have that first account created automatically on server startup.

### Useful scripts

| Command                            | What it does                                   |
| ---------------------------------- | ---------------------------------------------- |
| `pnpm dev`                         | Start the dev server                           |
| `pnpm build` / `pnpm preview`      | Production build / preview it locally          |
| `pnpm check`                       | Type-check the whole project (`svelte-check`)  |
| `pnpm lint` / `pnpm format`        | Check / auto-fix Prettier + ESLint             |
| `pnpm db:start` / `pnpm db:remove` | Start/stop the local Postgres Docker container |
| `pnpm db:generate`                 | Generate a new migration from schema changes   |
| `pnpm db:migrate`                  | Apply pending migrations                       |
| `pnpm db:studio`                   | Open Drizzle Studio to inspect the database    |

There is currently no automated test suite

## Code structure

```
src/
├── routes/            SvelteKit pages (see below)
├── live/rooms.ts       Live-room domain logic: DB access, pub/sub, timer/answer state machine
├── hooks.server.ts     Per-request hooks: locale, auth
├── hooks.ws.ts         WebSocket hook wiring for svelte-realtime
├── locales/            wuchale-generated i18n catalogs (.po files + compiled output)
└── lib/
    ├── components/
    │   ├── quiz/
    │   │   ├── editor/         Quiz editor UI — one editor-<type>-question.svelte per question type
    │   │   ├── live/            Live-room UI, split into teacher/ and student/ views
    │   │   ├── practice/        Practice-room UI + PracticeState (local, no server round-trip)
    │   │   ├── question-runner/ Shared question renderer (live + practice) — reads a QuestionRunnerState
    │   │   │                    from context (question-runner.state.svelte.ts: a { type: 'live' | 'practice' }
    │   │   │                    union, set by whichever of PracticeState/live student state is active).
    │   │   │                    deriveRunner() there is the one place that branches on the type; only
    │   │   │                    question-runner.svelte reads the context, then dispatches to one
    │   │   │                    question-runner-<type>.svelte per question type (choice/open/programming)
    │   │   │                    plus question-runner-result.svelte for the revealed-answer view
    │   │   └── quiz.utils.ts    Shared scoring/answer/timer helpers — reuse this before adding new logic
    │   ├── analytics/     Teacher-facing analytics components + analytics.utils.ts
    │   ├── admin/         Org admin UI (users, SMTP settings)
    │   └── ui/            Generated shadcn-svelte primitives — don't hand-edit, regenerate via `pnpm dlx shadcn-svelte`
    ├── remote/            One *.remote.ts file per feature area (quiz, users, smtp, analytics, ...) —
    │                       SvelteKit remote `query`/`command` functions, this is where server-side
    │                       reads/writes and authorization checks live
    ├── schemas/           Zod schemas — the source of truth for most domain types (Question, Quiz, Room, Answer, ...)
    ├── server/            Server-only code: db client, auth setup, org/role lookup, mail, presence/occupancy
    ├── state/             Cross-route runes state (currently just the locale)
    ├── import/ export/     CSV/XLSX quiz import and export
    └── types/             Small hand-written types not derived from a Zod schema
```

### Routes (`src/routes`)

- `/` — join-a-room / practice landing page, `/login` (also doubles as first-admin setup)
- `/student/r/[code]` — live quiz room a student joins with a room code
- `/student/practice/[id]` — self-paced practice room
- `/student` — list of available practice quizzes
- `/teacher/quizzes`, `/teacher/quizzes/[id]` — quiz list and editor
- `/teacher/quizzes/[id]/preview` — teacher-facing practice-room preview of a quiz
- `/teacher/live`, `/teacher/live/[id]` — live room dashboard and control view
- `/teacher/analytics/...` — per-room and per-student result analysis
- `/teacher/admin/...` — org admin: users/invitations, SMTP settings

Most routes load data via `+page.server.ts` `load()`; several newer feature areas (admin, analytics) instead call remote functions directly from the `.svelte` file via `$derived(await ...)`. When adding a route, prefer whichever pattern the surrounding routes already use.

## Where to make common changes

- **Add a new question type** — schema in `src/lib/schemas/questions/`; editor UI as a new `editor-<type>-question.svelte` wired into the `{#if}` chain in `editor/editor-question.svelte`; how it's played/answered as a new `question-runner-<type>.svelte` wired into the `{#if}` chain in `question-runner/question-runner.svelte`; scoring/reveal logic in `src/lib/components/quiz/quiz.utils.ts` (`evaluateAnswer`, `revealAnswer`).
- **Change live-room behavior** (timer, pause, reveal, join rules) — `src/live/rooms.ts`.
- **Change quiz CRUD or authorization** — `src/lib/remote/quiz.remote.ts`.
- **Add a UI primitive** — check `src/lib/components/ui/` first (shadcn-svelte); only hand-write a component if nothing there fits.
- **Add a translatable string** — just write it in the component; wuchale extracts it automatically into `src/locales/*.po` on build/dev.
- **Change the DB schema** — edit `src/lib/server/db/schema.ts`, then `pnpm db:generate` to create a migration and `pnpm db:migrate` to apply it.

## Contributing

Run `pnpm check` and `pnpm lint` before opening a PR — both must pass. Keep new domain logic in the existing `*.utils.ts` files where it fits rather than reimplementing it inline in a component.
