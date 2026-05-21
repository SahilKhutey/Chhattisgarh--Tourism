# CG Tourism OS 

![License](https://img.shields.io/badge/License-Proprietary_Commercial-red.svg)
![Build](https://img.shields.io/badge/Build-Zero_Error-brightgreen.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)

**CG Tourism OS** is a highly scalable, full-stack intelligence platform built to digitize Chhattisgarh's rich tribal narratives, natural bio-reserves, and heritage corridors. Engineered for extreme reliability and professional commercialization, this platform bridges the gap between ancient folklore and modern decentralized architecture.

## 🏛️ Ecosystem Architecture

This platform utilizes a **Monorepo Architecture** powered by TurboRepo to maximize code sharing, type safety, and deployment efficiency.

### 1. Frontend (Client Gateway)
*   **Framework:** Next.js (App Router)
*   **Styling:** Tailwind CSS + Custom CSS (Glassmorphism / "Sovereign Intelligence" aesthetic)
*   **Mapping:** Leaflet Maps Integration for dynamic georeferenced tourism tracking.
*   **State Management:** Zustand for localized, zero-latency state synchronization.
*   **Linting:** Absolute zero-error state strict ESLint configuration.

### 2. Backend (Kernel Services)
*   **Framework:** NestJS (Node.js)
*   **Database:** Prisma ORM with SQLite (Expandable to PostgreSQL)
*   **Security:** Rate-limiting, CORS, and Sanitized Error Exceptions to prevent stack trace leaks.
*   **Modules:**
    *   Auth (JWT Registration / Login)
    *   Moderation (RBAC for ADMIN, MODERATOR, CREATOR)
    *   Folklore (Multimedia-ready tribal story ingestion)
    *   Places (Georeferenced coordinate APIs)

## 📖 Deep Dive Documentation

For extreme-detail blueprints of our individual subsystems, consult the `docs/` directory:
- [Phase 1: Production Setup](./docs/Phase1_Production_Setup.md)
- [Phase 2: Core Backend APIs](./docs/Phase2_Core_Backend_APIs.md)
- [Phase 3: Frontend Architecture](./docs/Phase3_Frontend_Architecture.md)
- [Phase 4: Web Admin Platform](./docs/Phase4_Web_Admin_Platform.md)
- [Phase 5: AI Tourism Intelligence](./docs/Phase5_AI_Tourism_Intelligence.md)
- [System Architecture Details](./docs/Architecture.md)
- [Security, Auth & Emergency SOS Subsystem](./docs/Security_Authentication_Emergency_SOS.md)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm (v9.0.0+)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/SahilKhutey/Chhattisgarh--Tourism.git
   cd Chhattisgarh--Tourism
   ```

2. Install dependencies via TurboRepo:
   ```bash
   pnpm install
   ```

3. Configure Environment Variables:
   - Duplicate `.env.example` to `.env` in both `apps/web` and `apps/backend`.
   - Update DB URLs and JWT secrets as necessary.

4. Initialize the Database:
   ```bash
   cd apps/backend
   npx prisma generate
   npx prisma db push
   ```

### Running Locally
To launch the entire platform (Frontend + Backend) concurrently:
```bash
pnpm run dev
```
- **Web App:** `http://localhost:3000`
- **API Kernel:** `http://localhost:3001`

### Verifying Build Stability
This codebase maintains a **strict zero-error build policy**.
```bash
pnpm run lint
pnpm run build
```

## 📜 Licensing & Commercialization

This software is licensed under the **Proprietary Commercial License**. It is exclusively owned and intended for commercial operation. Unauthorized copying, distribution, or reverse-engineering of this repository is strictly prohibited without explicit written consent.

See the [LICENSE.md](./LICENSE.md) file for extensive legal terms.

## 🤝 Contribution Guidelines

Internal team members and verified external agencies must adhere to the strict operational protocols outlined in [CONTRIBUTING.md](./CONTRIBUTING.md).
