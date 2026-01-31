Project development guidelines (Second Brain)

Scope and audience
- Audience: advanced developers contributing to this repository.
- Focus: project-specific build, configuration, testing, and development tips. Generic Node/Vite/Vitest knowledge is assumed.

1) Build and configuration
- Package manager: pnpm (root package.json pins a pnpm version via packageManager field). Use the root pnpm; do not mix npm/yarn.
- Node: target modern ESM. Typescript 5.9.3. Vite 7 is used for client build; esbuild is used to bundle the server entry for production.
- Monorepo layout:
  - server: Node/Express + tRPC endpoints, TypeScript, Drizzle ORM for MySQL.
  - client: React app (Vite). Module aliases are configured.
  - shared: Shared code between client and server; exposed via @shared alias.
  - mobile: Expo React Native app (separate package.json) – not involved in server build, but commands exist to start it.

- Module resolution and aliases
  - TS paths (tsconfig.json):
    - @/* -> ./client/src/*
    - @shared/* -> ./shared/*
  - Vitest/Vite aliases (vitest.config.ts):
    - @ -> <repo-root>/client/src
    - @shared -> <repo-root>/shared
    - @assets -> <repo-root>/attached_assets

- Environment configuration
  - Most server features are gated by environment variables read from server/_core/env.ts. Key ones:
    - DATABASE_URL: MySQL connection string for Drizzle. If unset, database operations become no-ops with warnings (see server/db.ts), which allows tests to run but data-dependent tests may not behave as expected.
    - JWT_SECRET, VITE_APP_ID, OAUTH_SERVER_URL, OWNER_OPEN_ID, BUILT_IN_FORGE_API_URL, BUILT_IN_FORGE_API_KEY: various runtime features; not required to run tests that mock tRPC context.
  - Drizzle CLI (drizzle.config.ts) hard-requires DATABASE_URL when running drizzle-kit commands (generate/migrate).

- Build commands (root)
  - pnpm install
  - pnpm build
    - Runs vite build for client and bundles server/_core/index.ts via esbuild to dist/ (ESM output). Note: On Windows PowerShell, cross-env is not used; start script sets NODE_ENV via inline assignment only on Unix shells. Use $env:NODE_ENV="production"; node dist/index.js on Windows.
  - pnpm start
    - Starts the built server (expects dist/index.js). Ensure environment variables are set beforehand.
  - pnpm dev
    - tsx watch server/_core/index.ts for dev server.

- Mobile workspace
  - Start with pnpm run mobile:start at repo root (delegates to mobile/package.json -> expo start). Mobile’s dependencies are managed independently under mobile/.

2) Testing information
- Test runner: Vitest (v2). Config at vitest.config.ts with:
  - root: repo root resolved at runtime.
  - environment: node
  - include patterns: server/**/*.test.ts and server/**/*.spec.ts
  - Aliases mirror the main app’s config.

- Commands
  - Run entire suite: pnpm test (maps to vitest run)
  - Run a single file: pnpm vitest run server\\auth.logout.test.ts
  - Run by pattern: pnpm vitest run server\\**\\auth*test.ts
  - Watch mode (interactive): pnpm vitest

- Database behavior in tests
  - server/db.ts lazily creates a Drizzle connection only if DATABASE_URL is set. Otherwise, DB functions log a warning and no-op/return undefined. This enables unit-like tests to run without a DB, but any test asserting persistence or reads must either:
    1) Provide a real DATABASE_URL pointing to a disposable/dev MySQL instance, or
    2) Stub/mock the DB layer (preferable for unit tests), or
    3) Guard expectations when DB is unavailable.

- tRPC testing
  - Use appRouter.createCaller(ctx) with a constructed TrpcContext. See server/auth.logout.test.ts for an example of constructing ctx with user and minimal req/res.
  - To test cookie behavior, inject a res object that records calls (see CookieCall usage in the logout test).

- Adding tests
  - Place unit/integration tests under server/ with .test.ts or .spec.ts suffix; they will be auto-discovered by vitest per the include patterns.
  - Prefer isolating tests from the database by:
    - Mocking exports from server/db.ts with vi.spyOn or vi.mock to return deterministic results.
    - Alternatively, set DATABASE_URL to point to a local MySQL (e.g., Docker) and run migrations before tests.
  - Use the defined aliases (@, @shared) to import shared utilities.

- Creating and running a simple test (demonstrated)
  - We verified selective test execution with a self-contained test that does not touch the DB. Command used:
    - pnpm vitest run server\\smoke.ok.test.ts
    - Result: passed locally. The file has since been removed to keep the repository clean, but the command format and discovery behavior are valid.
  - You can reproduce with your own throwaway file during development and delete it before committing.

- Known failing test caveat
  - As of this writing, server/personality.test.ts contains a case that expects persisted data. Without DATABASE_URL configured, the DB layer returns undefined and that test will fail. Either set DATABASE_URL for local runs or mock/stub DB functions in that test.

3) Additional development information
- Code style
  - Prettier is configured; use pnpm format to enforce formatting.
  - TypeScript is strict. tsconfig excludes test files from tsc ("**/*.test.ts"); rely on Vitest type-checking during test runs.

- Drizzle ORM
  - Migrations: pnpm db:push (runs drizzle-kit generate && migrate). Requires DATABASE_URL and valid connection.
  - Schema location: drizzle/schema.ts with generated files in drizzle/.
  - The server’s db.ts implements graceful degradation when no DB is configured; do not assume calls throw—many return undefined while logging.

- Server runtime
  - Dev: pnpm dev (uses tsx). Production build bundles server/_core/index.ts. On Windows, set env vars via $env:NAME="value".
  - Ports: server/_core/index.ts reads PORT from env; defaults to 3000.

- Aliases and imports
  - Use @ for client/src and @shared for shared code to avoid brittle relative paths. Vitest and Vite respect the same aliases.

- Mobile notes
  - The mobile app uses Expo SDK 51 and React Native 0.75. Use pnpm --filter mobile <cmd> or cd mobile to manage dependencies. Root script mobile:start is a convenience wrapper.

- Patches and overrides
  - pnpm patches directory contains a patch for wouter@3.7.1. The root package.json also pins nanoid for tailwindcss via pnpm.overrides.

Troubleshooting
- Tests fail due to DB warnings
  - Symptom: logs like "[Database] Cannot get/save ... database not available" and assertions on returned entities fail.
  - Fix: set DATABASE_URL, or mock/stub the DB methods in the test.

- Windows environment
  - For production run locally: $env:NODE_ENV="production"; node dist/index.js
  - For tools that assume Unix-style env assignment in scripts, prefer running them via pnpm script or set env vars using PowerShell syntax.

Quick command reference
- Install deps: pnpm install
- Format: pnpm format
- Type-check: pnpm check
- Dev server: pnpm dev
- Build: pnpm build
- Start (prod): set env + pnpm start (or PowerShell: $env:NODE_ENV="production"; node dist/index.js)
- Tests (all): pnpm test
- Tests (single file): pnpm vitest run server\\auth.logout.test.ts
- Drizzle generate+migrate: pnpm db:push (requires DATABASE_URL)
