# Enterprise Lead Management & Sales Analytics

A sophisticated, full-stack CRM platform engineered for high-velocity sales teams. This system streamlines the lead lifecycle through an intuitive visual pipeline, real-time telemetry, and intelligent prioritization.

## 🌟 Core Capabilities

### 📈 Intelligent Pipeline Analytics
Utilize a real-time performance dashboard to monitor conversion rates, lead distribution, and source effectiveness. Data is visualized through interactive Recharts components for immediate actionable insights.

### 🛡️ Secure Lead Lifecycle Tracking
Manage prospects through a multi-stage funnel (*New*, *Contacted*, *Qualified*, *In Progress*, *Converted*, *Lost*). Each transition is logged in a persistent activity ledger, ensuring a full audit trail for every interaction.

### ⚡ Performance-Driven User Experience
- **Optimistic UI Updates**: Sub-second feedback on status changes and note additions.
- **Dynamic Prioritization**: Automated "Interest Level" scoring based on engagement signals and temporal data.
- **Enterprise Data Mobility**: High-speed CSV bulk import and export capabilities for seamless CRM synchronization.

### 🎨 Design & Accessibility
Built with a "technical-premium" aesthetic, the interface supports system-aware Dark/Light modes, utilizing the **Inter** typeface for readability and **JetBrains Mono** for data-heavy views.

---

## 🏗️ Technical Architecture

### Frontend Ecosystem
- **Framework**: React 18 (Hooks, Context API)
- **Build Tool**: Vite (ESM-first)
- **Styling**: Tailwind CSS (Utility-first design system)
- **Animation**: Motion (Fluid layout transitions)
- **Insights**: Recharts (SVG-based data visualization)

### Backend Engineering
- **Environment**: Node.js + Express
- **Database**: SQLite (ACID compliant)
- **Persistence**: better-sqlite3 (High-performance native bindings)
- **Security**: JWT (JSON Web Token) authentication with bcrypt-based password hashing

---

## 📂 System Architecture

```text
├── src/                # React Frontend Application
│   ├── components/     # Atomic & Specialized UI Components
│   ├── lib/            # Shared Utilities & API Client
│   └── App.tsx         # Application Root & State Orchestration
├── server.ts           # Express API Gateway & SQLite Integration
├── init.sql           # Database Schema Definition
└── README.md           # Documentation
``picture
<img width="1915" height="830" alt="Screenshot from 2026-05-10 16-36-09" src="https://github.com/user-attachments/assets/2407bcf4-bcdf-4386-ba99-fa2b41f5cfc7" />
<img width="1915" height="830" alt="Screenshot from 2026-05-10 16-40-36" src="https://github.com/user-attachments/assets/6062e80a-b217-47f4-90b8-4ee84297a5b1" />
<img width="1915" height="830" alt="Screenshot from 2026-05-10 16-40-49" src="https://github.com/user-attachments/assets/03f3d495-03fb-4be5-97aa-d8c288cfc82e" />
<img width="1915" height="830" alt="Screenshot from 2026-05-10 16-41-02" src="https://github.com/user-attachments/assets/10d0a8ca-1c7e-4496-92c6-6659cf59d5f4" />
<img width="1915" height="830" alt="Screenshot from 2026-05-10 16-41-16" src="https://github.com/user-attachments/assets/8a2fec0e-0073-411d-bf06-ddcbee06d377" />
<img width="1915" height="830" alt="Screenshot from 2026-05-10 16-41-27" src="https://github.com/user-attachments/assets/d559cbc6-d12e-4fd3-945a-9910e8db636c" />
<img width="1915" height="830" alt="Screenshot from 2026-05-10 16-41-36" src="https://github.com/user-attachments/assets/a549d387-4fef-40b3-8610-fd9490106539" />
<img width="1915" height="830" alt="Screenshot from 2026-05-10 16-52-48" src="https://github.com/user-attachments/assets/89bb03ac-980d-4af3-8d35-d0c6a8094b2b" />









---

## 🚦 Deployment & Development

### Local Environment Setup
1. **Provision Node Dependencies**:
   ```bash
   npm install
   ```
2. **Execute Unified Dev Stack**:
   ```bash
   npm run dev
   ```
   *The backend initializes the SQLite database automatically on the first run.*

### Production Build
Generates a highly optimized static bundle in the `/dist` directory for edge deployment.
```bash
npm run build
```

---

## 🔒 Security & Privacy
This application implements industry-standard security practices, including stateless JWT authentication, protected API routes, and secure password storage. For production environments, ensure the `SECRET_KEY` is configured via environment variables.
