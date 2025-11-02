WILL Project - Starter Scaffold

This workspace contains a minimal fullstack scaffold for the WILL Project (Login, module/test overview, NQF/difficulty analysis).

Structure
- backend/ - Express + TypeScript API (in-memory data seed)
- frontend/ - Vite + React + TypeScript app (simple pages: Login, ModuleOverview, TestDetail)

Quick Start (Windows PowerShell)

# From workspace root
cd "c:\Users\hein3\Documents\WILL_Project"

# Backend
cd backend
npm install
npm run dev

# In another terminal: Frontend
cd "c:\Users\hein3\Documents\WILL_Project\frontend"
npm install
npm run dev

Notes
- These are starter files to demonstrate the requested UI/screens and APIs. Replace or extend SQLite/Prisma or add persistent storage as needed.
- The backend uses an in-memory seed and JWT auth stub for demo. Default staff user: username: "staff", password: "password"; student: username: "student", password: "password".
