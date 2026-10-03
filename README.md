# 🎟️ Eventora — Event Booking & Management Platform

Eventora is a full-stack event booking platform where users can discover, search, and book events with secure OTP-based email verification, while admins manage event listings and confirm bookings from a dedicated dashboard.

**🔗 Live Site:** [eventora.space](https://eventora.space)
**💻 Repository:** [github.com/ayushpatokar/Event-Booking](https://github.com/ayushpatokar/Event-Booking)

---

## ✨ Features

- **Authentication & Security**
  - JWT-based authentication with role-based access control (User / Admin)
  - Passwords hashed with bcrypt
  - OTP email verification for account signup, with MongoDB TTL indexes to auto-expire OTPs after 5 minutes

- **Event Discovery**
  - Browse and search events by title, with debounced live search
  - Filter by category and ticket price
  - Real-time seat availability tracking

- **Booking Flow**
  - OTP-verified booking confirmation for every event registration
  - Booking status lifecycle: `pending` → `confirmed` / `cancelled`
  - Users can cancel their own pending bookings

- **Admin Dashboard**
  - Create, view, and delete events
  - Approve or reject booking requests
  - Manually confirm payment status (paid / non-paid) for offline payment tracking
  - Revenue and booking analytics at a glance

- **User Dashboard**
  - View all personal bookings with status and payment info
  - Cancel pending requests
  - Quick stats: total, confirmed, and pending bookings

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express.js, JWT, bcryptjs |
| Database | MongoDB, Mongoose (MongoDB Atlas) |
| Email | Resend (transactional email API) |
| Deployment | Vercel (frontend), Render (backend), custom domain via Hostinger |

---

## 📁 Project Structure

```
Event-Booking/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/        # AuthContext (JWT + user session)
│   │   ├── pages/          # Home, Login, Register, EventDetail, Dashboards
│   │   └── utils/          # axios instance
│   └── public/
├── server/                 # Express backend
│   ├── controllers/        # auth, event, booking logic
│   ├── models/             # User, Event, Booking, OTP (with TTL index)
│   ├── middleware/         # JWT auth middleware
│   ├── routes/
│   └── utils/              # email.js (Resend integration)
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas connection string
- A [Resend](https://resend.com) API key (free tier available)

### 1. Clone the repository
```bash
git clone https://github.com/ayushpatokar/Event-Booking.git
cd Event-Booking
```

### 2. Install dependencies
```bash
npm install          # root (installs concurrently)
cd client && npm install
cd ../server && npm install
```

### 3. Set up environment variables

Create a `.env` file inside `server/`:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
```

Create a `.env` file inside `client/`:
```
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the app
From the project root:
```bash
npm run dev
```
This starts both the client (`localhost:5173`) and server (`localhost:5000`) concurrently.

---

## 🧩 Challenges & What I Learned

The trickiest part of this project wasn't the CRUD logic — it was getting **transactional email delivery** to work reliably across environments:

- **Silent failures:** the original email-sending code caught and swallowed its own errors, so failed OTP sends looked identical to successful ones from the frontend's perspective. Fixed by letting errors propagate properly so users get real feedback.
- **IPv6 routing issues:** Node's default DNS resolution attempted an unreachable IPv6 address when connecting to Gmail's SMTP servers, causing multi-minute hangs instead of clean failures. Diagnosed using timeouts, explicit SMTP host/port configuration, and DNS resolution order overrides.
- **Environment-specific network restrictions:** the same SMTP approach that worked locally failed consistently on the deployed backend (Render), pointing to outbound SMTP port restrictions common on many cloud hosts' free tiers.
- **The fix:** migrated from direct SMTP (Nodemailer + Gmail) to a REST-based transactional email API ([Resend](https://resend.com)) over HTTPS, and verified a custom domain (`eventora.space`) to enable reliable delivery to any recipient, not just a sandboxed test address.

This turned into a genuinely useful lesson in network-layer debugging — tracing an issue from application code down to DNS resolution and infrastructure-level restrictions, rather than assuming the bug was always in the code.

---

## 🔮 Future Improvements

- Integrate a real payment gateway (e.g. Razorpay) to automate payment confirmation instead of manual admin approval
- Add pagination and advanced filtering for large event lists
- Email notification preferences and reminders before an event

---

## 👤 Author

**Ayush Patokar**
[LinkedIn](https://linkedin.com/in/ayush-patokar-4257713a2) · [GitHub](https://github.com/ayushpatokar)
