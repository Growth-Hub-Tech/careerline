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
| `npm run test`          | Runs every test, including the four journeys and accessibility |
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
  pages/         one file per screen, with its test next to it
  components/    shared building blocks (buttons, tables, dialogs, cards)
  routes/        page addresses, layouts, access rules per user type
  lib/api/       the API client, one file per area, types from the API description
  lib/           helpers per area (tests, beginner, payments, organisation, recruiter)
  test/          fixtures, the accessibility check and test helpers
docs/openapi.json  the API description the types are generated from
```

## The API

Replies come as `{ success, data }`. Errors become an `ApiError` with a status, code, message and reference.

To update the types after the API changes, copy `openapi.json` from the careerline-api repository (the test server also serves it at `/openapi.json`; production does not), then regenerate them:

```bash
cp ../careerline-api/openapi.json docs/openapi.json
npm run api:types
```

## Deploying

The site is deployed on Netlify from `main`, and the test site from `dev` (`npm run build:staging`). A build fails unless `VITE_API_URL` is set, so set it in Netlify for every deploy context. `netlify.toml` sets the build, the single-page redirect, security headers and caching; the build writes the Content-Security-Policy into `dist/_headers`, allowing requests only to the site and the API in `VITE_API_URL`. The test site (`--mode staging`) also tells search engines not to index it. After each deploy, the **Live check** workflow opens the site and the API health check. See `docs/launch-checklist.md` before a release.
