# Common Bond

## Australian Citizenship Test Trainer

Common Bond is an independent Australian citizenship test preparation PWA.

It is designed around the testable section of:

Australian Citizenship: Our Common Bond

## Features

- Full mock test
- Australian values practice
- Review missed questions
- Study all questions
- Study by topic
- Persistent progress statistics
- Mobile-first interface
- Installable PWA
- Offline support
- iPhone/iPad friendly
- No account required
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
