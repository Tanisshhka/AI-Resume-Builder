<div align="center">

# ResumeAI Pro

### Smart AI Resume Builder

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Build world-class, ATS-optimized resumes with AI-powered scoring, keyword matching, and 20+ premium templates.**

[Live Demo](#-live-demo) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Deployment](#-deployment)

---

![ResumeAI Pro](https://via.placeholder.com/1200x600/6C63FF/ffffff?text=ResumeAI+Pro)

</div>

---

## Live Demo

| Frontend | Backend API |
|----------|-------------|
| [https://resume-ai-pro.vercel.app](https://resume-ai-pro.vercel.app) | [https://resume-ai-pro-api.onrender.com](https://resume-ai-pro-api.onrender.com) |

---

## Features

### AI-Powered Tools
- **Resume Score Analyzer** — Grades your resume 0-100 with actionable suggestions
- **ATS Keyword Matcher** — Paste any job description to detect missing keywords
- **Auto-Generate from Profiles** — AI builds your resume from LinkedIn & GitHub URLs
- **Cover Letter Generator** — Tailored letters for any company and role
- **Interview Prep** — Technical + behavioral questions based on your resume
- **LinkedIn Headline Generator** — 5 high-impact headline options
- **Skill Recommendations** — AI suggests trending skills for your target role
- **Content Improver** — Grammar check and STAR-format rewriting

### Resume Builder
- **20+ Premium Templates** — ATS Modern, Executive, Creative, Harvard, Tech Pro, Minimal, and more
- **Live Preview** — Real-time side-by-side editor with zoom controls
- **Multi-Step Wizard** — Personal Info → Education → Skills → Experience → Projects → Certifications → Achievements → AI Optimize
- **Auto-Save** — Changes saved automatically every 1.5 seconds
- **PDF Export** — Clean A4 PDF download via browser print engine
- **Version History** — Restore previous versions (up to 15 snapshots)
- **Public Sharing** — Shareable portfolio link with QR code

### Dashboard & Tracking
- **Analytics Dashboard** — Resume count, average score, application stats
- **Job Application Tracker** — Kanban board: Bookmarked → Applied → Interviewing → Offered → Rejected
- **Activity Timeline** — Recent resumes and job updates
- **AI Quick Actions** — One-click access to score analysis and ATS checks

### Authentication
- **Email/Password** — JWT-based with 30-day expiry
- **Social Login** — Google, GitHub, LinkedIn (simulated)

### Design
- **Glassmorphism UI** — Premium glass-card effects with backdrop blur
- **Dark/Light Mode** — System preference detection with toggle
- **Framer Motion Animations** — Page transitions, scroll reveals, micro-interactions
- **Floating Particles** — Animated background particles
- **Mouse-Following Glow** — Interactive cursor light effect
- **Responsive** — Mobile-first design, works on all screen sizes

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript 6 | Type safety |
| Tailwind CSS 4 | Styling |
| Framer Motion | Animations |
| Redux Toolkit | State management |
| React Hook Form | Form handling |
| Lucide React | Icons |
| html2canvas + jsPDF | PDF generation |
| canvas-confetti | Success animations |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 22 | Runtime |
| Express 4 | API framework |
| MongoDB + Mongoose | Database |
| Google Gemini AI | AI features |
| JWT | Authentication |
| bcryptjs | Password hashing |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **MongoDB** running locally or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Google Gemini API Key** (optional — mock data fallback available) from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/THSTANU13/ResumeAI-Pro.git
cd ResumeAI-Pro
```

### Backend Setup

```bash
cd server
npm install
```

Create `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/resume_ai_pro
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the server:

```bash
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

The app is now running at **http://localhost:5173**

---

## Project Structure

```
ResumeAI-Pro/
├── client/                     # Frontend (React + Vite)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── GlassNavbar.tsx
│   │   ├── features/
│   │   │   ├── authSlice.ts
│   │   │   ├── resumeSlice.ts
│   │   │   └── uiSlice.ts
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Editor.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── SharePage.tsx
│   │   ├── store/
│   │   │   └── index.ts
│   │   ├── templates/
│   │   │   └── ResumeRenderer.tsx
│   │   ├── utils/
│   │   │   ├── api.ts
│   │   │   ├── confetti.ts
│   │   │   └── pdfEngine.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.production
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vercel.json
│   └── vite.config.ts
│
├── server/                     # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   └── resumeController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Job.js
│   │   ├── Resume.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   └── resumeRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes` | Create new resume |
| GET | `/api/resumes` | Get all user resumes |
| GET | `/api/resumes/:id` | Get resume by ID |
| PUT | `/api/resumes/:id` | Update resume (auto-save) |
| DELETE | `/api/resumes/:id` | Delete resume |
| POST | `/api/resumes/:id/share` | Toggle public sharing |
| GET | `/api/resumes/share/:slug` | Get public resume |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze-score` | Score resume 0-100 |
| POST | `/api/ai/ats-check` | Match resume vs job description |
| POST | `/api/ai/generate-from-profiles` | Auto-generate from LinkedIn/GitHub |
| POST | `/api/ai/summary` | Generate professional summary |
| POST | `/api/ai/objective` | Generate career objective |
| POST | `/api/ai/recommend-skills` | Suggest missing skills |
| POST | `/api/ai/improve-content` | Improve text with AI |
| POST | `/api/ai/linkedin-headlines` | Generate LinkedIn headlines |
| POST | `/api/ai/cover-letter` | Generate cover letter |
| POST | `/api/ai/interview-prep` | Generate interview questions |

### Job Tracker
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs` | Track a new job |
| GET | `/api/jobs` | Get all tracked jobs |
| PUT | `/api/jobs/:id` | Update job status |
| DELETE | `/api/jobs/:id` | Remove job |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/metrics` | System-wide statistics |
| GET | `/api/admin/users` | List all users |
| DELETE | `/api/admin/users/:id` | Delete user |

---

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Set **Root Directory** to `client`
5. Framework: **Vite** (auto-detected)
6. Add environment variable:
   ```
   VITE_API_URL = https://your-backend-url.onrender.com/api
   ```
7. Deploy

### Backend (Render)

1. Go to [dashboard.render.com/new](https://dashboard.render.com/new)
2. Select **New Web Service** → Connect GitHub repo
3. Set **Root Directory** to `server`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add environment variables:
   ```
   MONGODB_URI = mongodb+srv://...
   JWT_SECRET = your_secret_key
   GEMINI_API_KEY = your_key (optional)
   ```
7. Deploy

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `GEMINI_API_KEY` | No | Google Gemini API key (mock data if missing) |
| `VITE_API_URL` | Yes | Backend API URL for frontend |

---

## License

This project is licensed under the MIT License.

---

<div align="center">

**Built with React, Node.js, MongoDB, and Google Gemini AI**

[![Star on GitHub](https://img.shields.io/github/stars/THSTANU13/ResumeAI-Pro?style=social)](https://github.com/THSTANU13/ResumeAI-Pro)

</div>
