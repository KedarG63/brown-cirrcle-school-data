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
  visits?: SchoolVisit[];
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

// Notes types
export type NoteType = 'TEXT' | 'CHECKLIST';
export type NoteColor = 'DEFAULT' | 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | 'TEAL' | 'BLUE' | 'PURPLE' | 'GRAY';

export interface NoteChecklistItem {
  id: string;
  noteId: string;
  text: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
}

export interface NoteLabel {
  id: string;
  name: string;
  color?: string;
  createdById: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title?: string;
  content?: string;
  noteType: NoteType;
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  trashedAt?: string;
  schoolId?: string;
  visitId?: string;
  createdAt: string;
  updatedAt: string;
  checklistItems?: NoteChecklistItem[];
  labels?: { label: NoteLabel }[];
  school?: { id: string; name: string };
  visit?: { id: string; visitDate: string };
  user?: { id: string; name: string };
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

// Chat types
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE';

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string | null;
  messageType: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  sender: { id: string; name: string };
}

export interface ChatListItem {
  id: string;
  isGroup: boolean;
  name: string | null;
  participants: ChatUser[] | null;
  otherUser: ChatUser | null;
  lastMessage: {
    id: string;
    content: string | null;
    messageType: MessageType;
    senderId: string;
    senderName: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ChatDetail {
  id: string;
  isGroup?: boolean;
  name?: string;
  otherUser?: ChatUser;
  participants?: (ChatUser & { participantRole: 'ADMIN' | 'MEMBER' })[];
  isNew?: boolean;
}

export interface GroupDetail {
  id: string;
  name: string;
  createdById: string;
  participants: (ChatUser & {
    participantRole: 'ADMIN' | 'MEMBER';
    joinedAt: string;
  })[];
}

export interface FileUploadResponse {
  fileUrl: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  messageType: MessageType;
}
