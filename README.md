# Flowjuyu Marketplace — Frontend

Frontend application for **Flowjuyu**, a marketplace connecting sellers and buyers through catalog, ordering, payment, analytics, communication, and AI-assisted workflows.

[Open the live application](https://flowjuyu-frontend.vercel.app)

## Product capabilities

- Buyer and seller experiences
- Product catalog, search, and discovery
- Orders, checkout, billing, and payment workflows
- Seller dashboards and operational analytics
- Authentication and account management
- WhatsApp-assisted communication
- AI-assisted content and seller tooling
- Credit-based AI usage workflows
- Responsive interfaces for desktop and mobile

## Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- Zod
- Zustand
- next-intl
- Vercel

## Architecture

This repository contains the customer- and seller-facing application. Business operations, persistence, billing, marketplace services, and AI integrations are provided by the separate [Flowjuyu backend](https://github.com/edkuart/flowjuyu-backend).

The split allows the frontend and API to evolve and deploy independently while keeping product domains clearly separated.

## Engineering priorities

- Typed interfaces and validation
- Reusable product and dashboard components
- Responsive user experience
- Secure server-side handling for internal operations
- Maintainable integration boundaries
- Production-oriented deployment

## Related repository

- [Flowjuyu Backend](https://github.com/edkuart/flowjuyu-backend)

## Author

Built by [Edwart Daniel Enriquez Manrique](https://github.com/edkuart), Full-Stack Software Developer based in Guatemala.
