# Project memory

## Product intent & audience

- Dental clinic management web app.
- Two user sides: patients (public-facing) and clinic staff (management).
- Patient features: registration, appointment booking, patient dashboard.
- Staff features: queue management, staff dashboard/screen.
- Core screens: home, login, registration, patient dashboard, booking, queue, staff.
- Uses a database for persistence.

## Brand personality & voice

- Professional healthcare tone; clarity and trust matter.
- Visual identity leans into healthcare imagery (supplied healthcare dashboard image used as site background).

## Visual design & UX direction

- Vite + React + Tailwind CSS stack.
- Icons from lucide-react (per global instructions).
- `@/` path alias for `src/` imports.
- Shared/centralized card styling rather than per-screen styling; same root classes reused across loading and normal states.
- Glassmorphism cards: translucent background, backdrop blur, soft borders, shadows — lets background image show through while keeping text readable.
- Full-bleed background image layered behind all screens.
- Prior base theme: white panels over slate page surfaces (now replaced by glass + image).
- Avoid opaque solid card backgrounds that hide the background image.

## Decisions, constraints & rationale

- Deployment via Bolt Publish (free `bolt.host` URL).
- Re-publishing required after changes; updates are not automatic.
- Private publish available for restricted access (e.g., clinic staff only).
- Custom domain supported on paid plans.
- No extra UI/icon packages beyond what the template provides.
- Background image + glass-blur styling applied site-wide via shared classes for consistency and maintainability.

## Open questions & assumptions

- Clinic name/branding not yet confirmed (assistant used "tydental.com" as a generic example).
- Production domain and public-vs-private publish preference undecided.
- Database backend details not explicitly stated.
- Background image source/attribution not specified by user.