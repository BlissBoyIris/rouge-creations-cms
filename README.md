# Rouge Creations — CMS

The [Strapi](https://strapi.io) backend for the [Rouge Creations](https://github.com/BlissBoyIris/rouge-creations-website) website — a UAE-based event production company (weddings, corporate events, concerts, conferences, exhibitions). This API powers every dynamic section of the site: hero video, media carousel, testimonials, clients, event metrics, gallery, blog, and the event inquiry form.

The frontend lives in a separate repo: **[rouge-creations-website](https://github.com/BlissBoyIris/rouge-creations-website)**.

---

## Stack

- **[Strapi 5](https://strapi.io)** (TypeScript)
- **SQLite** locally, **PostgreSQL** in production (provisioned automatically by [Strapi Cloud](https://strapi.io/cloud))
- **[Resend](https://resend.com)** for transactional email (new event inquiry notifications)

## Content model

| Content type | Type | Purpose |
|---|---|---|
| **Hero** | Single | Homepage hero — headline, YouTube video URL, fallback poster image, CTA button |
| **Carousel Item** | Collection | Homepage media carousel — mix of YouTube videos and Strapi-hosted images, ordered |
| **Testimonial** | Collection | Client quotes with name, role, avatar, rating |
| **Social Link** | Collection | Social platform name + URL, shown in the footer and a homepage strip |
| **Client** | Collection | "Our Clients" logos |
| **Event Inquiry** | Collection | Leads submitted via the website's contact form. Public can `create`, nothing else — not publicly readable |
| **Site Stats** | Single | Manually-entered event counters (Weddings, Corporate, Concerts, Conferences, Exhibitions) |
| **Gallery Item** | Collection | Portfolio pieces, tagged by event category, filterable on the site |
| **Blog Post** | Collection | Blog articles (rich text via Strapi's block editor), draft/publish enabled |
| **Documents** (`resource`) | Collection | Uploaded PDFs (brochures, portfolios, rate cards) — see below |
| **Global Settings** | Single | Site name, contact email/phone, address, logo |

Plus one reusable component: **CTA Button** (`shared.cta-button` — label + URL), attached to Hero and available anywhere a call-to-action is needed.

### Using the "Documents" (PDF) section

Under **Content Manager → Documents**, upload a PDF, give it a title/category, and save. Open the entry, click the file, and copy its URL (or fetch it programmatically via `/api/resources`). Paste that URL into any CTA Button's `url` field, or use it directly as a link on the frontend. This keeps PDFs out of the general media library and in one organized, purpose-built place.

---

## Local development

**Prerequisites:** Node 18, 20, or 22 LTS recommended (Strapi 5 officially supports these; this project's `package.json` allows up to Node 26). If you hit odd install issues on a very new Node version, switch via `nvm use 20`.

```bash
git clone <this-repo-url>
cd rouge-creations-cms
npm install
cp .env.example .env
```

Fill in `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, and `ENCRYPTION_KEY` in `.env` with your own random values (any long random string works — these just need to be unique per environment, never shared or committed).

```bash
npm run develop
```

Visit `http://localhost:1337/admin` and create your first administrator account.

### What happens automatically on first boot

`src/index.ts` runs a bootstrap step that grants the **public** role:
- `find` / `findOne` on Hero, Carousel Item, Testimonial, Social Link, Client, Site Stats, Gallery Item, Blog Post, Documents, and Global Settings
- `create` only on Event Inquiry (so the website form works without exposing other people's submissions)

This is idempotent — it only inserts permissions that don't already exist, so it's safe to leave in place permanently and won't fight with changes you make by hand in the admin panel afterward.

---

## Environment variables

See `.env.example` for the full list. The ones specific to this project (beyond Strapi's standard secrets):

| Variable | Purpose |
|---|---|
| `FRONTEND_URLS` | Comma-separated list of allowed CORS origins (the Next.js site's URLs) |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com). **If left empty**, Strapi falls back to its bundled `sendmail` provider (fine for local dev; emails just won't actually send) |
| `EMAIL_FROM` | Verified sender address, e.g. `Rouge Creations <hello@rougecreations.ae>` |
| `EMAIL_REPLY_TO` | Reply-to address (defaults to `EMAIL_FROM`) |
| `NOTIFY_EMAIL` | Inbox that receives new Event Inquiry notifications (defaults to `EMAIL_FROM`) |

### How the inquiry email works

`src/api/event-inquiry/content-types/event-inquiry/lifecycles.ts` sends a notification email via `strapi.plugin('email').service('email').send(...)` after every new Event Inquiry is created. It's wrapped in a try/catch — a failed email never blocks the form submission itself, it just logs an error server-side.

---

## Deployment (Strapi Cloud)

1. Push this repo to GitHub.
2. Create a new project at [cloud.strapi.io](https://cloud.strapi.io) and connect this repo. Strapi Cloud provisions a managed **PostgreSQL** database automatically — no manual `DATABASE_*` configuration needed.
3. In the Strapi Cloud project settings, set the environment variables above (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `NOTIFY_EMAIL`, `FRONTEND_URLS` — set this to your production Vercel URL).
4. Deploy. Once live, generate an **API Token** (Settings → API Tokens, read-only is enough) if the frontend needs authenticated reads, and set it as `STRAPI_API_TOKEN` in the frontend's environment.

---

## Project structure

```
src/
  api/<name>/
    content-types/<name>/schema.json   # field definitions
    controllers/, routes/, services/   # Strapi core factories (no custom logic beyond lifecycles)
  api/event-inquiry/content-types/event-inquiry/lifecycles.ts   # sends the notification email
  components/shared/cta-button.json    # reusable CTA button component
  index.ts                             # permissions bootstrap
config/
  plugins.ts        # upload restrictions + conditional Resend email config
  middlewares.ts     # CORS allow-list
```

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`: install, typecheck, and build the admin panel — using placeholder secrets, so it doesn't need real credentials to verify the build is healthy.
