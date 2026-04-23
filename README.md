# KYAM Medical Center - Digital Portal 🇬🇳

A production-ready healthcare management platform designed for the Republic of Guinea. This application integrates advanced patient management, real-time consultation tracking (FIFO), and AI-driven medical analysis.

## ✨ Key Features

- **Multi-Language Support**: Fully localized in French and English.
- **Smart Queue Management**: FIFO-based consultation tracking with check-in/check-out workflow.
- **AI-Powered Medical Insights**: Powered by Google Gemini for patient risk scoring and EMR summarizes.
- **Clinical Admin Dashboard**: Real-time analytics on revenue, patient load, and practitioner availability.
- **Vaccination Intelligence**: Automated scheduling based on age and national health standards.
- **Secure Authentication**: JWT-based security with role-based access control (RBAC).

## 🚀 Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Framer Motion, Lucide Icons.
- **Backend**: Node.js & Express with persistence via `db.json`.
- **AI Engine**: Google Gemini API (`@google/genai`).
- **Real-time**: Socket.IO for live queue updates and staff notifications.

## 🛠 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file based on `.env.example`.
   ```env
   GEMINI_API_KEY=your_google_ai_studio_key
   JWT_SECRET=your_secret_key
   ```

### Running the App

Start the development server (Express + Vite):
```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

## 📂 Project Structure

- `/src`: Frontend React application.
- `/server.ts`: Express backend serving the API and Vite middleware.
- `db.json`: JSON-based flat-file database for state persistence.
- `ARCHITECTURE.md`: Technical deep-dive into the system design.

## ⚖️ License

Private / Confidential. Developed for KYAM Medical Center.
