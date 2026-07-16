# Eye Clinic London — Referral Portal

A standalone visual preview of the Eye Clinic London referring-partner portal (patient referral wizard, partner dashboard, insights, and a Business Development admin console). Built with React, Vite, Tailwind CSS, lucide-react, and Recharts.

This is a front-end prototype — there is no backend, and nothing is persisted between sessions.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

`npm run build` outputs a production-ready static site to `dist/`.

## Deploying

The app is a static Vite build, so it deploys to any static host:

- **Vercel**: import the repo, framework preset "Vite" is auto-detected. Build command `npm run build`, output directory `dist`.
- **Netlify**: build command `npm run build`, publish directory `dist`.
- **GitHub Pages / any static host**: run `npm run build` and upload the contents of `dist/`.

## Sign-in shortcuts (preview only)

- **Referring partner**: "Referring partner" → "Bypass sign-in (preview)".
- **Clinic team (admin console)**: "Clinic team" → team code `ecl1234`.
