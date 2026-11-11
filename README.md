# CareerLine AI

CareerLine AI is the website for one testing and recommendation engine used by four groups:

- **Beginners** answer a short questionnaire and get ranked tech career paths, each with a matched programme.
- **Professionals** take adaptive skill tests and get a scored report they can download.
- **Recruiters** send role-specific tests to candidates and read a scored report before an offer.
- **Organisations** upload their staff list, run an audit, and see a team heatmap, employee reports and company targets.

Scores are decision support only. Every report says so.

---

## Running locally

```bash
git clone https://github.com/Growth-Hub-Tech/careerline.git
cd careerline
npm ci
npm run dev
```

`npm run dev` talks to an API on your machine (`http://localhost:8000/api/v1`, from `.env.development`). To use the test server instead, copy `.env.example` to `.env.local`: it sets `VITE_API_URL` to the test API. `.env.example` lists every setting.

## Scripts

| Command                 | What it does                                                   |
| ----------------------- | -------------------------------------------------------------- |
| `npm run dev`           | Starts the site at http://localhost:5173                       |
| `npm run test`          | Runs the unit tests                                            |
| `npm run type-check`    | Checks the TypeScript types                                    |
| `npm run lint`          | Checks the code style rules                                    |
| `npm run build`         | Builds the site into `dist/` (needs `VITE_API_URL` set)        |
| `npm run build:staging` | Builds the test site, talking to the test API (`.env.staging`) |
| `npm run size`          | Fails if a built file is over its size limit (run after build) |
| `npm run api:types`     | Regenerates the API types from `docs/openapi.json`             |

CI runs lint, format, type-check, tests, build and the size check on every pull request.

## How the code is laid out

```
src/
  pages/         one file per screen
  components/    shared building blocks (buttons, tables, dialogs, cards)
  routes/        page addresses, layouts, access rules per user type
  lib/api/       the request functions, every API route, the query cache, types from the API
  lib/api/queries/  the reads and writes per area, with what each write refreshes
  lib/user/      the signed-in user: store, provider, sign in and out
  lib/           helpers per area (tests, beginner, payments, organisation, recruiter, tasks)
  test/          fixtures and test setup
docs/openapi.json  the API description the types are generated from
```

## The API

Replies come as `{ success, data }`. Errors become an `ApiError` with a status, code, message and reference.

- **Routes**: every API address is in `src/lib/api/routes.ts` (`API_ROUTES`). A test checks each one against `docs/openapi.json`.
- **Requests**: `apiGet`, `apiPost`, `apiPut`, `apiPatch` and `apiDelete` (`src/lib/api`) take the route, then the payload, then options (`query`, `signal`, `auth: false` for requests that need no session).
- **Data**: pages read and write through TanStack Query (`@tanstack/react-query` v5). `src/lib/api/queries/` has a `queryOptions` factory for every read and a hook for every write; each write updates or refreshes the cached data it changes, so pages never do. Cache keys are in `queryKeys.ts`, defaults in `queryClient.ts`: 30 s fresh, 10 min for catalogues, one retry for a dropped connection or a server error, no refetch on window focus.
- **The signed-in user**: a Zustand store (`src/lib/user/store.ts`) keeps who is signed in and the type chosen on Get started. `UserProvider` checks a remembered user against `GET /accounts/me`, and clears all cached data when the user changes or signs out. `RequireAccess` is the only page guard.

Signing in sets the API's `careerline_session` cookie (HttpOnly, so page scripts never see the token), and every request is sent with `credentials: 'include'`. The browser only keeps the user's name, email and type. A 401 on a signed-in request signs the user out. The API must list the site's origin in its `CORS_ORIGINS`, and in production the site and the API must share a domain (for example `careerline.ng` and `api.careerline.ng`) for the cookie to be sent.

To update the types after the API changes, copy `openapi.json` from the careerline-api repository (the test server also serves it at `/openapi.json`; production does not), then regenerate them:

```bash
cp ../careerline-api/openapi.json docs/openapi.json
npm run api:types
```

## Deploying

The site is deployed on Netlify from `main`, and the test site from `dev` (`npm run build:staging`). A build fails unless `VITE_API_URL` is set, so set it in Netlify for every deploy context. `netlify.toml` sets the build, the single-page redirect, security headers and caching; the build writes the Content-Security-Policy into `dist/_headers`, allowing requests only to the site and the API in `VITE_API_URL`. The test site (`--mode staging`) also tells search engines not to index it. After each deploy, the **Live check** workflow opens the site and the API health check. See `docs/launch-checklist.md` before a release.
