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
```

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
