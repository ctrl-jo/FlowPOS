# FlowPOS Project Rules

Follow these guidelines for committing and pushing after implementing each phase:

## Git Commit & Push Flow
After completing a phase, execute:
```bash
git add .
git commit -m "<Commit Message for Phase>"
git push origin main
```

## Commit Messages by Phase
- **After B1**: `feat: add Prisma schema and PostgreSQL setup`
- **After B2**: `feat: add JWT auth with refresh token rotation`
- **After B3**: `feat: add products and categories CRUD API`
- **After B4**: `feat: add transactions and reports API`
- **After B5**: `feat: add Gemini AI organize and insights endpoints`
- **After F1**: `feat: add React frontend scaffold and theme engine`
- **After F2**: `feat: add onboarding wizard with AI catalog organizer`
- **After F3**: `feat: add POS cashier screen with offline cart`
- **After F4**: `feat: add dashboard with revenue charts and AI insights`
- **After F5**: `feat: add product and category management UI`
- **After F6**: `feat: add UI customization and live theme preview`
- **After F7**: `feat: add PWA offline sync with Workbox and Dexie.js`
- **After P1**: `chore: full security audit and hardening`
- **After P2**: `chore: mobile polish and UX improvements`
- **After QA**: `release: v1.0.0 — QA complete, production ready`
- **After D3**: `docs: add live demo link and deployment screenshots to README`

## Roadmap Updates
- Update the roadmap in `README.md` after each phase: change `[ ]` to `[x]` for the completed phase, and include that update in the commit.
