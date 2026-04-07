# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## App: High-Protein Vegetarian No-Egg Macro Planner

### Purpose
A fitness nutrition web app for vegetarian athletes following a PPL (Push/Pull/Legs) program. Users enter their weight and goals, and get a 7-day meal plan built around paneer, soya chunks, lentils, and whey protein — precisely hitting protein targets without meat or eggs.

### Pages
- `/` — Profile Setup: enter name, weight, height, age, goal, activity level, dietary prefs, preferred proteins
- `/dashboard` — overview of macro targets, latest meal plan summary, generate plan button
- `/meal-plan/:id` — 7-day tabbed view with PPL workout labels, per-meal macro breakdown, progress bars
- `/ingredients` — searchable reference of all protein ingredients with per-100g macros
- `/macro-calculator` — standalone calculator for daily protein/calorie targets

### DB Schema (lib/db/src/schema/)
- `profiles` — user profile with weight, goal, activity, dietary preferences
- `ingredients` — 18 pre-seeded vegetarian protein sources with per-100g macros
- `meal_plans` — generated 7-day plans stored as JSONB (days array)

### API Routes (artifacts/api-server/src/routes/)
- `GET/POST /api/profiles`
- `GET/PATCH /api/profiles/:id`
- `GET/POST /api/meal-plans`
- `GET/DELETE /api/meal-plans/:id`
- `GET /api/meal-plans/:id/summary`
- `GET /api/ingredients`
- `POST /api/macro-targets` — calculates TDEE + macro splits

### Meal Generation Logic
Located in `artifacts/api-server/src/lib/meal-generator.ts`:
- Uses Mifflin-St Jeor BMR formula for TDEE calculation
- Protein targets: 1.8g/kg (muscle gain), 2.0g/kg (fat loss), 1.6g/kg (maintenance)
- PPL schedule: Mon Push, Tue Pull, Wed Legs, Thu Push, Fri Pull, Sat Legs, Sun Rest
- Adds whey shake on all workout days to hit protein targets
- 18 Indian vegetarian ingredients with accurate macro data
