# ⚡ RLaaS — Rate Limiter as a Service (Frontend)

React dashboard for **RLaaS** — a Rate Limiter as a Service platform. Companies register their application, verify their email, and get a UUID API key. The dashboard provides real-time analytics, per-route rule configuration, and traffic visualizations powered by the Django REST API.

> 🔧 **Backend Repository:** [rlass](https://github.com/vanshsoni916/RLaaS-Backend)  
> 🚀 **Live App:** [frontend](https://r-laa-s-front-end-red.vercel.app/)

---

## Pages

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Login + Register tabs, feature overview |
| Verify Email | `/verify-email` | Handles email verification token from link |
| Dashboard | `/dashboard` | Summary stats, activity chart, recent requests |
| Rules | `/rules` | Configure per-route rate limit rules |
| Analytics | `/analytics` | Deep traffic breakdown, charts, filterable log |

---

## Features

- **Login / Register flow** — tab-based UI, email verification enforced before access
- **Protected routes** — `ProtectedRoute` wrapper redirects unauthenticated users to landing
- **API key display** — always visible on dashboard with one-click copy
- **Rate limit rule builder** — visual algorithm picker (Token Bucket, Sliding Window, Fixed Window) with live plain-English preview before submitting
- **Real-time analytics** — pie chart (allowed vs blocked), stacked bar chart (by route), filterable request log
- **Webhook unverified flow** — clear "check your email" screen with resend option
- **Toast notifications** — success/error feedback on every action

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| HTTP client | Axios (with request interceptor for API key) |
| Charts | Recharts |
| Notifications | React Hot Toast |

---

## Project Structure

```
rlaas-frontend/
├── src/
│   ├── api/
│   │   ├── axios.js        # Axios instance + X-API-KEY interceptor
│   │   └── client.js       # All API call functions
│   ├── components/
│   │   └── Navbar.jsx      # Sticky nav with active link highlight + logout
│   ├── pages/
│   │   ├── Landing.jsx     # Login + Register with tab switcher
│   │   ├── VerifyEmail.jsx # 3 states: verifying, success, error
│   │   ├── Dashboard.jsx   # Stats cards, line chart, route breakdown
│   │   ├── Rules.jsx       # Rule list + add rule form with algorithm picker
│   │   └── Analytics.jsx   # Pie chart, bar chart, table, filterable log
│   ├── App.jsx             # Router + ProtectedRoute wrapper
│   └── index.css           # Tailwind import
├── .env.example
└── package.json
```

---

## Local Development

### Prerequisites

- Node.js 18+
- Backend running locally at `http://127.0.0.1:8000`

### Setup

```bash
# Clone the repo
git clone https://github.com/vanshsoni916/RLaaS-FrontEnd.git
cd rlaas-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# VITE_API_URL=http://127.0.0.1:8000/api

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Environment Variables

```bash
VITE_API_URL=http://127.0.0.1:8000/api
```

For production (Vercel):
```bash
VITE_API_URL=https://rlaas-backend-q5kr.onrender.com/api
```

---

## Authentication Flow

```
Register (name + email)
      ↓
Backend sends verification email
      ↓
"Check your email" screen shown
      ↓
User clicks link → /verify-email?token=xxx&email=xxx
      ↓
VerifyEmail page calls backend → account activated
      ↓
User logs in with email
      ↓
Backend returns api_key → saved to localStorage
      ↓
All subsequent API calls include X-API-KEY header (via Axios interceptor)
      ↓
Dashboard, Rules, Analytics pages unlock
```

---

## API Integration

All API calls go through `src/api/axios.js`:

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});

// Automatically attach API key to every request
api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('api_key');
  if (apiKey) config.headers['X-API-KEY'] = apiKey;
  return config;
});
```

---

## Deployment (Vercel)

1. Push this repo to GitHub
2. Go to vercel.com → New Project → import repo
3. Framework: **Vite** (auto-detected)
4. Add environment variable:
```
VITE_API_URL = https://rlaas-backend-q5kr.onrender.com/api
```
5. Click Deploy

Vercel auto-deploys on every push to `main`.

---

## Screenshots

| Landing | Dashboard | Rules | Analytics |
|---|---|---|---|
| Login/Register tabs | Stats + chart | Rule builder | Traffic breakdown |

---

## Author

**Vansh Soni** — B.Tech ECE, IET Lucknow  
Backend Developer | Django · React · Redis · Node.js · Express.js
