# Hiring Management (Rakamin themed)

A Next.js + React hiring management application with user and admin interfaces, built with TailwindCSS, Firebase (Auth & Firestore/Storage), MediaPipe hand-pose camera capture, and Heroicons.

This README describes how to set up, run and understand the main parts of the project.

## Key features

- Email / Google authentication (Firebase)
- User pages: browse jobs, job detail, apply with camera capture
- Admin pages: company profile, job list, manage candidates
- MediaPipe-based hand-pose camera UI for taking profile/capture photos
- Zustand for client-side store (jobStore)

## Tech stack

- Next.js 16 (App Router + pages coexistence)
- React 19
- TypeScript
- Tailwind CSS
- Firebase (client SDK + firebase-admin on server-side where applicable)
- @heroicons/react for icons
- @mediapipe/hands for hand-pose detection
- react-webcam (installed but MediaPipe camera utils are used)
- Zustand (state management)

## Repository layout (important files)

- `src/app/` — App-level layout and global styles
- `src/pages/` — Classic Next.js pages used for many routes (login, register, admin, user pages)
- `src/pages/user/ModalCamera.tsx` — Camera modal using MediaPipe Hands for pose detection and automated capture
- `src/components/` — Reusable UI components (Navbar, Modal, Toast, JobCard, etc.)
- `src/lib/firebase.ts` — Client-side Firebase initialization
- `src/lib/firebaseAdmin.ts` — Server-side Firebase admin init (service account usage)
- `src/lib/authService.ts` — Authentication helpers/wrappers around Firebase
- `src/contexts/AuthContext.tsx` and `src/hooks/useAuth.ts` — Auth provider and hook
- `src/store/jobStore.ts` — Zustand store for job-related state
- `FIREBASE_SETUP.md` — Project-specific Firebase setup instructions
- `serviceAccountKey.json` / `hiring-management-...firebase-adminsdk-....json` — Example service account files (sensitive; keep private)

## Setup

Prerequisites:

- Node.js (recommended LTS), npm
- A Firebase project with Authentication and Firestore/Storage configured

1. Install dependencies

```powershell
npm install
```

2. Firebase setup

- Follow the included `FIREBASE_SETUP.md` file for step-by-step instructions.
- Place your Firebase client config in `src/lib/firebase.ts` (or provide it via env vars if you adapted the code).
- For server-side admin operations (if used), provide a service account JSON. The repo contains example JSON files; do NOT commit your production service account to source control. The code may expect `serviceAccountKey.json` or the other JSON file in the repository root — verify `src/lib/firebaseAdmin.ts`.

3. Environment variables

- If the app expects env vars, create a `.env.local` in project root and add any Firebase keys required by `src/lib/firebase.ts` (for example: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, etc.). Check `src/lib/firebase.ts` for the exact names.

4. Dev server

```powershell
npm run dev
```

Then open http://localhost:3000

## Notes about camera & MediaPipe

- The camera modal (`src/pages/user/ModalCamera.tsx`) uses the MediaPipe Hands library and `@mediapipe/camera_utils` to access the webcam and run pose detection. Modern browsers require secure context (https) for camera access. When developing locally, Next.js dev server on `localhost` is usually allowed.
- Ensure you grant camera permission in the browser.
- If you experience MediaPipe loading issues, check console warnings and network access to the CDN used in the file (the code loads model files from jsdelivr by default).

## Linting / TypeScript

- TypeScript is configured via `tsconfig.json`.
- Run linter:

```powershell
npm run lint
```

## Common tasks

- Build for production:

```powershell
npm run build
npm run start
```

- Run tests: (no test runner configured by default; add Jest/Playwright if needed)

## Security & secrets

- Do NOT commit real `serviceAccountKey.json` or any other secret JSON to the repository. Use environment variables or a secure secret manager for production.
- The repo contains example JSON files — remove or rotate them if they are from a real project.

## Contributing

1. Open an issue to discuss major changes.
2. Create a feature branch and a pull request with clear description and testing steps.

## Where to look next (developer tips)

- `src/pages/Login/LoginPage.tsx` and `src/pages/Register/RegisterPage.tsx` — authentication UI patterns
- `src/components/user/JobCard.tsx` — job listing card usage
- `src/pages/admin/` — admin-only routes (check protected routes implementation in `src/api/ProtectedRoute.tsx`)
- `src/pages/user/ModalCamera.tsx` — study pose detection flow and model loading

## License

This project has no license file in the repo. Add `LICENSE` to define terms for reuse.

---

If you'd like, I can also:

- Add a short development checklist to the README (install, run, common pitfalls).
- Extract exact env variable names by scanning `src/lib/firebase.ts` and add them to the README.

Tell me which of the above you'd like next.
