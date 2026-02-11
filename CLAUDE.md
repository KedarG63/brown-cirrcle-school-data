# School Assessment & CSR Management System

## Project Overview
A web-based platform for tracking underprivileged school visits, documenting requirements, and managing employee performance metrics for CSR initiatives. Optimized for GCP single-VM deployment.

## Architecture
- **Monorepo** with `backend/` and `frontend/` directories
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL (port 5000)
- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui (port 3000)
- **Storage**: GCP Cloud Storage for images
- **Auth**: JWT-based with access + refresh tokens

## Key Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server (port 5000)
npm run build        # Compile TypeScript
npm start            # Start production server
npx prisma migrate dev    # Run migrations
npx prisma db seed        # Seed database
npx prisma studio         # Open Prisma Studio
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm start            # Start production server
```

## Project Structure
```
school-data/
├── backend/
│   ├── src/
│   │   ├── config/        # DB, storage, env config
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/     # Auth, RBAC, validation, upload
│   │   ├── routes/        # Express route definitions
│   │   ├── services/      # Business logic
│   │   ├── utils/         # JWT, bcrypt, logger helpers
│   │   ├── types/         # TypeScript type definitions
│   │   └── app.ts         # Express app entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed data
│   └── package.json
├── frontend/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/               # API clients, hooks, utils
│   ├── store/             # Zustand state stores
│   ├── types/             # TypeScript types
│   └── package.json
├── .env                   # Root env (GitHub token)
├── .gitignore
├── CLAUDE.md
└── reference.md
```

## Database
- **ORM**: Prisma with PostgreSQL
- **Models**: User, School, SchoolVisit, SchoolRequirement, VisitImage
- **Enums**: UserRole (ADMIN/EMPLOYEE), VisitStatus, Priority

## Roles
- **ADMIN**: Full access - manage users, view all visits, analytics, reports
- **EMPLOYEE**: Add schools, create visits, upload photos, view own data

## API Base URL
- Development: `http://localhost:5000/api`
- API prefix: `/api`

## Conventions
- Use TypeScript strict mode
- Use Zod for input validation
- Use Prisma for all database operations
- REST API with consistent response format: `{ success: boolean, data?: any, message?: string }`
- JWT tokens in Authorization header: `Bearer <token>`
- File uploads via multipart/form-data with Multer
