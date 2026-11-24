# Project memory

## Product intent & audience

- Dental clinic management web app.
- Two user sides: patients (public-facing) and clinic staff (management).
- Patient features: registration, appointment booking.
- Staff features: queue management.
- Uses a database for persistence.

## Brand personality & voice

- Professional healthcare tone; clarity and trust matter.

## Visual design & UX direction

- Vite + React + Tailwind CSS stack.
- Icons from lucide-react (per global instructions).
- `@/` path alias for `src/` imports.

## Decisions, constraints & rationale

- Deployment via Bolt Publish (free `bolt.host` URL).
- Re-publishing required after changes; updates are not automatic.
- Private publish available for restricted access (e.g., clinic staff only).
- Custom domain supported on paid plans.
- No extra UI/icon packages beyond what the template provides.

## Open questions & assumptions

- Clinic name/branding not yet confirmed (assistant used "tydental.com" as a generic example).
- Production domain and public-vs-private publish preference undecided.
- Database backend details not explicitly stated.