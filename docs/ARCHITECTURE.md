# Architecture Documentation

This document provides an overview of the Project Library system architecture, design decisions, and technical implementation details.

## 📐 System Overview

Project Library is a full-stack web application built with a modern, scalable architecture that separates concerns between frontend and backend.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Next.js 15 Frontend (React 18)                │  │
│  │  - Server-Side Rendering (SSR)                        │  │
│  │  - Client-Side Rendering (CSR)                        │  │
│  │  - Static Site Generation (SSG)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST API
                        │ JSON
┌───────────────────────▼─────────────────────────────────────┐
│                    API Layer                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Fastify 4 Backend Server                      │  │
│  │  - RESTful API Endpoints                              │  │
│  │  - Authentication & Authorization                     │  │
│  │  - Request Validation (Zod)                           │  │
│  │  - Error Handling                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ Prisma ORM
┌───────────────────────▼─────────────────────────────────────┐
│                   Data Layer                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Database (SQLite/PostgreSQL)                  │  │
│  │  - Relational Data Storage                            │  │
│  │  - ACID Compliance                                    │  │
│  │  - Migrations & Schema Management                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         File Storage                                  │  │
│  │  - Project Files                                      │  │
│  │  - User Submissions                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Architecture Patterns

### 1. **Layered Architecture**

The application follows a layered architecture pattern:

```
┌─────────────────────────────────────┐
│      Presentation Layer             │  (Frontend Components)
├─────────────────────────────────────┤
│      Application Layer              │  (API Routes, Services)
├─────────────────────────────────────┤
│      Domain Layer                   │  (Business Logic)
├─────────────────────────────────────┤
│      Infrastructure Layer            │  (Database, Storage)
└─────────────────────────────────────┘
```

### 2. **Service-Oriented Architecture**

Backend services encapsulate business logic:

- **ProjectService**: Project management and queries
- **EnrollmentService**: Enrollment and progress tracking
- **UserAuthService**: Authentication and user management
- **GroupService**: Group enrollment management
- **ActivityService**: Activity tracking and analytics
- **MessageService**: Messaging system
- **AdminService**: Admin operations

### 3. **Repository Pattern**

Prisma ORM acts as the repository layer, abstracting database operations:

```typescript
// Example: Service uses Prisma repository
class ProjectService {
  async getProjectBySlug(slug: string) {
    return prisma.project.findUnique({
      where: { slug },
      include: { steps: true, tags: true }
    })
  }
}
```

## 🔧 Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── index.ts              # Application entry point
│   ├── routes/               # API route handlers
│   │   ├── projects.ts       # Project endpoints
│   │   ├── enrollments.ts   # Enrollment endpoints
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── admin.ts         # Admin endpoints
│   │   ├── submissions.ts   # Submission endpoints
│   │   ├── steps.ts         # Step endpoints
│   │   ├── messages.ts      # Message endpoints
│   │   ├── activity.ts      # Activity endpoints
│   │   └── health.ts        # Health check
│   ├── services/            # Business logic layer
│   │   ├── project.service.ts
│   │   ├── enrollment.service.ts
│   │   ├── user-auth.service.ts
│   │   ├── group.service.ts
│   │   ├── activity.service.ts
│   │   ├── message.service.ts
│   │   └── admin.service.ts
│   ├── middlewares/         # Request middleware
│   │   ├── admin.ts         # Admin authentication
│   │   ├── user.ts          # User authentication
│   │   ├── cors.ts          # CORS configuration
│   │   ├── errorHandler.ts # Error handling
│   │   └── activityTracker.ts # Activity logging
│   ├── lib/                 # Utilities and helpers
│   │   ├── prisma.ts        # Prisma client
│   │   ├── zodSchemas.ts    # Validation schemas
│   │   ├── mappers.ts       # Data mappers
│   │   └── storage.ts       # File storage utilities
│   └── scripts/             # Database scripts
│       ├── seed-admin.ts
│       └── seed.ts
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── dev.db               # SQLite database (dev)
└── storage/                 # File storage
    └── projects/
```

### Request Flow

```
1. HTTP Request
   ↓
2. CORS Middleware
   ↓
3. Authentication Middleware (if protected)
   ↓
4. Route Handler
   ↓
5. Request Validation (Zod)
   ↓
6. Service Layer (Business Logic)
   ↓
7. Database Access (Prisma)
   ↓
8. Response Serialization
   ↓
9. HTTP Response
```

### Middleware Stack

```typescript
// Middleware execution order
1. CORS Plugin
2. Error Handler
3. Route-specific middleware:
   - adminGuard (for admin routes)
   - userGuard (for user routes)
   - Activity Tracker (for tracking)
```

### Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /auth/login
       │    { phoneNumber, password }
       ▼
┌─────────────────┐
│  Auth Route     │
└──────┬──────────┘
       │ 2. Validate input
       ▼
┌─────────────────┐
│ UserAuthService │
└──────┬──────────┘
       │ 3. Verify credentials
       │ 4. Generate JWT token
       ▼
┌─────────────────┐
│   Response      │
│  { token, user }│
└─────────────────┘
```

### Authorization

- **Admin Routes**: Protected by `adminGuard` middleware
  - Requires `x-admin-key` header
  - Used for project uploads, user management

- **User Routes**: Protected by `userGuard` middleware
  - Requires JWT token in `Authorization` header
  - Used for user-specific operations

## 🎨 Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── browse/          # Browse projects
│   │   ├── project/[slug]/  # Project detail
│   │   ├── learn/[id]/      # Learning interface
│   │   ├── me/              # User dashboard
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration
│   │   └── admin/           # Admin panel
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── project-card.tsx
│   │   ├── enrollment-modal.tsx
│   │   ├── step-viewer.tsx
│   │   └── ...
│   ├── lib/                 # Utilities
│   │   ├── api.ts           # API client
│   │   ├── types.ts         # TypeScript types
│   │   ├── user-auth.tsx    # Auth context
│   │   ├── admin-auth.tsx   # Admin auth
│   │   └── utils.ts         # Helper functions
│   └── components/
│       └── providers.tsx   # React Query provider
├── public/                  # Static assets
└── next.config.js          # Next.js configuration
```

### Component Architecture

```
┌─────────────────────────────────────┐
│         Page Components              │
│  (app/*/page.tsx)                   │
└──────────────┬───────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Feature Components              │
│  (components/*.tsx)                  │
└──────────────┬───────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         UI Components                │
│  (components/ui/*.tsx)               │
└──────────────┬───────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         API Layer                    │
│  (lib/api.ts)                        │
└─────────────────────────────────────┘
```

### State Management

- **Server State**: TanStack Query (React Query)
  - Caching, synchronization, background updates
  - Automatic refetching and cache invalidation

- **Client State**: React Context + Hooks
  - User authentication state
  - UI state (modals, forms)

- **Form State**: React Hook Form
  - Form validation and submission
  - Integration with Zod schemas

### Data Fetching Strategy

```typescript
// Server Components (Next.js 15)
// Direct database access for initial load

// Client Components
// React Query for client-side data fetching
const { data, isLoading } = useQuery({
  queryKey: ['projects', filters],
  queryFn: () => api.projects.list(filters)
})
```

## 🗄️ Database Architecture

### Schema Design

The database uses a relational model with the following key entities:

```
┌─────────────┐
│   Project   │
└──────┬──────┘
       │ 1:N
       ├─────────┐
       │         │
┌──────▼──────┐ ┌▼──────┐
│    Step     │ │  Tag  │
└──────┬──────┘ └───────┘
       │ 1:N
┌──────▼──────┐
│ Checklist   │
└─────────────┘

┌─────────────┐
│  Enrollment │
└──────┬──────┘
       │ N:1
       ├─────────┐
       │         │
┌──────▼──────┐ ┌▼──────┐
│    User     │ │ Group │
└─────────────┘ └───────┘
```

### Key Models

1. **Project**: Core project entity
   - Metadata (title, description, level, guidance)
   - Relationships (steps, tags, subjects, tools)
   - Submission specifications

2. **Enrollment**: User-project relationship
   - Links user to project
   - Tracks progress and completion
   - Supports individual and group enrollments

3. **User**: User account
   - Authentication credentials
   - Profile information
   - Enrollments and messages

4. **Group**: Team enrollment
   - Links team leader to second member
   - Shared progress across enrollments

5. **Step**: Project learning steps
   - Ordered sequence
   - Checklists and resources
   - Progress tracking

### Indexing Strategy

```prisma
// Performance indexes
@@index([userId])        // User enrollments
@@index([email])         // User lookup
@@index([phoneNumber])   // User lookup
@@index([groupId])       // Group enrollments
@@index([enrollmentId])  // Activity tracking
@@index([activityType])  // Activity queries
```

## 🔐 Security Architecture

### Authentication

- **JWT Tokens**: Stateless authentication
  - 7-day expiration
  - Contains user phone number
  - Stored in HTTP-only cookies (recommended) or localStorage

- **Password Security**: bcrypt hashing
  - Salt rounds: 10
  - Never stored in plain text

### Authorization

- **Role-Based Access Control (RBAC)**:
  - Admin: Full system access
  - User: Own data access
  - Public: Read-only project browsing

### Input Validation

- **Zod Schemas**: Runtime validation
  - All API inputs validated
  - Type-safe validation
  - Detailed error messages

### CORS Configuration

- Configurable origins
- Credentials support
- Preflight handling

## 📦 Data Flow

### Project Upload Flow

```
1. Admin uploads YAML/JSON file
   ↓
2. File validation (format, size)
   ↓
3. Parse and validate schema (Zod)
   ↓
4. Transform to database format
   ↓
5. Create project with relations
   ↓
6. Return success response
```

### Enrollment Flow

```
1. User browses projects
   ↓
2. Selects project and enrolls
   ↓
3. Create enrollment record
   ↓
4. Log activity (ENROLLMENT_CREATED)
   ↓
5. Return enrollment ID
   ↓
6. User can register account (optional)
```

### Progress Tracking Flow

```
1. User completes checklist item
   ↓
2. Update EnrollmentProgress
   ↓
3. If group enrollment:
   - Sync progress to all group enrollments
   ↓
4. Log activity (CHECKLIST_COMPLETED)
   ↓
5. Return updated progress
```

## 🚀 Performance Considerations

### Backend

- **Database Queries**: Optimized with Prisma
  - Selective field inclusion
  - Proper indexing
  - Relationship eager loading

- **Caching**: Consider Redis for:
  - Project listings
  - User sessions
  - Frequently accessed data

### Frontend

- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **Static Generation**: Pre-render static pages
- **React Query**: Client-side caching and deduplication

## 🔄 Deployment Architecture

### Development

```
┌──────────────┐
│  Developer   │
└──────┬───────┘
       │
       ├─── Frontend (localhost:5000)
       └─── Backend (localhost:3000)
            └─── SQLite (file:./dev.db)
```

### Production (Recommended)

```
┌─────────────────┐
│   Load Balancer │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌───▼───┐
│Frontend│ │Frontend│ (Multiple instances)
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         │
    ┌────▼────┐
    │ Backend │ (Multiple instances)
    └────┬────┘
         │
    ┌────▼────┐
    │PostgreSQL│ (Primary + Replica)
    └─────────┘
```

## 📊 Monitoring & Logging

### Logging Strategy

- **Fastify Logger**: Built-in request logging
- **Error Logging**: Centralized error handler
- **Activity Tracking**: User activity logging

### Metrics to Monitor

- API response times
- Database query performance
- Error rates
- User activity patterns
- Enrollment statistics

## 🔮 Future Architecture Considerations

1. **Microservices**: Split into domain services
2. **Event-Driven**: Add message queue for async operations
3. **GraphQL**: Consider GraphQL API layer
4. **CDN**: Static asset delivery
5. **Search**: Full-text search (Elasticsearch)
6. **Real-time**: WebSocket support for live updates

---

For API documentation, see [API.md](./API.md)

