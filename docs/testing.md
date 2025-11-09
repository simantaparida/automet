# Testing Guide

This project includes focused linting, unit, and end-to-end suites that integrate with CI. The sections below explain how to run each layer locally and what to expect.

## Prerequisites

- Node.js ≥ 20 (see `package.json` ➝ `"engines"`)
- Install dependencies once: `npm install`
- For Playwright E2E tests, install the Chromium binary: `npx playwright install --with-deps chromium`

> **Branch protection:** in GitHub, require the `CI` workflow to pass before merging into `develop` and `main`. This mirrors the manual workflow described below (build → lint → Jest → Playwright).

## Linting

| Command | Use Case |
| ------- | -------- |
| `npm run lint:core` | Fast sanity check over the highest-risk files (APIs, landing components, shared libs). |
| `npm run lint` | Full workspace lint; slower but ensures no regressions before CI or commit. |
| `npm run lint:fix` | Auto-fix any fixable issues reported by ESLint. |

## Unit Tests

| Command | Use Case |
| ------- | -------- |
| `npm run test` | Jest in watch mode (good while iterating on a specific suite). |
| `npm run test:ci` | CI-ready run with coverage and limited workers. |

Coverage is collected for the core server code (`src/lib/auth-middleware.ts`, API handlers, ROI utilities). Thresholds are enforced in `jest.config.js` (currently 65% global minimum for functions/lines/statements, 60% for branches).

## End-to-End (Playwright)

| Command | Use Case |
| ------- | -------- |
| `npm run test:e2e` | Execute Playwright specs (Chromium). |
| `npx playwright show-report` | Open the most recent HTML report locally. |

Before running E2E locally:

```bash
npx playwright install --with-deps chromium
# optionally set env vars required by the app (see .env.example or README)
```

Traces are retained automatically on failure (`trace: 'retain-on-failure'`). In CI the generated HTML report is uploaded as an artifact (`playwright-report`) for easier debugging.

## Typical Local Workflow

1. `npm run lint:core`
2. `npm run test:ci`
3. `npm run build`
4. (Optional) `npm run test:e2e`

Running these steps locally mirrors the CI workflow and keeps the repository ready for Phase 3/4 automation work.***

