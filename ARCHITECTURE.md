# KYAM Medical Center - Global Architecture

## 1. High-Level Architecture
```text
[ Patient App / Admin Portal (React + Vite) ]
          | (HTTPS / JSON)
          v
[ API Layer (Express / Node.js) ] <-----> [ Gemini AI (Scoring) ]
          |
[ Business Logic Engines ]
  |- Appointment Manager (Conflict Detection)
  |- Vaccination Scheduler (Age-based logic)
  |- Payment Gateway Abstraction (Mobile Money)
  |- Queue Manager (Real-time events)
          |
[ Data Persistence ]
  |- db.json (Primary JSON flat-file store for simple portability)
  |- LocalStorage (Offline UI state resilience)
```

## 2. Tech Stack
- **Frontend**: React 19, Tailwind CSS 4, Framer Motion (Animations), Lucide React (Icons), i18next (Translation).
- **Backend**: Node.js, Express (API), JWT (Security), Bcrypt (Hashing), Socket.IO (Real-time).
- **AI Engine**: Google Gemini 1.5 Flash (Patient Risk Scoring & EMR Insights).

## 3. Folder Structure
```text
/src
  /components        # UI Components & Views (Dashboard, Queue, etc.)
  /services          # AI Service integration
  /utils             # Mock data & offline sync logic
  /types.ts          # Shared TypeScript interfaces
  /i18n.ts           # Translation configuration
/server.ts           # Unified Express API + Vite Middleware
db.json              # Persistent state storage
```
