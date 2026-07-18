# FlowPOS

**An open-source, AI-powered, customizable Point of Sale system for small businesses.**

Built with React · Node.js · PostgreSQL · Google Gemini 3.5 Flash · PWA

![Status](https://img.shields.io/badge/status-active%20development-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange)

## What is FlowPOS?
FlowPOS is a free, open-source POS system for small to medium businesses. Self-hostable, fully customizable per business, and AI-assisted — from product setup to daily sales insights.

Key features:
- AI onboarding — fill in products in plain language, AI organizes them automatically
- Works offline — PWA with IndexedDB sync, no internet required at the counter
- Any device — runs in any browser, installs on phones, tablets, desktops
- Your brand — each business sets their own colors, logo, font, and layout
- AI sales insights — daily plain-language summaries of what sold and what to restock

## Tech stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Icons | Lucide React |
| Charts | Recharts |
| Routing | React Router v6 |
| Offline | Dexie.js (IndexedDB) + Workbox PWA |
| Backend | Node.js + Express |
| Database | PostgreSQL via Prisma ORM |
| Cache | Redis |
| Auth | JWT (access + refresh) + bcrypt |
| Validation | Zod |
| AI | Google Gemini 3.5 Flash |
| Images | Cloudinary |
| Security | Helmet.js + express-rate-limit |

## Getting started
### Prerequisites
- Node.js 18+, PostgreSQL 14+, Redis 7+
- Google AI Studio API key (free at aistudio.google.com)
- Cloudinary account (free tier)

### Setup
```bash
git clone https://github.com/YOUR_USERNAME/flowpos.git
cd flowpos/backend && npm install
cd ../frontend && npm install
cp backend/.env.example backend/.env  # fill in your values
cp frontend/.env.example frontend/.env
cd backend && npx prisma migrate dev --name init
npm run dev  # in both backend and frontend terminals
```
Visit http://localhost:5173

## Roadmap
- [x] Project skeleton and architecture
- [x] Phase 1: Database schema (Prisma + PostgreSQL)
- [x] Phase 2: Auth API (register, login, JWT refresh)
- [ ] Phase 3: Products and categories CRUD
- [ ] Phase 4: Transactions and reports
- [ ] Phase 5: AI endpoints (organizer + insights)
- [ ] Phase 6: Frontend scaffold and theme engine
- [ ] Phase 7: Onboarding wizard
- [ ] Phase 8: POS cashier screen
- [ ] Phase 9: Dashboard and reports
- [ ] Phase 10: Product/category management UI
- [ ] Phase 11: UI customization settings
- [ ] Phase 12: PWA offline sync
- [ ] Phase 13: Security hardening
- [ ] Phase 14: QA and production-ready release
- [ ] Phase 15: Deployment (Railway + Vercel)

## Contributing
Contributions are welcome — see CONTRIBUTING.md for how to get involved.

Areas where help is most needed:
- UI/UX improvements to the POS cashier screen
- Additional payment method integrations
- Translations and localization
- Unit and integration tests
- Documentation

## License
This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for full details.

Copyright (c) 2026 Joseph Mercado

## Built by
Joseph Mercado - Information Technology student, Philippines.
Built using Google Antigravity IDE with AI-assisted coding, Claude Opus 4.6 and Gemini 3.5 Flash.

---
*FlowPOS records sales for small business management purposes only. Not financial or payment-processing software.*
