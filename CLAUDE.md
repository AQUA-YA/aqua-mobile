# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AquaYa (AQUA) — a React Native 0.86 + TypeScript mobile app (iOS/Android) for a water delivery marketplace. The codebase is freshly bootstrapped: `App.tsx` still renders the boilerplate screen, and there is no `src/` directory yet. The intended product and architecture are specified in `docs/` (written in Spanish):

- `docs/01-definition.md` — product spec: user roles (Consumer, Purificador, Repartidor, Admin), KYC, digital wallet, cash payments, tipping, commissions. Planned backend: NestJS + MongoDB.
- `docs/architecture.md` — the source of truth for the mobile architecture. Follow it when adding code.

## Commands

```sh
npm start                          # Metro dev server
npm run android                    # build & run on Android emulator/device
npm run ios                        # build & run on iOS simulator (macOS + Xcode)
npm run lint                       # ESLint
npm test                           # Jest (all tests)
npm test -- __tests__/App.test.tsx # single test file
npm test -- -t "name"              # single test by name
```

iOS native deps (first time, and after adding native modules): `bundle install` then `bundle exec pod install` from `ios/`.

Requires Node >= 22.11.0 (enforced via package.json `engines`). Yarn lockfile is present (`yarn.lock`).

## Planned architecture (from docs/architecture.md)

Tech stack to use as features are built: React Navigation (native stack + drawer), Zustand (global UI state), React Query (server state), Axios (HTTP), React Hook Form + Zod (forms/validation), React Native Paper / Material Design 3 (UI), MMKV (persistence), date-fns (dates). Most of these are not yet installed — add them as needed, don't assume they exist.

Code goes under `src/` with this layout: `api/`, `components/`, `hooks/`, `navigation/`, `screens/`, `store/`, `theme/`, `types/`, `utils/`.

Architectural rules:

1. Screens never import from `api/` directly — data access goes through hooks. Flow is Screen → Hook → API → Backend.
2. Keep the three kinds of state separate: server state in React Query, global UI state in Zustand, local state in `useState`.
3. UI is built from React Native Paper components; theming (including dark mode, persisted via MMKV + Zustand) is centralized in `src/theme/`.
4. Naming: PascalCase for components/screens, camelCase with `use` prefix for hooks.
5. Tests: Jest for units, React Testing Library for components; integration tests live in `__tests__/`.

## Code style

Prettier: single quotes, trailing commas everywhere, `arrowParens: 'avoid'`. ESLint extends `@react-native`. Project documentation is written in Spanish.
