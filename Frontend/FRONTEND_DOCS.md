# Frontend Documentation: Architecture, Component Guide & Data Flow

Welcome to the comprehensive architecture and component documentation for the **Interview AI Pro** Frontend application.

---

## 1. High-Level Architecture Overview

The Frontend is built as a single-page application (SPA) using modern web technologies:

- **Framework**: React 19 + Vite 6
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios (with custom interceptors & URL normalization)
- **State Management**: React Context API (`AuthContext`, `InterviewContext`)
- **UI & Icons**: Vanilla CSS (CSS variables, glassmorphism, responsive grid) + `lucide-react`
- **Deployment Platform**: Vercel (configured via `vercel.json` for SPA rewrites)

### System Architecture Diagram

```
+-----------------------------------------------------------------------+
|                            USER BROWSER                               |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  |                       React Application (App)                   |  |
|  |  +------------------------+  +--------------------------------+ |  |
|  |  |      Auth Context      |  |       Interview Context        | |  |
|  |  +------------------------+  +--------------------------------+ |  |
|  |               |                              |                  |  |
|  |  +------------------------------------------------------------+ |  |
|  |  |                   Centralized API Client                   | |  |
|  |  |             (src/services/api.js + Interceptor)            | |  |
|  |  +------------------------------------------------------------+ |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------|-----------------------------------+
                                    | HTTPS / JSON (Bearer Token / Cookie)
                                    v
+-----------------------------------------------------------------------+
|                      BACKEND API (Render Cloud)                       |
+-----------------------------------------------------------------------+
```

---

## 2. Component & File Breakdown

### A. Core Entry & Routing Setup

#### 1. [main.jsx](file:///d:/interview-ai-pro/Frontend/src/main.jsx)
- **Role**: Application entry point.
- **Functionality**: Mounts the top-level `<App />` component into the DOM `root` element wrapped in `<React.StrictMode>`. Imports global CSS (`index.css`).

#### 2. [App.jsx](file:///d:/interview-ai-pro/Frontend/src/App.jsx)
- **Role**: Root application layout and route configuration.
- **Functionality**:
  - Wraps the application hierarchy in `<BrowserRouter>`, `<AuthProvider>`, and `<InterviewProvider>`.
  - Renders the global `<Navbar />`.
  - Defines public routes (`/login`, `/register`) and protected routes (`/dashboard`, `/plan/:id`).
  - Implements wildcard redirect (`* -> /dashboard`).

---

### B. Network & API Service Layer

#### 3. [api.js](file:///d:/interview-ai-pro/Frontend/src/services/api.js)
- **Role**: Centralized Axios HTTP client instance.
- **Functionality**:
  - Automatically reads `import.meta.env.VITE_API_URL` (falling back to `http://localhost:3000`).
  - Strips trailing slashes from the base URL to prevent broken route paths.
  - Sets `withCredentials: true` for cross-domain cookie sharing.
  - Attaches an Axios request interceptor that retrieves the JWT `token` from `localStorage` and appends `Authorization: Bearer <token>` to request headers.

---

### C. State Management (Context Layer)

#### 4. [AuthContext.jsx](file:///d:/interview-ai-pro/Frontend/src/context/AuthContext.jsx)
- **Role**: Manages user authentication lifecycle state.
- **State Properties**:
  - `user`: Currently logged-in user object (`{ id, username, email }`) or `null`.
  - `loading`: Boolean indicator during initial authentication check.
- **Exposed Methods**:
  - `login(email, password)`: Sends POST `/api/auth/login`, stores JWT token in `localStorage`, and updates `user`.
  - `register(username, email, password)`: Sends POST `/api/auth/register`, stores JWT token in `localStorage`, and updates `user`.
  - `logout()`: Sends GET `/api/auth/logout`, removes token from `localStorage`, and resets `user` state.
  - `checkAuth()`: Sends GET `/api/auth/me` on initial app render to verify active session.

#### 5. [InterviewContext.jsx](file:///d:/interview-ai-pro/Frontend/src/context/InterviewContext.jsx)
- **Role**: Manages state for interview preparation reports and live mock practice sessions.
- **State Properties**:
  - `reports`: Array of user's generated interview report summaries.
  - `currentReport`: Detailed single report object currently being viewed.
  - `loading`: Boolean state during AI report generation or detail fetching.
  - `error`: Error string state if an API request fails.
- **Exposed Methods**:
  - `fetchReports()`: Fetches all user reports via GET `/api/interview/`.
  - `fetchReportById(id)`: Fetches full report details via GET `/api/interview/report/:id`.
  - `createReport({ jobDescription, selfDescription, resumeFile })`: Posts multipart `FormData` to POST `/api/interview/` to trigger Gemini AI report generation.
  - `submitPracticeAnswer(interviewId, question, userAnswer)`: Posts user answer to POST `/api/interview/report/:id/practice` to receive instant AI scoring & feedback.

---

### D. UI Components Layer

#### 6. [Navbar.jsx](file:///d:/interview-ai-pro/Frontend/src/components/Navbar.jsx)
- **Role**: Top header navigation bar.
- **Functionality**:
  - Displays logo and branding ("Interview AI Pro").
  - Renders user profile information (username) and logout button when authenticated.
  - Displays Login/Register links when unauthenticated.

#### 7. [ProtectedRoute.jsx](file:///d:/interview-ai-pro/Frontend/src/components/ProtectedRoute.jsx)
- **Role**: Authentication guard component for private routes.
- **Functionality**:
  - Checks `loading` and `user` state from `AuthContext`.
  - Shows a sleek loading spinner while `checkAuth()` is running.
  - Redirects unauthenticated users to `/login`.

#### 8. [MatchGauge.jsx](file:///d:/interview-ai-pro/Frontend/src/components/MatchGauge.jsx)
- **Role**: Visual score meter component.
- **Functionality**:
  - Takes `score` (0-100) and optional `label` as props.
  - Computes SVG circular stroke offset and dynamic gradient colors (Green for >= 80%, Yellow for >= 60%, Orange/Red for < 60%).

#### 9. [PracticeModal.jsx](file:///d:/interview-ai-pro/Frontend/src/components/PracticeModal.jsx)
- **Role**: Interactive Mock Practice modal overlay.
- **Functionality**:
  - Allows candidates to type answers to specific technical or behavioral questions.
  - Invokes `submitPracticeAnswer()` from `InterviewContext`.
  - Displays instant AI evaluation scores, strengths, constructive feedback, and an exemplar AI-refined answer.

---

### E. Page Views

#### 10. [Login.jsx](file:///d:/interview-ai-pro/Frontend/src/pages/Login.jsx) & [Register.jsx](file:///d:/interview-ai-pro/Frontend/src/pages/Register.jsx)
- **Role**: User authentication pages.
- **Functionality**:
  - Controlled form inputs for email, password, and username.
  - Submits credentials via `AuthContext`.
  - Navigates user to `/dashboard` upon success.

#### 11. [Dashboard.jsx](file:///d:/interview-ai-pro/Frontend/src/pages/Dashboard.jsx)
- **Role**: Main application hub.
- **Functionality**:
  - **Generator Section**: Textarea for Job Description, optional self-description, and PDF resume upload input.
  - **Reports List**: Grid display of candidate's saved interview strategies with match scores, title, and creation date.

#### 12. [PlanDetail.jsx](file:///d:/interview-ai-pro/Frontend/src/pages/PlanDetail.jsx)
- **Role**: Comprehensive AI Interview Plan View.
- **Functionality**:
  - Displays Candidate Match Score and breakdown (Technical, Experience, Cultural).
  - Categorized Technical & Behavioral question cards with sample STAR answers and interviewer intent tips.
  - Identified Skill Gaps with severity indicators and learning recommendations.
  - 7-Day structured prep plan checklist.
  - Interactive "Practice Question" triggers opening `PracticeModal`.

---

## 3. End-to-End Data Flow in Frontend

```
[User Form Input / File Upload]
             │
             ▼
   (Dashboard.jsx / PlanDetail.jsx)
             │
             ▼
   Call Context Function (createReport / submitPracticeAnswer)
             │
             ▼
   InterviewContext / AuthContext
             │
             ▼
   Centralized Axios Service (src/services/api.js)
   └── Adds Authorization: Bearer <token> header
   └── Strips trailing slashes
             │
             ▼
   HTTPS Request Sent to Backend (Render)
             │
             ▼
   HTTPS Response Received (JSON)
             │
             ▼
   Context State Updated -> UI Component Re-renders dynamically
```

---

## 4. Deployment Configuration (Vercel)

- **Config File**: `vercel.json`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL`
- **SPA Routing Rule**:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
