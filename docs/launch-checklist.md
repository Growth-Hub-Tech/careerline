# Launch checklist

Work through this list before the site goes live, and again before any big release.

## Settings

- [ ] In Netlify, set `VITE_API_URL` to the live API address (ends in `/api/v1`) for every deploy context: a build without it fails.
- [ ] The site and the API share a domain (for example `careerline.ng` and `api.careerline.ng`): the sign-in cookie is only sent to the API from the same site. The API's `CORS_ORIGINS` lists the site's origin.
- [ ] The API that sets the sign-in cookie is deployed before this site (an older API only accepts the bearer token the site no longer keeps).
- [ ] In Netlify, set `VITE_SENTRY_DSN` so errors from real users reach Sentry, and turn on Sentry's server-side data scrubbing.
- [ ] Nothing to change for the Content-Security-Policy: the build writes it into `dist/_headers` with `connect-src` set to the API in `VITE_API_URL`.
- [ ] Set the contact settings from `.env.example` in Netlify.
- [ ] Paystack: the callback address is `<site>/payments/callback`. Confirm Paystack is in live mode with Joshua.

## Before the release

- [ ] Have the privacy policy and terms (`src/content/legal.ts`) reviewed by a lawyer.

- [ ] `npm run test`, `npm run type-check`, `npm run lint` and `npm run build` pass on `main`.
- [ ] `npm run size` passes.
- [ ] Walk the four journeys on the test site with Omotoke:
  - [ ] Professional: sign up, take a skill test, download the report.
  - [ ] Beginner: answer the questionnaire, see career paths, open a programme.
  - [ ] Recruiter: send a test, the candidate takes it, read the candidate report.
  - [ ] Organisation: upload the staff list, start an audit, read the heatmap and an employee report.
- [ ] Buy credits with a Paystack test card and see them arrive on the credits page.
- [ ] Try each journey on a phone (360 px wide) and with the keyboard only.

## After the release

- [ ] The **Live check** workflow passed for the deploy (GitHub → Actions).
- [ ] Open the site in a private window: home page, sign in, pricing.
- [ ] Check the response headers include `Content-Security-Policy` and `X-Frame-Options: DENY`.

## If something goes wrong

- In Netlify → Deploys, publish the previous deploy to roll back.
- Error messages show a reference number. Send it to Joshua to find the request in the API logs.
