<div align="center">

# 🏥 Hospital Queue Management System

### A smart, real-time queue and appointment platform for dental clinics

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Postgres](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

---

## 📸 Screenshots

> Add your images to a `docs/screenshots/` folder in the repo using the file names below.

<p align="center">
  <img src="docs/screenshots/home.png" alt="Home Page" width="48%" />
  <img src="docs/screenshots/login.png" alt="Register / Login" width="48%" />
</p>
<p align="center">
  <img src="docs/screenshots/patient-dashboard.png" alt="Patient Dashboard" width="48%" />
  <img src="docs/screenshots/book-appointment.png" alt="Book Appointment" width="48%" />
</p>
<p align="center">
  <img src="docs/screenshots/queue-status.png" alt="Queue Status" width="48%" />
  <img src="docs/screenshots/staff-dashboard.png" alt="Staff Dashboard" width="48%" />
</p>

---

## 📖 What It Is

The **Hospital Queue Management System** is a dental clinic web application with two sides:

- **Patient side:** register, sign in, book appointments, and track queue tokens and estimated wait times.
- **Staff side:** manage the live queue, call the next patient, and update appointment statuses.

It replaces crowded waiting rooms and paper registers with a digital token system that keeps everyone informed.

---

## 🖥️ Screens

| Screen | Description |
|---|---|
| **Home** | Hero section, stats, features, doctor profile, contact/footer with developer credits |
| **Register / Login** | Split-screen layout with a brand panel; email + password accounts |
| **Patient Dashboard** | Stats, active appointment card with queue position, quick actions, appointment history |
| **Book Appointment** | Date picker, reason selection, generates a token (e.g. `TN-001`) with estimated wait |
| **Queue Status** | Live queue list, your position, patients ahead, wait time; auto-refreshes every 15 seconds |
| **Staff Dashboard** | "Now Serving" panel, call-next-patient, status filters, appointment management |

---

## ✨ Characteristics

- 🎟️ **Token-based queue** with unique tokens like `TN-001`
- ⏱️ **Live wait-time estimation** based on queue position
- 🔄 **Auto-refresh** queue status every 15 seconds
- 🔐 **Secure authentication** with email and password
- 🛡️ **Row-level security** so patients only see their own data
- 👥 **Role-based experience** with separate patient and staff dashboards
- 📱 **Fully responsive** design for mobile, tablet, and desktop
- 🪟 **Glassmorphism UI** with translucent blurred cards over a clinic background
- 🧩 **Type-safe codebase** written end-to-end in TypeScript

---

## ✅ Advantages

- **No more crowded waiting rooms:** patients can wait at home and arrive when their turn is near.
- **Transparency:** patients see their exact position, patients ahead, and estimated wait.
- **Less manual work:** no paper registers or repeated "how long is my turn?" questions at reception.
- **Faster, organised service:** staff call the next patient with a single click.
- **Fewer errors:** appointment records and statuses are centralised and always up to date.
- **Secure by design:** access rules at the database level protect patient data.
- **Easy to use:** a clean, simple interface for both patients and staff.
- **Scalable:** built on a hosted Postgres database that grows with the clinic.

---

## 💰 Profit & Benefits for the Clinic

- 📈 **More patients served per day** through smoother flow and less idle time.
- 😊 **Higher patient satisfaction and retention**, since people value predictable waiting times.
- 💼 **Lower staffing overhead**, because reception spends less time on queue enquiries and bookings.
- 📉 **Fewer no-shows and walk-out losses** thanks to visible tokens and wait estimates.
- 🏆 **Professional brand image** that sets the clinic apart from competitors.
- 🗂️ **Digital records** that support better planning and reporting.

---

## 🛠️ Languages & Technologies

| Technology | Role |
|---|---|
| **TypeScript** | Main programming language (all app logic, typed throughout) |
| **React** | UI framework: pages, components, auth context |
| **JSX / TSX** | Markup within React components |
| **CSS (Tailwind CSS)** | All styling: glassmorphism cards, responsive design, custom theme |
| **SQL** | Database migrations (tables, row-level security policies) |

### Supporting Stack

- **Vite** – build tool and dev server
- **Bolt Database** – hosted Postgres database with email/password authentication and security rules
- **PostgreSQL** – underlying database engine
- **Lucide React** – icon library

---

## 📁 Project Structure

```
├── src/
│   ├── pages/        # The seven screens
│   ├── components/   # Shared header, route guard, status badges
│   ├── context/      # Sign-in (auth) state shared across the app
│   └── lib/          # Database connection, constants, queue calculations
├── supabase/
│   └── migrations/   # Database setup scripts with access-control rules
└── docs/
    └── screenshots/  # README images
```

---

## 🎨 Visual Design

Healthcare-themed **glassmorphism**: a full-screen clinic workspace photo sits behind every page, with translucent blurred cards on top. The palette is professional blue, with dark high-contrast text on light surfaces and dark panels for the About and contact sections.

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

# 2. Install dependencies
npm install

# 3. Add your environment variables (.env)
VITE_SUPABASE_URL=your_database_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# 4. Run the migrations from supabase/migrations/ on your database

# 5. Start the dev server
npm run dev
```

---

## 🔮 Future Improvements

- SMS / WhatsApp notifications when a patient's turn is near
- Multi-doctor and multi-clinic support
- Analytics dashboard for staff
- Multi-language support

---

## 👨‍💻 Developer

Developed by **<Your Name>**

- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [your-profile](https://linkedin.com/in/your-profile)

---

<div align="center">

⭐ If you found this project useful, please give it a star!

</div>
