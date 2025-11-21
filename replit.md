# HydroClash - Competitive Hydration Tracking

## Overview

HydroClash is a gamified hydration tracking application that enables users to create challenges and compete with friends to see who can drink the most liquid. The application features real-time leaderboards, animated liquid visualizations, and social competition mechanics. Users can log drinks in milliliters, track their progress against daily or total targets, and view their performance relative to other challenge participants.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Bundling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for client-side routing (lightweight alternative to React Router)
- React Query (TanStack Query) for server state management, caching, and data synchronization

**UI Component System**
- Shadcn/ui component library built on Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom theme configuration
- Custom fonts: Rajdhani (sans-serif) and Chakra Petch (display) for brand identity
- Framer Motion for fluid animations (particularly for liquid fill animations and transitions)
- Class Variance Authority (CVA) for component variant management

**State Management Strategy**
- Server state managed through React Query with aggressive caching (`staleTime: Infinity`)
- Local UI state managed with React hooks
- Authentication state derived from `/api/auth/user` endpoint query
- Query invalidation patterns used to sync UI after mutations

**Design Patterns**
- Route-based code organization with dedicated page components
- Custom hooks for reusable logic (useAuth, useToast, useIsMobile)
- Compound component patterns in UI library components
- Centralized API request handling through `apiRequest` utility function

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and routing
- Dual entry points: `index-dev.ts` (development with Vite SSR) and `index-prod.ts` (production with static serving)
- Session-based authentication with cookie storage

**API Design**
- RESTful API endpoints under `/api` prefix
- Zod schema validation for all incoming request data
- Error responses follow `{ message: string }` format
- Middleware-based request logging with response time tracking

**Data Access Layer**
- Storage abstraction pattern with `IStorage` interface defining all database operations
- `DatabaseStorage` class implements interface using Drizzle ORM
- All database queries isolated within storage layer for testability and maintainability
- Relational queries using Drizzle's relations API

**Authentication Flow**
- OpenID Connect (OIDC) integration via Replit Auth
- Passport.js strategy for OIDC authentication
- Session persistence using PostgreSQL session store (connect-pg-simple)
- `isAuthenticated` middleware protects API routes
- User upsert pattern on successful authentication to sync OIDC profile data

### Data Storage

**Database System**
- PostgreSQL via Neon serverless driver with WebSocket connections
- Drizzle ORM for type-safe query building and schema management
- Connection pooling through @neondatabase/serverless

**Schema Design**

*Core Tables:*
- `users`: User profiles with display settings (liquid color, display name)
- `challenges`: Competition definitions with target amounts and duration
- `challengeParticipants`: Many-to-many relationship between users and challenges
- `drinks`: Individual drink log entries linked to users and challenges
- `sessions`: Express session storage for authentication state

*Key Design Decisions:*
- UUID primary keys using `gen_random_uuid()` for distributed ID generation
- Timestamp tracking with `createdAt` and `updatedAt` on relevant tables
- Challenge status field for lifecycle management (pending, active, completed)
- Separate target tracking at challenge level vs. aggregated drinks at user level

**Data Validation**
- Drizzle-Zod integration generates Zod schemas from Drizzle table definitions
- Schema exports: `insertChallengeSchema`, `insertDrinkSchema`, `updateUserSettingsSchema`
- Validation errors converted to user-friendly messages via zod-validation-error

### External Dependencies

**Third-Party Services**
- Replit Auth (OpenID Connect provider) for user authentication and identity management
- Neon PostgreSQL serverless database for data persistence
- Google Fonts CDN for Chakra Petch and Rajdhani font families

**Development Tools**
- Replit-specific Vite plugins:
  - `@replit/vite-plugin-cartographer`: Development source mapping
  - `@replit/vite-plugin-dev-banner`: Development environment indicator
  - `@replit/vite-plugin-runtime-error-modal`: Runtime error overlay
  - Custom `metaImagesPlugin`: Auto-configures OpenGraph image URLs for Replit deployments

**Key npm Packages**
- `drizzle-orm` + `drizzle-kit`: Database ORM and migration tooling
- `express-session`: Session middleware
- `passport`: Authentication middleware framework
- `openid-client`: OIDC client implementation
- `zod`: Runtime type validation
- `date-fns`: Date manipulation utilities
- `nanoid`: Unique ID generation
- `memoizee`: Function result caching
- `ws`: WebSocket client for Neon database connections

**API Integration Patterns**
- Fetch API with credentials included for session cookie transmission
- Centralized error handling for 401 Unauthorized responses
- Query key structure: `["/api", "path", "segments"]` for cache organization