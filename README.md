# Callahan Marketing Group — Website

A full-stack build of the approved Callahan Marketing Group prototype (`Callahan Website.dc.html`).

| Layer    | Tech                                   | Folder       |
| -------- | -------------------------------------- | ------------ |
| Frontend | Next.js 15 (App Router, React 19, TS)  | `frontend/`  |
| Backend  | NestJS 11 + TypeORM                    | `backend/`   |
| Database | SQLite3 (better-sqlite3 driver)        | `database/app.sqlite` |

The UI, copy, colours, typography, layouts and interactions follow the prototype. Everything the prototype faked in the browser (localStorage "server", hard-coded content, client-side passcode) now runs on the API and the database.

---

## Quick start

Requires **Node.js 20+**.

```bash
npm install          # installs root, backend and frontend dependencies
npm run setup        # creates .env files (random APP_SECRET) and seeds the database
npm run dev          # API on :4000, website on :3000
```

Open http://localhost:3000. The admin is at http://localhost:3000/admin (default passcode `callahan`; change `ADMIN_PASSCODE` in `backend/.env`).

Production:

```bash
npm run build
npm start
```

Other scripts: `npm run seed` (adds missing seed data, never overwrites edits), `npm run db:reset` (wipes and re-seeds), `npm run typecheck`.

---

## Pages and features

| Route | What it does |
| ----- | ------------ |
| `/` | Hero, service list, selected work (first 4 visible case studies), process, CTA, direct contact |
| `/services` (`?s=slug` scrolls to a service) | Five service sections. Copy comes from the database; the five layouts from the prototype rotate if more services are added |
| `/work` (`?cat=slug`) | Case studies with service filters and counts, plus loading, empty, "no match" (with reset) and error/retry states |
| `/work/[slug]` | Case study detail, next-project link, "Discuss a similar project" (pre-selects the service) |
| `/about` | About copy; point of contact comes from settings |
| `/insights` (`?cat=`) | Articles with category filters, a featured first card, loading, empty and error states |
| `/insights/[slug]` | Article body (headings, paragraphs, lists) plus related articles |
| `/contact` (`?service=`, `?intent=call`) | Project brief form (see below) and contact details; shows the booking button when a booking link is set |
| any unknown URL, or unpublished content | 404 page (real HTTP 404) |
| `/admin` | Leads, Content and Settings (signed-in only, `noindex`) |

Across the site: sticky header that changes on scroll, accessible mobile menu (focus trap, Escape to close, closes on navigation), skip link, back-to-top button, scroll-reveal animation (respects reduced motion), per-page titles, descriptions and canonical URLs, and a preview banner while in preview mode.

### Project brief (contact form)
- Instant client-side validation for quick feedback; **the server re-validates everything** with the same rules and messages.
- Error summary, inline field errors, focus moves to the first invalid field, live character count, conditional phone field.
- Anti-spam on the server: hidden honeypot field, a **signed form token** that rejects submissions sent within 3 seconds of opening the form, and a **rate limit of 5 enquiries per 10 minutes per IP address** (IPs are stored only as salted hashes).
- On success, a success card shows the reference (e.g. `CMG-MV6XCZG7`), a **View our work** link and **Send another brief**.
- Server problems (outage, rate limit, expired form) show a clear error banner. You can turn on "simulate a server error" in Settings to test this.

### Admin
- **Sign-in:** the passcode is checked on the server and creates an 8-hour **httpOnly signed session cookie**. Five wrong attempts lock sign-in for 5 minutes. If the session expires, the admin returns you to sign-in with a message.
- **Leads:** status counters that double as filters, search by name/company/email, status filter, server-side pagination (8 per page), and a detail view with all fields. You can change the status (every change is recorded in the history), add internal notes, delete a lead (with confirmation), and export a CSV of the current filter.
- **Content:** a list of case studies and articles with search and type/status filters. Change a status inline (Draft / Published / Archived), create or edit a case study or article in full editors (server-side validation, unique URL slugs, a guard against discarding unsaved changes, and a success card with **View on site**), and delete with confirmation.
- **Settings:** content mode (preview/production), strategy-call booking link (must be https), contact details used across the site, and the testing toggle.

### Publishing rules (enforced by the API)
- **Published** items are always public.
- **Draft** items are public only in **preview** mode, and are labelled ("Concept · not client work", "Sample · not published").
- **Archived** items are hidden everywhere.
- Switching to **production** removes the preview banner and the "pending approval" notes.

---

## Project structure

```
callahan-marketing-group/
├── backend/                     NestJS API (prefix /api)
│   └── src/
│       ├── main.ts              bootstrap: cookies, validation, error filter, CORS
│       ├── app.module.ts
│       ├── config/              env → typed config
│       ├── common/              domain constants, validation pipe, error filter, utils
│       ├── database/            TypeORM data source, entities list, seed data + seeder
│       └── modules/
│           ├── auth/            passcode login, session cookie, AdminGuard
│           ├── settings/        site settings (public + admin)
│           ├── service-catalog/ services
│           ├── work/            case studies (public + admin CRUD)
│           ├── articles/        insights (public + admin CRUD)
│           ├── leads/           enquiries: validation, form token, rate limit, admin pipeline, CSV
│           ├── admin/           combined content listing
│           └── health/
├── frontend/                    Next.js app
│   ├── app/
│   │   ├── (site)/              public pages (layout loads settings + services on the server)
│   │   ├── admin/               admin app
│   │   └── not-found.tsx
│   ├── components/              layout, ui, work, services, insights, contact, admin
│   ├── lib/                     API clients, types, validation mirror, formatting
│   └── styles/                  design tokens + component CSS translated from the prototype
├── database/app.sqlite          SQLite3 database (seeded)
├── scripts/setup-env.js
└── package.json                 runs both apps together
```

The browser calls `/api/*` on the website's own address; Next.js forwards those requests to NestJS (`next.config.ts` rewrites). This keeps the admin cookie first-party and avoids CORS. Server-rendered pages call the API directly using `BACKEND_URL`.

## API reference (all under `/api`)

**Public**

| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/site` | content mode, booking link, contact details |
| GET | `/services` | service catalogue |
| GET | `/work?cat=&limit=` | visible case studies plus filters with counts |
| GET | `/work/:slug` | detail plus next project (404 if not visible) |
| GET | `/articles?cat=` | visible articles plus categories |
| GET | `/articles/:slug` | detail plus related articles |
| GET | `/leads/options` | form options |
| GET | `/leads/form-token` | signed form-timing token |
| POST | `/leads` | submit an enquiry → `201 {id}`; `422 {errors}`, `400`, `429`, `503` |
| GET | `/health` | health check |

**Auth**

| Method | Path |
| ------ | ---- |
| POST | `/auth/login` |
| POST | `/auth/logout` |
| GET | `/auth/me` |

**Admin** (session cookie required)

| Method | Path |
| ------ | ---- |
| GET | `/admin/leads?q=&status=&page=&pageSize=` |
| GET | `/admin/leads/export` |
| GET, DELETE | `/admin/leads/:id` |
| PATCH | `/admin/leads/:id/status` |
| PATCH | `/admin/leads/:id/notes` |
| GET | `/admin/content?type=&status=&q=` |
| GET, POST | `/admin/work` |
| GET, PUT, DELETE | `/admin/work/:id` |
| PATCH | `/admin/work/:id/status` |
| GET, POST | `/admin/articles` |
| GET, PUT, DELETE | `/admin/articles/:id` |
| PATCH | `/admin/articles/:id/status` |
| GET, PUT | `/admin/settings` |

Errors always look like this: `{ "statusCode": 422, "message": "…", "errors": { "field": "message" } }`.

## Database

Tables: `services`, `case_studies`, `articles`, `leads`, `lead_history`, `settings`. The schema comes from the TypeORM entities (`DB_SYNCHRONIZE=true`). If you later add migrations, set it to `false`. The database runs in WAL mode with foreign keys on.

Seed content matches the prototype: 5 services, 6 concept studies and 3 sample articles (all **draft**), and default settings (preview mode, no booking link).

## Before going live

- Set a strong `ADMIN_PASSCODE` and a random `APP_SECRET` in `backend/.env`. `npm run setup` generates the secret for you.
- Run with `NODE_ENV=production` so cookies are marked `Secure` (requires HTTPS).
- Set `NEXT_PUBLIC_SITE_URL` to the real domain for canonical links.
- In Admin → Settings, switch content mode to **production** and add the booking link, if you have one.
- Replace the hatched placeholder visuals with approved imagery.
