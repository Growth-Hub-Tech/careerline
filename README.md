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
cp .env.example .env.local
npm run dev
```

`.env.example` lists the settings. `VITE_API_URL` points at the API; the default is the test server.

## Scripts

| Command              | What it does                                                   |
| -------------------- | -------------------------------------------------------------- |
| `npm run dev`        | Starts the site at http://localhost:5173                       |
| `npm run test`       | Runs every test, including the four journeys and accessibility |
| `npm run type-check` | Checks the TypeScript types                                    |
| `npm run lint`       | Checks the code style rules                                    |
| `npm run build`      | Builds the site into `dist/`                                   |
| `npm run size`       | Fails if a built file is over its size limit (run after build) |
| `npm run api:types`  | Regenerates the API types from `docs/openapi.json`             |

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

Some endpoints still return sample data from the test server (they send `X-Sample-Data: true`): test catalogue, profile, beginner path, programmes, privacy, payments, credits, subscriptions, recruiter, invitations and organisation audit. Their shape will not change when they become real.

To update the types after the API changes:

```bash
curl -sS https://careerline-api.onrender.com/openapi.json -o docs/openapi.json
npm run api:types
```

## Deploying

The site is deployed on Netlify from `main`. `netlify.toml` sets the build, the single-page redirect, security headers and caching. After each deploy, the **Live check** workflow opens the site and the API health check. See `docs/launch-checklist.md` before a release.
