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
  |- PostgreSQL (Primary relational store)
  |- Redis (Queue state & Caching - Mocked)
  |- LocalStorage / IndexedDB (Offline Support)
```

## 2. Tech Stack
- **Frontend**: React 19, Tailwind CSS (Design System), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Node.js, Express (API), JWT (Security), Bcrypt (Hashing).
- **AI Engine**: Google Gemini 1.5 Flash (Patient Risk Scoring & EMR Insights).
- **Finance**: Mobile Money API Abstraction (MTN/Orange).
- **Notifications**: WhatsApp Business API (Mock) + SMS Fallback.

## 3. Folder Structure
```text
/src
  /components        # UI Components (atoms, molecules)
  /services          # API clients & Business Logic
  /hooks             # Custom React Hooks
  /pages             # Main views (Dashboard, Booking, etc.)
  /types             # Shared TypeScript interfaces
  /utils             # Formatting, Math, Date helpers
/server
  /routes            # Express API endpoints
  /middleware        # Auth & Validation
  /services          # PDF generation, Mobile Money adapters
  /db                # Schema & Mock database
```
