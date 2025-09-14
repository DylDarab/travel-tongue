## Brief overview
This document outlines the key development conventions and patterns used in the Travel Tongue application - a Next.js 15 travel language learning app with tRPC, Drizzle ORM, and NextAuth authentication.

## Project Architecture
- **Next.js 15** with App Router in `src/app/`
- **tRPC** for type-safe API calls between client and server
- **Drizzle ORM** with PostgreSQL for database operations
- **NextAuth v5** with Google OAuth for authentication
- **Tailwind CSS v4** with teal color scheme for styling
- **React Hook Form + Zod** for form validation and type safety

## Development Workflow
- Use `pnpm` for package management (scripts in package.json)
- Run `pnpm check` before commits (lint + TypeScript)
- Use `--turbo` flag for faster development builds
- Follow conventional commit messages
- Database operations via `pnpm db:*` commands

## Component Patterns
- **Default to Server Components** - only use `'use client'` when interactivity required
- **Reuse existing components** from `src/components/` before creating new ones
- **PascalCase directories** with `index.tsx` for component organization
- **Import order**: React/Next.js → third-party → internal (`@/`) → relative → types
- **Form handling**: Always use React Hook Form with Zod validation

## File Organization
```
src/
├── app/                    # Next.js App Router
│   ├── (web-app)/         # Protected routes with layout
│   ├── onboarding/        # Multi-step onboarding flow
│   └── api/               # API routes (auth, tRPC)
├── components/            # Reusable UI components
├── server/                # Server-side code
│   ├── api/routers/      # tRPC routers
│   ├── api/services/     # Business logic services
│   ├── db/schema/        # Drizzle schema definitions
│   └── auth/             # NextAuth configuration
└── constants.ts          # App-wide constants
```

## Database Conventions
- Use `createTable` helper with `tt_` prefix for tables
- **UUID primary keys** with `gen_random_uuid()`
- **Timestamps** with timezone and `$onUpdate` for updatedAt
- **Foreign keys** with proper cascade deletes
- **Enums** defined in `src/server/db/schema/enums.ts`
- **Snake_case columns** that map to camelCase TypeScript properties

## TypeScript Standards
- **Strict mode enabled** with `noUncheckedIndexedAccess`
- **No `any` types** - use proper type definitions
- **Zod schemas** for runtime validation with type inference
- **`server-only`** package for server-side code isolation
- **Path aliases** using `@/` for src directory imports

## UI/UX Guidelines
- **Teal color scheme** (`teal-500`, `teal-50`) with gray text hierarchy
- **Mobile-first responsive design** with Tailwind
- **Touch-friendly** button sizes (minimum 44px)
- **Form spacing** using `space-y-6` for consistent layout
- **Lucide React icons** with consistent sizing
- **Accessibility** with proper ARIA labels and focus states

## State Management
- **Server state**: tRPC queries and mutations
- **Client state**: Zustand stores in `_stores/` directories
- **Form state**: React Hook Form with context sharing
- **URL state**: Next.js navigation and search params

## API Patterns
- All API calls go through tRPC routers in `src/server/api/routers/`
- Use procedure types: `.query()` for reads, `.mutation()` for writes
- Implement proper error handling with tRPC error utilities
- Business logic separated into service layers
- Input validation with Zod schemas before database operations

## Authentication & Authorization
- NextAuth v5 beta with Google OAuth provider
- Protected routes use middleware for session validation
- User data stored in database with Drizzle adapter
- Session management through NextAuth configuration in `src/server/auth/`

## Performance Considerations
- Use React Server Components by default to reduce client bundle size
- Implement proper loading states for async operations
- Database queries should include necessary relations to avoid N+1 issues
- Use React Suspense for code splitting where appropriate
- Optimize images and assets for web delivery