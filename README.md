# Cortes Marketplace Frontend

## Project structure

```plaintext
components/
config/
hooks/
lib/
types/
utils/
```

## Getting Started

Install dependencies:

```bash
npm install
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Email Lifecycle Hardening

This repo now keeps email delivery on the server side and exposes two internal endpoints:

`POST /api/internal/email/send`

- Requires `Authorization: Bearer ${INTERNAL_EMAIL_API_SECRET}` or `x-internal-email-secret`.
- Intended for trusted server-to-server use only.

`POST /api/internal/email-lifecycle/run`

- Requires `Authorization: Bearer ${EMAIL_CRON_SECRET}` or `x-cron-secret`.
- Intended for an external cron provider to invoke on a schedule.

Suggested external cron:

```bash
curl -X POST https://your-app.example.com/api/internal/email-lifecycle/run \
  -H "Authorization: Bearer $EMAIL_CRON_SECRET"
```

Backend persistence contract required by lifecycle anti-spam:

- Add `email_welcome_sent_at`
- Add `email_activation_sent_at`
- Add `email_week1_sent_at`

These fields belong on `vendedor_perfil` in the backend API/database so lifecycle checks stay consistent across deploys and instances.

## Dependencies

https://ui.shadcn.com/
https://tailwindcss.com/
https://dndkit.com/
next-intl
zod
zustand
useState
