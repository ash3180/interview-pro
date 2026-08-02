# Backend Documentation: Architecture, Component Guide & Data Flow

Welcome to the comprehensive backend architecture and component documentation for **Interview AI Pro**.

---

## 1. High-Level Architecture Overview

The Backend is a RESTful API web application powered by Node.js, Express, MongoDB, and Google's Gemini AI engine.

- **Runtime & Server**: Node.js (v18+) + Express 5
- **Database Layer**: MongoDB Atlas + Mongoose ORM 9
- **Artificial Intelligence**: Google Gemini 3 Flash (`@google/genai`) with Zod JSON Schema Enforcement
- **Authentication**: JWT (JSON Web Tokens) + Bcrypt Password Hashing + Dual Cookie/Bearer Header Extraction
- **File Processing**: Multer (Memory Storage) + `pdf-parse` (In-Memory Resume Parsing)
- **Deployment Platform**: Render Cloud Web Service (configured via `render.yaml`)

### Backend System Architecture Diagram

```
+-----------------------------------------------------------------------+
|                           CLIENT (Frontend)                           |
+-----------------------------------|-----------------------------------+
                                    | HTTPS Requests (JSON / Multipart)
                                    v
+-----------------------------------------------------------------------+
|                           EXPRESS API SERVER                          |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  |                 Global Middleware Stack                         |  |
|  |     (CORS, JSON Parser, Cookie Parser, DB Re-connect Guard)     |  |
|  +-----------------------------------------------------------------+  |
|                                   |                                   |
|        +--------------------------+--------------------------+        |
|        |                                                     |        |
|        v                                                     v        |
|  +---------------------------+                 +--------------------+ |
|  |   Auth Routes (/api/auth) |                 | Interview Routes   | |
|  |                           |                 | (/api/interview)   | |
|  +-------------|-------------+                 +---------|----------+ |
|                |                                         |            |
|                v                                         v            |
|  +---------------------------+                 +--------------------+ |
|  |     Auth Controller       |                 | Upload Middleware  | |
|  | (register, login, getMe)  |                 | Auth Middleware    | |
|  +-------------|-------------+                 +---------|----------+ |
|                |                                         |            |
|                |                                         v            |
|                |                               +--------------------+ |
|                |                               |Interview Controller| |
|                |                               +---------|----------+ |
|                |                                         |            |
|                +--------------------+--------------------+            |
|                                     |                                 |
|                +--------------------+--------------------+            |
|                |                                         |            |
|                v                                         v            |
|  +---------------------------+                 +--------------------+ |
|  |   Mongoose Models (DB)    |                 |   AI Service Layer | |
|  | (User, InterviewReport)   |                 | (Gemini 3 Flash)   | |
|  +-------------|-------------+                 +---------|----------+ |
+----------------|-----------------------------------------|------------+
                 | Database Reads/Writes                   | AI Prompting / Structured JSON
                 v                                         v
+-----------------------------------+     +-----------------------------------+
|      MongoDB Atlas Database       |     |      Google Gemini AI Engine       |
+-----------------------------------+     +-----------------------------------+
```

---

## 2. File & Component Breakdown

### A. Entry & Server Setup

#### 1. [server.js](file:///d:/interview-ai-pro/Backend/server.js)
- **Role**: Application execution entry point.
- **Functionality**:
  - Loads environment variables from `.env` using `dotenv`.
  - Imports Express application instance (`src/app.js`) and database connector (`src/config/database.js`).
  - Initiates MongoDB database connection.
  - Starts HTTP server listener on `process.env.PORT` (or `3000`), guarded to run in both local development and cloud production (Render) environments.

#### 2. [app.js](file:///d:/interview-ai-pro/Backend/src/app.js)
- **Role**: Core Express application setup & middleware assembly.
- **Functionality**:
  - Configures body parsers (`express.json`, `express.urlencoded` with 10MB payload limits).
  - Configures `cookie-parser`.
  - Establishes production CORS policy allowing configured `CLIENT_URL` origins, `.netlify.app`, and `.vercel.app` domains with `credentials: true`.
  - Attaches global health check endpoint `GET /`.
  - Mounts API routers (`/api/auth` and `/api/interview`).

#### 3. [database.js](file:///d:/interview-ai-pro/Backend/src/config/database.js)
- **Role**: Database connection manager.
- **Functionality**:
  - Connects to MongoDB Atlas using Mongoose with `MONGO_URI` or `MONGODB_URI`.
  - Implements connection caching (`isConnected` flag) to prevent redundant connection attempts.

---

### B. Database Schemas & Models

#### 4. [user.model.js](file:///d:/interview-ai-pro/Backend/src/models/user.model.js)
- **Role**: User entity schema definition.
- **Schema Fields**:
  - `username` (String, required, unique, trimmed).
  - `email` (String, required, unique, lowercase, trimmed).
  - `password` (String, hashed with bcrypt).
  - `timestamps` (`createdAt`, `updatedAt`).

#### 5. [interviewReport.model.js](file:///d:/interview-ai-pro/Backend/src/models/interviewReport.model.js)
- **Role**: AI Interview Plan & Practice Session schema.
- **Schema Fields**:
  - `user`: Reference ObjectId to `User`.
  - `title`: Generated job position title.
  - `resume` & `selfDescription`: Extracted text inputs.
  - `jobDescription`: Target job requirements text.
  - `matchScore`: Overall compatibility score (0-100).
  - `matchBreakdown`: Breakdown object (`technicalFit`, `experienceFit`, `culturalFit`, `keyStrengths`).
  - `technicalQuestions`: Array of technical questions, interviewer intent, ideal answers, and categories.
  - `behavioralQuestions`: Array of behavioral questions, intentions, STAR answers, and STAR tips.
  - `skillGaps`: Array of skill gaps, severity level (`low`, `medium`, `high`), and recommendations.
  - `preparationPlan`: 7-day focus areas and task checklists.
  - `practiceSessions`: Log of candidate practice attempts (`question`, `userAnswer`, `score`, `feedback`, `improvedAnswer`, `createdAt`).

---

### C. Middlewares Layer

#### 6. [auth.middleware.js](file:///d:/interview-ai-pro/Backend/src/middlewares/auth.middleware.js)
- **Role**: Route protection middleware.
- **Functionality**:
  - Extracts JWT token from either `req.cookies.token` OR `Authorization: Bearer <token>` header.
  - Verifies token signature using `process.env.JWT_SECRET`.
  - Attaches decoded user payload (`{ id, username }`) to `req.user`.
  - Returns HTTP 401 Unauthorized if token is missing or invalid.

#### 7. [upload.middleware.js](file:///d:/interview-ai-pro/Backend/src/middlewares/upload.middleware.js)
- **Role**: File upload handler.
- **Functionality**:
  - Uses `multer` configured with memory storage (`storage: multer.memoryStorage()`).
  - Accepts single file uploads under field name `'resume'` with file size limits (5MB).

---

### D. AI Service Layer

#### 8. [ai.service.js](file:///d:/interview-ai-pro/Backend/src/services/ai.service.js)
- **Role**: Google Gemini AI Integration Engine.
- **Functions**:
  - `getAiClient()`: Initializes `@google/genai` client using `process.env.GOOGLE_GENAI_API_KEY`.
  - `generateInterviewReport({ resume, selfDescription, jobDescription })`:
    - Enforces structured JSON output via `zodToJsonSchema(interviewReportSchema)`.
    - Prompts Gemini (`gemini-3-flash-preview`) to analyze candidate background against job requirements.
    - Returns structured JSON containing match scores, questions, skill gaps, and 7-day prep plan.
  - `evaluatePracticeAnswer({ question, userAnswer, jobDescription })`:
    - Enforces structured JSON output via `zodToJsonSchema(practiceFeedbackSchema)`.
    - Prompts Gemini to evaluate candidate's mock response, scoring 0-100 and generating constructive feedback + an improved exemplar answer.

---

### E. Controllers & Routes Layer

#### 9. Auth Controller & Routes ([auth.controller.js](file:///d:/interview-ai-pro/Backend/src/controllers/auth.controller.js) / [auth.routes.js](file:///d:/interview-ai-pro/Backend/src/routes/auth.routes.js))
- **Endpoints**:
  - `POST /api/auth/register`: Validates credentials, hashes password with bcrypt, creates User record, issues JWT token (set via HTTP-Only cookie AND returned in JSON body).
  - `POST /api/auth/login`: Verifies user email & password match, issues JWT token.
  - `GET /api/auth/logout`: Clears authentication cookie.
  - `GET /api/auth/me`: Fetches authenticated user profile (guarded by `authUser`).

#### 10. Interview Controller & Routes ([interview.controller.js](file:///d:/interview-ai-pro/Backend/src/controllers/interview.controller.js) / [interview.routes.js](file:///d:/interview-ai-pro/Backend/src/routes/interview.routes.js))
- **Endpoints**:
  - `POST /api/interview/`: (Guarded by `authUser` & `upload.single('resume')`) Parses PDF resume buffers via `pdf-parse`, invokes Gemini `generateInterviewReport`, saves `InterviewReport` to MongoDB, and returns generated plan.
  - `GET /api/interview/`: (Guarded by `authUser`) Fetches all interview reports belonging to the user.
  - `GET /api/interview/report/:interviewId`: (Guarded by `authUser`) Fetches single full interview strategy report.
  - `POST /api/interview/report/:interviewId/practice`: (Guarded by `authUser`) Evaluates practice response via Gemini `evaluatePracticeAnswer`, appends attempt to `practiceSessions` in database, and returns real-time feedback.

---

## 3. End-to-End API Data Flow

```
1. Client POST /api/interview/ (with PDF Resume & Job Description)
   │
   ▼
2. CORS & Parser Middlewares (app.js)
   │
   ▼
3. Auth Middleware (auth.middleware.js)
   ├── Decodes JWT token -> req.user = { id }
   │
   ▼
4. Upload Middleware (upload.middleware.js)
   ├── Stores PDF buffer in memory -> req.file.buffer
   │
   ▼
5. Interview Controller (interview.controller.js)
   ├── Passes buffer to pdf-parse -> Extracts plain text
   │
   ▼
6. AI Service (ai.service.js)
   ├── Sends structured prompt + Zod Schema to Google Gemini 3 Flash
   └── Gemini returns validated JSON
   │
   ▼
7. Database Persistence (interviewReport.model.js)
   └── Saves InterviewReport document linked to req.user.id
   │
   ▼
8. Response returned to Client (HTTP 201 Created)
```

---

## 4. Deployment Configuration (Render)

- **Config File**: `render.yaml`
- **Build Command**: `npm install`
- **Start Command**: `npm start` (`node server.js`)
- **Required Environment Variables**:
  - `PORT`: (10000)
  - `NODE_ENV`: `production`
  - `MONGO_URI`: MongoDB Atlas Connection String
  - `JWT_SECRET`: Secret JWT Key
  - `GOOGLE_GENAI_API_KEY`: Gemini API Key
  - `CLIENT_URL`: Vercel/Netlify Frontend URL
