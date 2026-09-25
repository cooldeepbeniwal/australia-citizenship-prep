# Common Bond

## Australian Citizenship Test Trainer

Common Bond is an independent Australian citizenship test preparation PWA.

It is designed around the testable section of:

Australian Citizenship: Our Common Bond

## Features

- Full mock test (one-time A$4.99 unlock per signed-in account)
- Australian values practice
- Review missed questions
- Study all questions
- Study by topic
- Persistent progress statistics
- Mobile-first interface
- Installable PWA
- Offline support
- iPhone/iPad friendly
- No account required for free study modes
- Optional email sign-in and progress across devices (requires Supabase configuration)

The practice questions are independently written. They are not official test questions or a substitute for the current Home Affairs study booklet.

## Technology

- React
- Vite
- vite-plugin-pwa
- JavaScript
- CSS
- localStorage
- Supabase Auth and Postgres for signed-in progress

## Enable accounts and progress sync

1. Create a Supabase project and run `supabase/migrations/20260923000000_progress_events.sql` in its SQL editor.
2. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the project's API settings. These values are public browser keys. Never use the service role or secret key in Vite variables.
3. In Supabase Authentication → URL Configuration, set the Site URL to your production site and add both the production origin and local development origin (`http://localhost:5173`) to Redirect URLs. Email OTP must be enabled.
4. Add the same two `VITE_` environment variables to the site's hosting environment and redeploy. Without them, the app remains a guest-only practice tool.

Practice while signed out remains on the device. On sign-in, existing guest totals are imported once, and new attempts sync when online. The same email address must be used on each device. Supabase's default email sender is limited; configure a production SMTP provider before inviting a public audience.

The email link opens on the device where it is clicked. To move progress from an existing browser, sign in there first, then sign in with the same email on another device.

## Enable the one-time full mock unlock

Free values practice, study all questions, topic practice and review are unchanged. Full Mock Test requires one A$4.99 purchase per signed-in account; it is not a subscription. Stripe Checkout collects payment, and a verified Stripe webhook grants access in `public.mock_access`. The browser can only read its own access row; it cannot grant access. The question bank is available in the free study modes, so the paid feature is the mock test workflow and scoring, not exclusive question content.

**Do not release the paywall until checkout, webhook and sign-in have been tested end to end.** This project currently needs a Stripe account and a hosting plan that permits commercial use; Vercel Hobby is non-commercial. Set the Supabase Auth Site URL to `https://www.commonbondprep.top` and allow that URL as an auth redirect, keeping the previous Vercel origin as an allowed redirect for existing users.

1. The `mock_access` migration has already been applied to the existing Common Bond Supabase project (`wvuoruaalafnmnyhioqn`). Keep `supabase/migrations/20260925000000_mock_access.sql` in version control. The table has RLS and no client write policy.
2. Create a Stripe account. Use **test mode** first. In Supabase Edge Functions → Secrets, set `STRIPE_SECRET_KEY` to the matching Stripe secret key, `SITE_URL` to `https://www.commonbondprep.top` (no trailing slash), and `STRIPE_WEBHOOK_SECRET` to the signing secret for the matching Stripe webhook endpoint. Never put these in `VITE_` variables, source control, or chat. Supabase's built-in service role key stays server-side in Edge Functions.
3. The `create-mock-checkout` and `stripe-mock-webhook` functions have already been deployed to this project. Redeploy from `supabase/functions` whenever their code changes. Both have `verify_jwt = false` in `supabase/config.toml`: the checkout handler validates the user's bearer token with Supabase Auth, while the webhook verifies Stripe's signature on the raw body.
4. Configure a Stripe webhook endpoint at `https://wvuoruaalafnmnyhioqn.supabase.co/functions/v1/stripe-mock-webhook`, with events `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `charge.refunded`. Copy **this endpoint's** signing secret into Supabase Secrets. Test-mode and live-mode endpoints have different secrets. Checkout sets the A$4.99 amount server-side; no Stripe Price ID is needed.
5. With test keys, sign in on the canonical site, complete a Stripe test-card checkout, confirm the account gains mock access, sign in with a second account to confirm it cannot see the first account's purchase, and test a full refund to confirm access is revoked. Switch both Stripe secrets and the endpoint to live mode before taking real money.

If the Stripe configuration is not finished, keep this branch out of production. Users cannot unlock the mock until the webhook succeeds. Paid plans should also provide a visible privacy notice and a way to contact the seller for help and refunds.

## Run locally

Install dependencies:

npm install

Start development server:

npm run dev

Build production version:

npm run build

Run question-bank and scoring checks:

npm test

Preview production build:

npm run preview

## Question bank

The question bank is located at:

src/data/questions.js

Each question follows this structure:

{
  id: 1,
  part: 1,
  category: "Australia and its people",
  q: "Question",
  options: [
    "Answer A",
    "Answer B",
    "Answer C",
    "Answer D"
  ],
  answer: 0,
  explain: "Explanation"
}

The answer property is zero-based:

0 = A
1 = B
2 = C
3 = D

## Important

Common Bond is an independent preparation tool.

It is not an official Australian Government application.

Always check the current Department of Home Affairs material before taking the citizenship test.

Official preparation material:

https://immi.homeaffairs.gov.au/citizenship/test-and-interview/our-common-bond

Official citizenship test information:

https://immi.homeaffairs.gov.au/citizenship-subsite/Pages/Test-and-interview/citizenship-test.aspx
