# TinyLink – URL Shortener (Node.js + Express + Postgres)

TinyLink is a lightweight Bitly-style URL shortener where users can:

- Create short links
- Add custom short codes
- View click statistics
- Delete links
- Redirect using `/:code`
- View full stats at `/code/:code`
- View dashboard at `/`

This project follows the exact specifications of the assignment.

---

## 🚀 Tech Stack

- **Node.js + Express**
- **PostgreSQL (Neon.tech)**
- **Vanilla JS frontend**
- **HTML/CSS UI**
- **Deployed on Render / Railway / Vercel**

---

## 📌 Features Implemented

### ✔ Create Short Links
POST `/api/links`

### ✔ Redirect
GET `/:code`

### ✔ Stats Page
GET `/code/:code`

### ✔ Health Check
GET `/healthz`

### ✔ API Endpoints
- GET `/api/links`
- POST `/api/links`
- GET `/api/links/:code`
- DELETE `/api/links/:code`

---

## ⚙ Environment Variables

Create `.env`:

