# School Assessment & CSR Management System
## Detailed Development Report & Technical Specification (GCP-Optimized)

**Project Overview:** A comprehensive web-based platform for tracking underprivileged school visits, documenting requirements, and managing employee performance metrics for CSR initiatives.

**Prepared for:** Educational NGO/CSR Management  
**Date:** February 11, 2026  
**Version:** 2.0 (GCP-Optimized)

---

## Executive Summary

This document outlines the complete technical architecture, development approach, and implementation strategy for a School Assessment Management System **optimized for Google Cloud Platform (GCP)**. The platform enables field employees to document school requirements during visits while providing administrators with comprehensive oversight and performance analytics.

**Core Capabilities:**
- Role-based access control (Admin & Employee)
- Mobile-friendly school visit form with multi-category requirements
- Image capture and cloud storage integration
- Employee performance tracking and visit metrics
- Real-time dashboard and analytics
- **Super-lean GCP architecture for 2 admins + 5-10 employees**

**Key Optimization:** Entire application hosted on **single GCP e2-micro VM** (Always Free tier) with Cloud Storage for photos, targeting **₹100-500/month** operational cost.

---

## Table of Contents

1. System Architecture
2. Technology Stack
3. Database Design
4. Feature Specifications
5. Project Structure
6. API Endpoints
7. Authentication & Authorization
8. Cloud Storage Integration (GCP)
9. Deployment Strategy (GCP-Optimized)
10. Development Roadmap
11. Security Considerations
12. Cost Estimates (GCP)

---

## 1. System Architecture

### High-Level Architecture (GCP Single-VM)

┌──────────────────────────────────────────────────────────────┐
│              GCP e2-micro VM (Always Free)                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Node.js/Express Backend API (Port 5000)               │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (SSR/Static) (Port 3000)             │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database (Local)                           │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS (Nginx + Let's Encrypt SSL)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│         GCP Cloud Storage Bucket (Photos)                    │
│         5GB Free/month → ₹0-200/month                        │
└──────────────────────────────────────────────────────────────┘

### Architecture Pattern: **Single-VM Three-Tier**

1. **Presentation Layer** (Frontend on VM)
   - Next.js 14 with App Router
   - React 18 with Server Components
   - Tailwind CSS for styling
   - React Query for state management

2. **Application Layer** (Backend on VM)
   - Node.js with Express.js
   - RESTful API design
   - JWT-based authentication
   - Middleware for authorization

3. **Data Layer** (PostgreSQL on VM + GCP Storage)
   - PostgreSQL 15.x for relational data (VM-hosted)
   - GCP Cloud Storage for media files
   - PM2 for process management

**Scaling Path:** Migrate to Cloud SQL and larger VM instances when traffic grows beyond 50+ daily visits.

---

## 2. Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.x | React framework with SSR/SSG |
| **React** | 18.x | UI component library |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **React Hook Form** | 7.x | Form validation & management |
| **React Query** | 5.x | Server state management |
| **Axios** | 1.x | HTTP client |
| **Zustand** | 4.x | Client state management |
| **Shadcn UI** | Latest | Component library |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20.x LTS | Runtime environment |
| **Express.js** | 4.x | Web framework |
| **TypeScript** | 5.x | Type safety |
| **PostgreSQL** | 15.x | Primary database (VM-hosted) |
| **Prisma** | 5.x | ORM & database toolkit |
| **JWT** | 9.x | Authentication tokens |
| **Bcrypt** | 5.x | Password hashing |
| **Multer** | 1.x | File upload handling |
| **@google-cloud/storage** | 7.x | GCP Cloud Storage SDK |
| **Joi/Zod** | Latest | Input validation |

### Cloud & DevOps (GCP-Focused)

| Service | Purpose |
|---------|---------|
| **GCP Compute Engine (e2-micro)** | Single VM hosting (Always Free) |
| **GCP Cloud Storage** | Image storage & CDN |
| **GCP Cloud SQL** | Managed PostgreSQL (future scaling) |
| **Nginx** | Reverse proxy & SSL termination |
| **PM2** | Node.js process manager |
| **Let's Encrypt/Certbot** | Free SSL certificates |
| **GitHub Actions** | CI/CD pipeline |
| **Docker** | Containerization (optional) |

### Development Tools

- **Git** for version control
- **Postman** for API testing
- **pgAdmin** / **DBeaver** for database management
- **VS Code** as IDE
- **ESLint** & **Prettier** for code quality
- **gcloud CLI** for GCP management

---

## 3. Database Design

### Entity Relationship Diagram

┌──────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    Users     │       │     Schools      │       │  SchoolVisits   │
├──────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)      │       │ id (PK)          │       │ id (PK)         │
│ email        │       │ name             │       │ school_id (FK)  │
│ password     │       │ location         │       │ employee_id (FK)│
│ name         │       │ address          │       │ visit_date      │
│ role (enum)  │───┐   │ contact_person   │───┐   │ status          │
│ phone        │   │   │ contact_phone    │   │   │ created_at      │
│ is_active    │   │   │ district         │   │   │ updated_at      │
│ created_at   │   │   │ state            │   │   └─────────────────┘
│ updated_at   │   │   │ pincode          │   │            │
└──────────────┘   │   │ created_by (FK)  │   │            │
                   │   │ created_at       │   │            │
                   │   │ updated_at       │   │            │
                   │   └──────────────────┘   │            │
                   │                          │            │
                   └──────────────────────────┘            │
                                                           │
┌────────────────────────────────────────────────────────┘
│
▼
┌──────────────────────────────┐       ┌─────────────────────┐
│   SchoolRequirements         │       │   VisitImages       │
├──────────────────────────────┤       ├─────────────────────┤
│ id (PK)                      │       │ id (PK)             │
│ visit_id (FK)                │       │ visit_id (FK)       │
│                              │       │ image_url           │
│ CORE REQUIREMENTS:           │       │ image_key           │
│ - books_needed (boolean)     │       │ image_type          │
│ - books_quantity             │       │ description         │
│ - uniforms_needed            │       │ uploaded_at         │
│ - uniforms_quantity          │       └─────────────────────┘
│ - furniture_needed           │
│ - furniture_details (text)   │
│ - painting_needed            │
│ - painting_area              │
│ - other_core_requirements    │
│                              │
│ DEVELOPMENT REQUIREMENTS:    │
│ - tv_needed                  │
│ - tv_quantity                │
│ - wifi_needed                │
│ - wifi_details               │
│ - computers_needed           │
│ - computers_quantity         │
│ - other_dev_requirements     │
│                              │
│ notes (text)                 │
│ estimated_budget             │
│ priority (enum)              │
│ created_at                   │
│ updated_at                   │
└──────────────────────────────┘

### Database Schema (Prisma)

// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  EMPLOYEE
}

enum VisitStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  REVIEWED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  role          UserRole @default(EMPLOYEE)
  phone         String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  schoolsCreated School[] @relation("SchoolCreatedBy")
  visits         SchoolVisit[]
  
  @@map("users")
}

model School {
  id             String   @id @default(uuid())
  name           String
  location       String
  address        String?
  contactPerson  String?
  contactPhone   String?
  district       String?
  state          String?
  pincode        String?
  latitude       Float?
  longitude      Float?
  createdById    String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  createdBy      User     @relation("SchoolCreatedBy", fields: [createdById], references: [id])
  visits         SchoolVisit[]
  
  @@map("schools")
  @@index([name])
  @@index([location])
}

model SchoolVisit {
  id             String       @id @default(uuid())
  schoolId       String
  employeeId     String
  visitDate      DateTime
  status         VisitStatus  @default(PENDING)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  // Relations
  school         School       @relation(fields: [schoolId], references: [id])
  employee       User         @relation(fields: [employeeId], references: [id])
  requirements   SchoolRequirement?
  images         VisitImage[]
  
  @@map("school_visits")
  @@index([employeeId])
  @@index([visitDate])
}

model SchoolRequirement {
  id                      String   @id @default(uuid())
  visitId                 String   @unique
  
  // Core Requirements
  booksNeeded             Boolean  @default(false)
  booksQuantity           Int?
  uniformsNeeded          Boolean  @default(false)
  uniformsQuantity        Int?
  furnitureNeeded         Boolean  @default(false)
  furnitureDetails        String?
  paintingNeeded          Boolean  @default(false)
  paintingArea            String?
  otherCoreRequirements   String?
  
  // Development Requirements
  tvNeeded                Boolean  @default(false)
  tvQuantity              Int?
  wifiNeeded              Boolean  @default(false)
  wifiDetails             String?
  computersNeeded         Boolean  @default(false)
  computersQuantity       Int?
  otherDevRequirements    String?
  
  // Additional Fields
  notes                   String?
  estimatedBudget         Float?
  priority                Priority @default(MEDIUM)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  // Relations
  visit                   SchoolVisit @relation(fields: [visitId], references: [id], onDelete: Cascade)
  
  @@map("school_requirements")
}

model VisitImage {
  id             String   @id @default(uuid())
  visitId        String
  imageUrl       String
  imageKey       String
  imageType      String?  // 'school_exterior', 'classroom', 'facilities', etc.
  description    String?
  uploadedAt     DateTime @default(now())
  
  // Relations
  visit          SchoolVisit @relation(fields: [visitId], references: [id], onDelete: Cascade)
  
  @@map("visit_images")
  @@index([visitId])
}

---

## 4. Feature Specifications

### 4.1 Authentication & User Management

**Features:**
- Email/password authentication
- JWT token-based sessions
- Password encryption with bcrypt
- Role-based access control (RBAC)
- User profile management

**User Roles:**

| Role | Permissions |
|------|-------------|
| **Admin** | - Full system access<br>- User management<br>- View all visits<br>- Performance dashboard<br>- School management<br>- Reports & analytics |
| **Employee** | - Add/edit schools<br>- Create visit records<br>- Upload photos<br>- View own visits<br>- Basic profile edit |

### 4.2 School Management

**Features:**
- Add new school/education center
- Edit school details
- Search & filter schools
- View school visit history
- Location-based mapping

**School Information Fields:**
- School name (required)
- Location/address (required)
- Contact person name
- Contact phone number
- District & State
- PIN code
- GPS coordinates (optional)

### 4.3 Visit Management (Employee Interface)

**Daily Visit Workflow:**

1. **Select School** → Choose from existing schools or add new
2. **Fill Assessment Form** → Document requirements
3. **Upload Photos** → Multiple images per visit
4. **Submit** → Save to cloud with timestamp

**Requirements Form Structure:**

**Section A: Core Requirements**
- ☑ School books (checkbox + quantity)
- ☑ Uniforms (checkbox + quantity)
- ☑ Furniture (checkbox + details text area)
- ☑ Wall painting (checkbox + area details)
- ☑ Other core needs (text field)

**Section B: Development Requirements**
- ☑ TV/Display (checkbox + quantity)
- ☑ WiFi connectivity (checkbox + details)
- ☑ Computers/tablets (checkbox + quantity)
- ☑ Other development needs (text field)

**Section C: Additional Information**
- Notes/observations (text area)
- Estimated budget (optional)
- Priority level (Low/Medium/High/Urgent)

**Image Upload:**
- Multiple image support (up to 10 per visit)
- Image categories: Exterior, Classroom, Facilities, Students, Others
- Automatic compression & optimization
- Progress indicator for uploads

### 4.4 Admin Dashboard

**Dashboard Components:**

**1. Overview Cards:**
- Total schools registered
- Total visits completed (today/week/month)
- Active employees
- Pending reviews

**2. Employee Performance Table:**
- Employee name
- Total visits (all-time)
- Visits this month
- Visits today
- Last visit date
- Performance trend

**3. Recent Visits Feed:**
- Visit timestamp
- Employee name
- School name
- Quick preview button

**4. Analytics Charts:**
- Visits per day (line chart)
- Visits by employee (bar chart)
- Requirements distribution (pie chart)
- Geographic distribution (map)

**5. Search & Filters:**
- Filter by employee
- Filter by date range
- Filter by school
- Filter by priority

### 4.5 Reports & Analytics

**Report Types:**
1. **Employee Performance Report**
   - Visits per employee
   - Average visits per day
   - Productivity trends

2. **School Requirements Report**
   - Aggregated needs by category
   - Budget estimates
   - Priority distribution

3. **Visit History Report**
   - Date-wise visit log
   - School-wise visit count
   - Export to Excel/PDF

---

## 5. Project Structure

### Frontend Structure (Next.js)

school-assessment-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (employee)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── schools/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── visits/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── employees/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── forms/
│   │   ├── SchoolForm.tsx
│   │   ├── VisitForm.tsx
│   │   ├── RequirementsForm.tsx
│   │   └── ImageUpload.tsx
│   ├── dashboard/
│   │   ├── PerformanceCard.tsx
│   │   ├── VisitChart.tsx
│   │   └── RecentVisits.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── ProtectedRoute.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── schools.ts
│   │   ├── visits.ts
│   │   └── users.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSchools.ts
│   │   └── useVisits.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── helpers.ts
│   └── constants/
│       └── index.ts
├── store/
│   ├── authStore.ts
│   └── uiStore.ts
├── types/
│   ├── user.ts
│   ├── school.ts
│   └── visit.ts
├── public/
│   ├── images/
│   └── icons/
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json

### Backend Structure (Node.js/Express)

school-assessment-backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── cloudStorage.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── schoolController.ts
│   │   ├── visitController.ts
│   │   └── analyticsController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rbac.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── upload.ts
│   ├── models/
│   │   └── (Using Prisma - schema in prisma/schema.prisma)
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── school.routes.ts
│   │   ├── visit.routes.ts
│   │   └── analytics.routes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── schoolService.ts
│   │   ├── visitService.ts
│   │   ├── storageService.ts
│   │   └── analyticsService.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── bcrypt.ts
│   │   ├── validators.ts
│   │   └── logger.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   └── index.ts
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── unit/
│   └── integration/
├── .env
├── .env.example
├── ecosystem.config.js  # PM2 configuration
├── tsconfig.json
├── package.json
└── README.md

---

## 6. API Endpoints

### Authentication Endpoints

POST   /api/auth/register          # Register new user (Admin only)
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
GET    /api/auth/me                # Get current user
POST   /api/auth/refresh           # Refresh access token
POST   /api/auth/forgot-password   # Forgot password
POST   /api/auth/reset-password    # Reset password

### User Management Endpoints

GET    /api/users                  # Get all users (Admin only)
GET    /api/users/:id              # Get user by ID
PUT    /api/users/:id              # Update user
DELETE /api/users/:id              # Delete user (Admin only)
PUT    /api/users/:id/toggle       # Activate/Deactivate user (Admin only)

### School Endpoints

GET    /api/schools                # Get all schools (with pagination)
POST   /api/schools                # Create new school
GET    /api/schools/:id            # Get school by ID
PUT    /api/schools/:id            # Update school
DELETE /api/schools/:id            # Delete school
GET    /api/schools/search         # Search schools (by name/location)

### Visit Endpoints

GET    /api/visits                 # Get visits (filtered by role)
POST   /api/visits                 # Create new visit
GET    /api/visits/:id             # Get visit by ID
PUT    /api/visits/:id             # Update visit
DELETE /api/visits/:id             # Delete visit
GET    /api/visits/employee/:id    # Get visits by employee
GET    /api/visits/school/:id      # Get visits by school
POST   /api/visits/:id/images      # Upload images for visit
DELETE /api/visits/images/:imageId # Delete visit image

### Analytics Endpoints

GET    /api/analytics/dashboard          # Get dashboard stats
GET    /api/analytics/employee-performance # Get employee performance metrics
GET    /api/analytics/visits-by-date     # Get visits grouped by date
GET    /api/analytics/requirements       # Get aggregated requirements
GET    /api/analytics/export             # Export data (Excel/PDF)

### Example API Response Formats

**Login Response:**
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "employee@example.com",
      "name": "John Doe",
      "role": "EMPLOYEE"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}

**Visit List Response:**
{
  "success": true,
  "data": {
    "visits": [
      {
        "id": "uuid",
        "visitDate": "2026-02-11T10:30:00Z",
        "status": "COMPLETED",
        "school": {
          "id": "uuid",
          "name": "Government Primary School",
          "location": "Village XYZ"
        },
        "employee": {
          "id": "uuid",
          "name": "John Doe"
        },
        "requirements": {
          "booksNeeded": true,
          "booksQuantity": 50,
          "computersNeeded": true,
          "computersQuantity": 10
        },
        "imageCount": 5
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "perPage": 10,
      "totalPages": 15
    }
  }
}

---

## 7. Authentication & Authorization

### JWT Token Strategy

**Token Structure:**
// Access Token (expires in 1 hour)
{
  userId: "uuid",
  email: "user@example.com",
  role: "EMPLOYEE",
  iat: 1234567890,
  exp: 1234571490
}

// Refresh Token (expires in 7 days)
{
  userId: "uuid",
  tokenVersion: 1,
  iat: 1234567890,
  exp: 1235172690
}

### Middleware Implementation

**Authentication Middleware:**
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

**Authorization Middleware (RBAC):**
// src/middleware/rbac.ts
import { Request, Response, NextFunction } from 'express';

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

**Usage in Routes:**
// Protected route example
router.get(
  '/api/analytics/dashboard',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getDashboard
);

router.post(
  '/api/visits',
  authenticate,
  authorize('ADMIN', 'EMPLOYEE'),
  visitController.createVisit
);

---

## 8. Cloud Storage Integration (GCP)

### GCP Cloud Storage Implementation

**Pros:**
- 5GB free storage per month (Always Free)
- Pay-per-use pricing beyond free tier
- Automatic tiering and lifecycle management
- Built-in CDN capabilities
- Low latency in India (asia-south1 region)

**Implementation:**
// src/services/storageService.ts
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_PATH
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);

export const uploadToGCS = async (
  file: Express.Multer.File,
  folder: string
): Promise<{ url: string; key: string }> => {
  const fileName = `${folder}/${uuidv4()}-${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  await fileUpload.save(file.buffer, {
    metadata: {
      contentType: file.mimetype
    },
    public: true
  });

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

  return { url: publicUrl, key: fileName };
};

export const deleteFromGCS = async (fileKey: string): Promise<void> => {
  await bucket.file(fileKey).delete();
};

export const getSignedUrl = async (
  fileKey: string,
  expiresIn: number = 3600
): Promise<string> => {
  const [url] = await bucket.file(fileKey).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresIn * 1000
  });
  return url;
};

### File Upload Middleware

// src/middleware/upload.ts
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per file
  }
});

// For multiple files
export const uploadMultiple = upload.array('images', 10);

### Upload Controller

// src/controllers/visitController.ts
import { uploadToGCS } from '../services/storageService';
import { prisma } from '../config/database';

export const uploadVisitImages = async (req: Request, res: Response) => {
  try {
    const { visitId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Upload each image to GCS
    const uploadPromises = files.map(file => 
      uploadToGCS(file, `visits/${visitId}`)
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Save image records to database
    const imageRecords = await prisma.visitImage.createMany({
      data: uploadResults.map((result, index) => ({
        visitId: visitId,
        imageUrl: result.url,
        imageKey: result.key,
        imageType: req.body.imageTypes?.[index] || 'general'
      }))
    });

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: { count: imageRecords.count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

---

## 9. Deployment Strategy (GCP-Optimized)

### Super-Lean Single-VM Architecture

**Target:** 2 admins + 5-10 employees, ~50 school visits/month

**Infrastructure:**
- **1× GCP e2-micro VM** (Always Free: 0.25 vCPU, 1GB RAM, 30GB disk)
- **GCP Cloud Storage** (5GB free/month for photos)
- **Nginx** reverse proxy + Let's Encrypt SSL
- **PM2** for Node.js process management
- **PostgreSQL 15** on VM (local database)

### Deployment Architecture

┌──────────────────────────────────────────────────────────────┐
│                 GCP e2-micro VM (Mumbai Region)              │
│  asia-south1-a / asia-south1-b                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Nginx (Port 80/443)                                   │ │
│  │  - Reverse Proxy                                       │ │
│  │  - Let's Encrypt SSL                                   │ │
│  │  - Static file serving                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                      │                                       │
│                      ├──► Backend API (Port 5000)            │
│                      │    Node.js + Express (PM2)            │
│                      │                                       │
│                      └──► Frontend (Port 3000)               │
│                           Next.js SSR (PM2)                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL 15 (Port 5432)                             │ │
│  │  - Schools, Users, Visits data                         │ │
│  │  - Image metadata                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌──────────────────────────────────────────────────────────────┐
│         GCP Cloud Storage (asia-south1)                      │
│         - Photos/Images                                      │
│         - Public bucket with signed URLs                     │
└──────────────────────────────────────────────────────────────┘

### Step-by-Step Deployment Guide

#### Step 1: GCP Project Setup

# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login and create project
gcloud auth login
gcloud projects create school-assessment-2026 --name="School Assessment"
gcloud config set project school-assessment-2026

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable iam.googleapis.com

#### Step 2: Create e2-micro VM (Always Free)

# Create VM in Mumbai region (asia-south1)
gcloud compute instances create school-vm \
  --zone=asia-south1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --tags=http-server,https-server \
  --metadata=startup-script='#!/bin/bash
apt-get update
apt-get install -y git'

# Create firewall rules
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 \
  --target-tags=http-server

gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 \
  --target-tags=https-server

#### Step 3: VM Setup & Software Installation

# SSH into VM
gcloud compute ssh school-vm --zone=asia-south1-a

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Install PM2 globally
sudo npm install -g pm2 prisma

# Install build tools
sudo apt install -y build-essential

#### Step 4: PostgreSQL Configuration

# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE school_assessment;
CREATE USER school_user WITH PASSWORD 'your-secure-password-here';
GRANT ALL PRIVILEGES ON DATABASE school_assessment TO school_user;
\q

# Configure PostgreSQL for local connections
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add line: local   school_assessment   school_user   md5

# Restart PostgreSQL
sudo systemctl restart postgresql

#### Step 5: GCP Cloud Storage Setup

# Create storage bucket
gsutil mb -l asia-south1 gs://school-assessment-photos/

# Create service account
gcloud iam service-accounts create school-storage-sa \
  --display-name="School Assessment Storage Service Account"

# Grant storage permissions
gsutil iam ch serviceAccount:school-storage-sa@school-assessment-2026.iam.gserviceaccount.com:objectAdmin \
  gs://school-assessment-photos/

# Create and download service account key
gcloud iam service-accounts keys create ~/gcp-storage-key.json \
  --iam-account=school-storage-sa@school-assessment-2026.iam.gserviceaccount.com

# Move key to secure location on VM
sudo mkdir -p /opt/credentials
sudo mv ~/gcp-storage-key.json /opt/credentials/
sudo chmod 600 /opt/credentials/gcp-storage-key.json

#### Step 6: Deploy Backend Application

# Create application directory
sudo mkdir -p /opt/school-backend
sudo chown $USER:$USER /opt/school-backend
cd /opt/school-backend

# Clone repository
git clone <your-backend-repo-url> .

# Install dependencies
npm ci --production

# Create .env file
nano .env

# Add environment variables:
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://school_user:your-secure-password-here@localhost:5432/school_assessment"

JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-token-secret-minimum-32-characters
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

GCP_PROJECT_ID=school-assessment-2026
GCP_BUCKET_NAME=school-assessment-photos
GCP_SERVICE_ACCOUNT_PATH=/opt/credentials/gcp-storage-key.json

FRONTEND_URL=https://yourdomain.com

# Run Prisma migrations
npx prisma migrate deploy

# Seed database with admin user
npx prisma db seed

# Build TypeScript
npm run build

#### Step 7: Deploy Frontend Application

# Create frontend directory
sudo mkdir -p /opt/school-frontend
sudo chown $USER:$USER /opt/school-frontend
cd /opt/school-frontend

# Clone repository
git clone <your-frontend-repo-url> .

# Install dependencies
npm ci --production

# Create .env.local
nano .env.local

# Add environment variables:
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Build Next.js
npm run build

#### Step 8: PM2 Process Management

# Create PM2 ecosystem file
cd /opt
nano ecosystem.config.js

# Add configuration:
module.exports = {
  apps: [
    {
      name: 'school-backend',
      cwd: '/opt/school-backend',
      script: 'dist/app.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/pm2/school-backend-error.log',
      out_file: '/var/log/pm2/school-backend-out.log',
      time: true
    },
    {
      name: 'school-frontend',
      cwd: '/opt/school-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/school-frontend-error.log',
      out_file: '/var/log/pm2/school-frontend-out.log',
      time: true
    }
  ]
};

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start applications with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command that PM2 outputs (sudo env PATH=...)

# Check status
pm2 status
pm2 logs

#### Step 9: Nginx Configuration

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/school-assessment

# Add configuration:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # API Backend
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}

# Enable site
sudo ln -s /etc/nginx/sites-available/school-assessment /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

#### Step 10: SSL Certificate (Let's Encrypt)

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts and select redirect HTTP to HTTPS

# Test auto-renewal
sudo certbot renew --dry-run

# Certificate auto-renews via systemd timer
sudo systemctl status certbot.timer

### CI/CD Pipeline (GitHub Actions)

# .github/workflows/deploy.yml
name: Deploy to GCP VM

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup gcloud CLI
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: school-assessment-2026
      
      - name: Deploy Backend
        run: |
          gcloud compute ssh school-vm --zone=asia-south1-a --command="
            cd /opt/school-backend &&
            git pull origin main &&
            npm ci --production &&
            npx prisma migrate deploy &&
            npm run build &&
            pm2 restart school-backend
          "
      
      - name: Deploy Frontend
        run: |
          gcloud compute ssh school-vm --zone=asia-south1-a --command="
            cd /opt/school-frontend &&
            git pull origin main &&
            npm ci --production &&
            npm run build &&
            pm2 restart school-frontend
          "

### Monitoring & Maintenance

# View application logs
pm2 logs school-backend
pm2 logs school-frontend

# Monitor system resources
pm2 monit

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Disk usage
df -h

# Memory usage
free -m

# Database backup (automated with cron)
sudo crontab -e
# Add: 0 2 * * * /usr/bin/pg_dump -U school_user school_assessment > /opt/backups/db-$(date +\%Y\%m\%d).sql

### Scaling Path

**When to Scale:**
- VM CPU consistently > 80%
- Memory usage > 90%
- More than 100 visits/day
- Database queries slow (> 500ms average)

**Scaling Options:**
1. **Vertical Scaling:** Upgrade to e2-small (2 vCPU, 2GB RAM) - ~₹400/month
2. **Database Migration:** Move to Cloud SQL PostgreSQL - ~₹1,200+/month
3. **Load Balancing:** Add second VM + Cloud Load Balancer
4. **CDN:** Enable Cloud CDN for static assets

---

## 10. Development Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Week 1:**
- [ ] Project setup (frontend + backend repositories)
- [ ] Database schema design and Prisma setup
- [ ] Basic authentication system (login/register)
- [ ] User model and JWT implementation
- [ ] Frontend routing structure

**Week 2:**
- [ ] Role-based access control implementation
- [ ] Admin and Employee layouts
- [ ] Basic UI component library setup
- [ ] API client configuration
- [ ] Error handling and validation

### Phase 2: Core Features (Weeks 3-4)

**Week 3:**
- [ ] School management (CRUD operations)
- [ ] School listing and search functionality
- [ ] Visit creation workflow
- [ ] Requirements form implementation
- [ ] Basic file upload setup

**Week 4:**
- [ ] GCP Cloud Storage integration
- [ ] Multiple image upload functionality
- [ ] Visit listing and filtering
- [ ] Employee visit history
- [ ] Image preview and management

### Phase 3: Admin Features (Weeks 5-6)

**Week 5:**
- [ ] Admin dashboard design
- [ ] Employee performance metrics
- [ ] Visit statistics and analytics
- [ ] User management interface
- [ ] Data visualization (charts)

**Week 6:**
- [ ] Reports generation
- [ ] Export functionality (Excel/PDF)
- [ ] Advanced search and filters
- [ ] Date range selection
- [ ] Performance optimization

### Phase 4: Polish & Testing (Weeks 7-8)

**Week 7:**
- [ ] Mobile responsiveness
- [ ] Loading states and error handling
- [ ] Form validation improvements
- [ ] User feedback notifications
- [ ] Security audit

**Week 8:**
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Documentation
- [ ] Deployment preparation

### Phase 5: Deployment & Launch (Week 9)

- [ ] GCP project setup
- [ ] VM provisioning and configuration
- [ ] Database migration to production
- [ ] Cloud Storage bucket setup
- [ ] Nginx and SSL configuration
- [ ] PM2 process management setup
- [ ] Monitoring and logging setup
- [ ] User acceptance testing
- [ ] Launch!

---

## 11. Security Considerations

### Authentication Security

1. **Password Security**
   - Minimum 8 characters requirement
   - Bcrypt hashing (salt rounds: 10)
   - Password complexity validation
   - Password reset tokens (expires in 1 hour)

2. **Token Management**
   - Short-lived access tokens (1 hour)
   - Refresh token rotation
   - Token blacklisting on logout
   - Secure HTTP-only cookies

3. **Session Security**
   - CSRF protection
   - Rate limiting on auth endpoints
   - Account lockout after failed attempts
   - IP-based suspicious activity detection

### API Security

1. **Input Validation**
   - Joi/Zod schema validation
   - SQL injection prevention (Prisma ORM)
   - XSS attack prevention
   - File type validation

2. **Rate Limiting**
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', apiLimiter);

3. **CORS Configuration**
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

### File Upload Security

1. **File Validation**
   - Whitelist allowed MIME types
   - File size limits (5MB per image)
   - Virus scanning (ClamAV integration)
   - Rename files to prevent path traversal

2. **Storage Security**
   - Private GCS buckets with signed URLs
   - Automatic image optimization
   - Backup and redundancy
   - Access control via IAM

### Database Security

1. **Connection Security**
   - Local Unix socket connection (VM-hosted)
   - Password-protected access
   - Regular backups (automated daily)
   - Connection pooling limits

2. **Data Protection**
   - Sensitive data encryption at rest
   - PII data handling compliance
   - Audit logging
   - Regular security updates

### GCP-Specific Security

1. **VM Security**
   - Firewall rules (only ports 80, 443, 22)
   - SSH key-based authentication only
   - Automatic security updates enabled
   - Regular OS patching

2. **Service Account Security**
   - Minimal permissions (storage.objectAdmin only)
   - Key rotation every 90 days
   - Secure key storage on VM
   - IAM audit logging

### Environment Variables

# Backend .env (GCP VM)
NODE_ENV=production
PORT=5000

# Database (Local PostgreSQL)
DATABASE_URL="postgresql://school_user:secure-password@localhost:5432/school_assessment"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-token-secret-minimum-32-characters
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# GCP Cloud Storage
GCP_PROJECT_ID=school-assessment-2026
GCP_BUCKET_NAME=school-assessment-photos
GCP_SERVICE_ACCOUNT_PATH=/opt/credentials/gcp-storage-key.json

# Application
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info

# Email (Optional - for future)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

---

## 12. Cost Estimates (GCP-Optimized)

### Development Costs

| Item | Cost (INR) | Notes |
|------|-----------|-------|
| **Frontend Development** | ₹40,000 - ₹60,000 | Next.js, React, UI/UX |
| **Backend Development** | ₹50,000 - ₹70,000 | Node.js, Express, APIs |
| **Database Design** | ₹15,000 - ₹20,000 | Schema, optimization |
| **GCP Integration** | ₹8,000 - ₹12,000 | Cloud Storage, VM setup |
| **Testing & QA** | ₹15,000 - ₹20,000 | Unit, integration tests |
| **Documentation** | ₹5,000 - ₹10,000 | Technical docs |
| **Project Management** | ₹10,000 - ₹15,000 | Coordination, meetings |
| **Contingency (20%)** | ₹29,000 - ₹41,000 | Buffer for changes |
| **TOTAL DEVELOPMENT** | **₹172,000 - ₹248,000** | **2-3 months** |

### Monthly Hosting Costs (GCP Super-Lean)

**For 2 Admins + 5-10 Employees, ~50 visits/month:**

| Service | Provider | Cost (INR/month) | Notes |
|---------|----------|------------------|-------|
| **Compute (VM)** | GCP e2-micro | **₹0** | Always Free tier |
| **Storage (Photos)** | Cloud Storage | **₹0 - ₹200** | 5GB free, then ~₹2/GB |
| **Domain** | Google Domains | ₹100 - ₹150 | .com/.in domain |
| **SSL Certificate** | Let's Encrypt | **₹0** | Free SSL |
| **Monitoring** | GCP Logging | **₹0 - ₹50** | Free tier covers small apps |
| **Backup Storage** | Cloud Storage | ₹50 - ₹100 | Database backups |
| **Email (Optional)** | SendGrid/Gmail | **₹0** | Free tier |
| **Total Monthly** | | **₹150 - ₹500** | |

**Annual Cost: ₹1,800 - ₹6,000**

### Cost Breakdown by Usage

**Low Usage (10-20 visits/month):**
- VM: ₹0 (Always Free)
- Storage: ₹0 (within 5GB)
- Domain: ₹100
- **Total: ~₹100/month**

**Medium Usage (50-100 visits/month):**
- VM: ₹0 (Always Free)
- Storage: ₹150 (10-15GB)
- Domain: ₹100
- Backups: ₹50
- **Total: ~₹300/month**

**High Usage (200+ visits/month):**
- VM: ₹0 (Always Free, but may need upgrade)
- Storage: ₹400 (25-30GB)
- Domain: ₹100
- Backups: ₹100
- **Total: ~₹600/month**
- **Note:** Consider upgrading to e2-small at this point

### Comparison: GCP vs AWS vs Azure (Monthly)

| Service | GCP (Optimized) | AWS (Original) | Azure |
|---------|----------------|----------------|-------|
| Compute | ₹0 (e2-micro free) | ₹800-1,600 (EC2) | ₹600-1,200 (B1s) |
| Database | ₹0 (VM-hosted) | ₹1,200-2,000 (RDS) | ₹1,000-1,800 (DB) |
| Storage | ₹0-200 (5GB free) | ₹400-800 (S3) | ₹300-600 (Blob) |
| **Total** | **₹150-500** | **₹7,300-10,200** | **₹5,500-8,000** |
| **Savings** | **Baseline** | **+₹7,150 more** | **+₹5,350 more** |

**GCP saves 95% vs AWS, 92% vs Azure for this use case.**

### Scaling Costs (When to Upgrade)

**Scenario: Growth to 500 visits/month, 25 employees**

| Service | Cost (INR/month) | Notes |
|---------|------------------|-------|
| **VM Upgrade** | ₹400 | e2-small (2 vCPU, 2GB RAM) |
| **Cloud SQL** | ₹1,200 - ₹2,000 | Managed PostgreSQL db-f1-micro |
| **Storage** | ₹600 - ₹800 | 40-50GB photos |
| **Load Balancer** | ₹600 | If adding second VM |
| **Monitoring** | ₹200 - ₹400 | Enhanced logging |
| **Backup** | ₹200 | Automated snapshots |
| **Total** | **₹3,200 - ₹4,400** | |

**Still significantly cheaper than AWS/Azure equivalent (~₹8,000-12,000)**

### Cost Optimization Tips

1. **Leverage Always Free Tier**
   - Use e2-micro VM (free forever, not just 12 months)
   - 5GB Cloud Storage free monthly
   - 1GB network egress free (India regions)

2. **Optimize Storage**
   - Compress images before upload (target 200-500KB)
   - Use WebP format for better compression
   - Implement lifecycle policies (archive old images after 1 year)
   - Enable GCS automatic object lifecycle management

3. **Database Optimization**
   - Regular VACUUM and ANALYZE
   - Proper indexing on frequently queried columns
   - Connection pooling (max 10 connections)
   - Archive old visit records after 2 years

4. **Monitoring & Alerts**
   - Set up budget alerts at ₹500/month
   - Monitor storage usage weekly
   - Track VM CPU/memory usage
   - Alert on abnormal traffic patterns

5. **Backup Strategy**
   - Daily automated PostgreSQL dumps
   - Retain last 7 days locally, 30 days in Cloud Storage
   - Estimated backup size: 50-100MB/day
   - Monthly backup cost: ~₹50

### Yearly Maintenance (Post-Launch)

| Item | Cost (INR/year) |
|------|-----------------|
| **Hosting & Infrastructure** | ₹1,800 - ₹6,000 |
| **Domain Renewal** | ₹1,200 |
| **Bug Fixes & Updates** | ₹20,000 - ₹40,000 |
| **Feature Enhancements** | ₹30,000 - ₹60,000 |
| **Security Updates** | ₹10,000 - ₹20,000 |
| **Support** | ₹15,000 - ₹30,000 |
| **Total Yearly** | **₹78,000 - ₹157,200** |

**Savings vs AWS/Azure:**
- **AWS equivalent:** ₹192,600 - ₹317,400/year
- **GCP savings:** ₹114,600 - ₹160,200/year (60-65% less)

---

## Appendix A: Sample Code Snippets

### A.1 Visit Form Component (React)

// components/forms/VisitForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const visitSchema = z.object({
  schoolId: z.string().min(1, 'School is required'),
  visitDate: z.date(),
  
  // Core Requirements
  booksNeeded: z.boolean(),
  booksQuantity: z.number().optional(),
  uniformsNeeded: z.boolean(),
  uniformsQuantity: z.number().optional(),
  furnitureNeeded: z.boolean(),
  furnitureDetails: z.string().optional(),
  paintingNeeded: z.boolean(),
  paintingArea: z.string().optional(),
  
  // Development Requirements
  tvNeeded: z.boolean(),
  tvQuantity: z.number().optional(),
  wifiNeeded: z.boolean(),
  wifiDetails: z.string().optional(),
  computersNeeded: z.boolean(),
  computersQuantity: z.number().optional(),
  
  // Additional
  notes: z.string().optional(),
  estimatedBudget: z.number().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
});

export const VisitForm: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(visitSchema)
  });

  const booksNeeded = watch('booksNeeded');
  const uniformsNeeded = watch('uniformsNeeded');

  const onSubmit = async (data: any) => {
    try {
      // Submit form data
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Core Requirements Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Core Requirements</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              {...register('booksNeeded')}
              className="w-4 h-4"
            />
            <label>School Books Needed</label>
          </div>
          
          {booksNeeded && (
            <input
              type="number"
              {...register('booksQuantity')}
              placeholder="Quantity"
              className="ml-8 px-3 py-2 border rounded"
            />
          )}

          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              {...register('uniformsNeeded')}
              className="w-4 h-4"
            />
            <label>Uniforms Needed</label>
          </div>
          
          {uniformsNeeded && (
            <input
              type="number"
              {...register('uniformsQuantity')}
              placeholder="Quantity"
              className="ml-8 px-3 py-2 border rounded"
            />
          )}
        </div>
      </div>

      {/* Development Requirements Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Development Requirements</h3>
        {/* Similar structure for dev requirements */}
      </div>

      <button type="submit" className="btn btn--primary">
        Submit Visit
      </button>
    </form>
  );
};

### A.2 Image Upload Component (GCP)

// components/forms/ImageUpload.tsx
import React, { useState } from 'react';
import axios from 'axios';

export const ImageUpload: React.FC<{ visitId: string }> = ({ visitId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post(
        `/api/visits/${visitId}/images`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total!
            );
            setProgress(percentCompleted);
          }
        }
      );

      console.log('Upload successful:', response.data);
      setFiles([]);
      setProgress(0);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="block w-full"
      />
      
      {files.length > 0 && (
        <div>
          <p>{files.length} files selected</p>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn btn--primary"
          >
            {uploading ? `Uploading... ${progress}%` : 'Upload Images'}
          </button>
        </div>
      )}

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

### A.3 PM2 Ecosystem Configuration

// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'school-backend',
      cwd: '/opt/school-backend',
      script: 'dist/app.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/pm2/school-backend-error.log',
      out_file: '/var/log/pm2/school-backend-out.log',
      time: true,
      max_memory_restart: '500M',
      restart_delay: 4000
    },
    {
      name: 'school-frontend',
      cwd: '/opt/school-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/school-frontend-error.log',
      out_file: '/var/log/pm2/school-frontend-out.log',
      time: true,
      max_memory_restart: '400M',
      restart_delay: 4000
    }
  ]
};

---

## Appendix B: Database Seed Script

// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@schoolassessment.com' },
    update: {},
    create: {
      email: 'admin@schoolassessment.com',
      password: adminPassword,
      name: 'System Administrator',
      role: UserRole.ADMIN,
      phone: '+91-9876543210',
      isActive: true
    }
  });

  console.log('Created admin user:', admin.email);

  // Create sample employees
  const employeePassword = await bcrypt.hash('Employee@123', 10);
  
  const employee1 = await prisma.user.upsert({
    where: { email: 'employee1@schoolassessment.com' },
    update: {},
    create: {
      email: 'employee1@schoolassessment.com',
      password: employeePassword,
      name: 'Rahul Kumar',
      role: UserRole.EMPLOYEE,
      phone: '+91-9876543211',
      isActive: true
    }
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'employee2@schoolassessment.com' },
    update: {},
    create: {
      email: 'employee2@schoolassessment.com',
      password: employeePassword,
      name: 'Priya Sharma',
      role: UserRole.EMPLOYEE,
      phone: '+91-9876543212',
      isActive: true
    }
  });

  console.log('Created employee users:', employee1.email, employee2.email);

  console.log('Seed data created successfully!');
  console.log('\n=== Login Credentials ===');
  console.log(`Admin: ${admin.email} / Admin@123`);
  console.log(`Employee 1: ${employee1.email} / Employee@123`);
  console.log(`Employee 2: ${employee2.email} / Employee@123`);
  console.log('========================\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

---

## Appendix C: Backup & Recovery Scripts

### Automated Backup Script

#!/bin/bash
# /opt/scripts/backup-database.sh

# Configuration
BACKUP_DIR="/opt/backups"
DB_NAME="school_assessment"
DB_USER="school_user"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db-${DATE}.sql"
GCS_BUCKET="gs://school-assessment-backups"

# Create backup directory if not exists
mkdir -p ${BACKUP_DIR}

# Perform backup
echo "Starting backup: ${BACKUP_FILE}"
pg_dump -U ${DB_USER} ${DB_NAME} > ${BACKUP_FILE}

# Compress backup
gzip ${BACKUP_FILE}
BACKUP_FILE="${BACKUP_FILE}.gz"

# Upload to GCS
echo "Uploading to GCS..."
gsutil cp ${BACKUP_FILE} ${GCS_BUCKET}/

# Remove local backups older than retention period
find ${BACKUP_DIR} -name "db-*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: ${BACKUP_FILE}"

### Restore Script

#!/bin/bash
# /opt/scripts/restore-database.sh

# Usage: ./restore-database.sh db-20260211_020000.sql.gz

BACKUP_FILE=$1
DB_NAME="school_assessment"
DB_USER="school_user"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file.sql.gz>"
    exit 1
fi

echo "Restoring from: ${BACKUP_FILE}"

# Decompress and restore
gunzip -c ${BACKUP_FILE} | psql -U ${DB_USER} ${DB_NAME}

echo "Restore completed"

### Setup Cron Job

# Add to crontab
sudo crontab -e

# Add line for daily backup at 2 AM
0 2 * * * /opt/scripts/backup-database.sh >> /var/log/db-backup.log 2>&1

---

## Conclusion

This GCP-optimized deployment strategy provides:

✅ **Ultra-Low Cost** - ₹150-500/month (95% cheaper than AWS)  
✅ **Production-Ready** - Secure, scalable, monitored  
✅ **Always Free Tier** - e2-micro VM + 5GB storage forever free  
✅ **Simple Management** - Single VM, PM2 process manager  
✅ **Easy Scaling** - Clear path to Cloud SQL and larger VMs  
✅ **Secure** - SSL, firewall, IAM, backups included  

### Next Steps

1. **Review & Approval** - Stakeholder sign-off on GCP deployment
2. **GCP Account Setup** - Create project, enable billing
3. **Development** - Follow 9-week roadmap
4. **Testing** - Comprehensive testing on staging VM
5. **Production Deployment** - Follow deployment guide (Section 9)
6. **Monitoring Setup** - Configure alerts and logging
7. **Training** - User onboarding and documentation
8. **Launch!** - Go live with near-zero hosting costs

### Support & Maintenance

Post-launch support includes:
- VM monitoring and maintenance
- Database backups and recovery
- Security updates and patches
- Performance optimization
- Feature enhancements
- User support

---

**Document Version:** 2.0 (GCP-Optimized)  
**Last Updated:** February 11, 2026  
**Optimized For:** Google Cloud Platform Single-VM Deployment  
**Target Scale:** 2 Admins + 5-10 Employees, 50-200 visits/month  
**Monthly Cost:** ₹150-500 (Always Free tier eligible)

---

## References

[1] Node.js Best Practices - https://github.com/goldbergyoni/nodebestpractices  
[2] React Documentation - https://react.dev  
[3] Next.js Documentation - https://nextjs.org/docs  
[4] Prisma Documentation - https://www.prisma.io/docs  
[5] GCP Cloud Storage Best Practices - https://cloud.google.com/storage/docs/best-practices  
[6] GCP Compute Engine Documentation - https://cloud.google.com/compute/docs  
[7] JWT Security Best Practices - https://tools.ietf.org/html/rfc8725  
[8] OWASP Security Guidelines - https://owasp.org  
[9] PostgreSQL Performance Tuning - https://www.postgresql.org/docs  
[10] PM2 Documentation - https://pm2.keymetrics.io/docs  
[11] Nginx Configuration Guide - https://nginx.org/en/docs  

---

**END OF REPORT**