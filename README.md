# M.S Makeovers — Studio website and private demo manager

A responsive Next.js App Router website for Madhuri Sharma’s bridal and beauty studio in Anwalkhera, Agra. The separate `/admin` route is an interactive **demo**, not a production customer database.

## Open the experience

- `/` — public studio website, eight service categories, bridal lookbook, keyboard-accessible lightbox, review reference, and contact details.
- `/admin` — overview, appointments, calendar, customers, services, bridal bookings, team, gallery, reviews, analytics, and business settings.
- `Book Appointment` → **WhatsApp enquiry** prepares a message for `+91 6397973047`. The user must send it and receive confirmation from the studio. No booking or personal contact information is written to the database in this mode.
- `Book Appointment` → **Try a demo** creates a pending, fictional appointment in the same browser’s private dashboard.

## Real identity and image provenance

The project initially contained **no uploaded logo, reference screenshots, salon photographs, or client portfolio files**. No other artist’s photographs are attributed to Madhuri. A vector peacock-feather MS monogram serves as a brand-inspired fallback, not a claim to reproduce the original logo. All fallback photography is identified as editorial inspiration; each lightbox includes its source credit.

The 5.0 rating and 111 reviews are **screenshot-derived reference information from the brief**, not live-verified reviews. No testimonials, studio prices, operating hours, or credentials have been invented. Prices start unset in the dashboard. All bookings and analytics are explicitly simulated.

### Add authentic studio media

Put original photographs in `public/studio/`, then update `src/content/studio-media.json`:

- `logo`, `artistPortrait`, `salonPhotograph`: either `null` or an object with local `src` and descriptive `alt` text.
- `portfolio`: entries with `id`, `title`, `category`, `src`, `credit`, `position` (such as `50% 40%`), `alt`, and `approved: true`. Add only actual studio work with permission. These replace the stock lookbook and hero photographs automatically.
- `comparisons`: entries with `id`, `title`, `before`, `after`, `credit`, and `approved: true`. Supply an authentic, matched pair. The public comparison slider appears only when an approved pair is present.

Keep the manifest empty when originals are unavailable. Demo dashboard uploads **never** publish to the public website.

### Editorial credits (Pexels)

| Local image            | Photographer       | Source                                 |
| ---------------------- | ------------------ | -------------------------------------- |
| `bridal-hero.webp`     | Gaurav Vishwakarma | https://www.pexels.com/photo/36102603/ |
| `classic-bridal.webp`  | Deepak Sharma      | https://www.pexels.com/photo/35963163/ |
| `crimson-veil.webp`    | Arto Suraj         | https://www.pexels.com/photo/29531104/ |
| `rose-bridal.webp`     | Rakshit Dutta      | https://www.pexels.com/photo/6197902/  |
| `makeup-artistry.webp` | Vladimir Flores    | https://www.pexels.com/photo/35983942/ |
| `bridal-details.webp`  | Satyam Vicky       | https://www.pexels.com/photo/38380703/ |

Cormorant Garamond and DM Sans are self-hosted. Their SIL Open Font Licenses accompany the font files. Service illustrations are custom SVGs. Interface icons use Lucide.

## Demo architecture and privacy

- PostgreSQL via the existing Drizzle client in `src/db/index.ts`; schema: `src/db/schema.ts`.
- `GET /api/demo` opens an isolated workspace with fictional example records. An opaque, random HttpOnly cookie identifies the session; only a hash of the token is stored in the database. HTTPS cookies are Secure and partitioned to support embedded previews.
- `PUT /api/demo` validates the complete workspace, checks origin and session, enforces data limits, checks references and conflicting staff slots, and uses optimistic versioning to prevent silent cross-tab overwrites.
- No public customer directory or cross-workspace queries. Customer records use aliases and optional fictional notes, not phone numbers or emails. Do not enter real customer data into the demo.
- Service edits affect future booking quotes. A booking’s saved amount is independent of later price changes. Revenue sums only completed bookings with saved amounts. Unpriced bookings contribute zero.
- Image uploads are validated, resized locally, and re-encoded without original file metadata. Comparisons require both files and an express permission checkbox. The demo has a bounded storage budget.
- Demo workspace reset requires explicit confirmation. A reset affects only that session. Clearing the session cookie starts a separate workspace.

## Development

Use the existing `DATABASE_URL` environment variable. Install project dependencies, bootstrap the local PostgreSQL database, and run `npx drizzle-kit push` to apply the schema. Then use the standard Next.js development command.

Validation: `npx next typegen`, `npm exec tsc -- --noEmit --pretty false`, and `npm run build`. `/api/health` checks the real database connection. The platform-managed production preview is started with `build_and_start`.

This intentionally public, isolated demo does not authenticate real studio personnel. A live administrative deployment handling real customers would need a separately designed authenticated workspace, access control, retention policy, and consent process.
