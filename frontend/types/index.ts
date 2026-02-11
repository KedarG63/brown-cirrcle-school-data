export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  location: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface SchoolVisit {
  id: string;
  schoolId: string;
  employeeId: string;
  visitDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED';
  school?: { id: string; name: string; location: string };
  employee?: { id: string; name: string };
  requirements?: SchoolRequirement;
  images?: VisitImage[];
  _count?: { images: number };
  createdAt: string;
  updatedAt: string;
}

export interface SchoolRequirement {
  id: string;
  visitId: string;
  booksNeeded: boolean;
  booksQuantity?: number;
  uniformsNeeded: boolean;
  uniformsQuantity?: number;
  furnitureNeeded: boolean;
  furnitureDetails?: string;
  paintingNeeded: boolean;
  paintingArea?: string;
  otherCoreRequirements?: string;
  tvNeeded: boolean;
  tvQuantity?: number;
  wifiNeeded: boolean;
  wifiDetails?: string;
  computersNeeded: boolean;
  computersQuantity?: number;
  otherDevRequirements?: string;
  notes?: string;
  estimatedBudget?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface VisitImage {
  id: string;
  visitId: string;
  imageUrl: string;
  imageKey: string;
  imageType?: string;
  description?: string;
  uploadedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalSchools: number;
  totalVisits: number;
  visitsToday: number;
  visitsThisWeek: number;
  visitsThisMonth: number;
  activeEmployees: number;
  pendingReviews: number;
}

export interface EmployeePerformance {
  id: string;
  name: string;
  email: string;
  totalVisits: number;
  visitsThisMonth: number;
  visitsToday: number;
  lastVisitDate: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
