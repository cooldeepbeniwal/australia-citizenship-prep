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
- No backend required

## Technology

- React
- Vite
- vite-plugin-pwa
- JavaScript
- CSS
- localStorage

## Run locally

Install dependencies:

npm install

Start development server:

npm run dev

Build production version:

npm run build

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
