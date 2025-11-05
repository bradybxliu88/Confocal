export enum UserRole {
  PI_LAB_MANAGER = 'PI_LAB_MANAGER',
  POSTDOC_STAFF = 'POSTDOC_STAFF',
  GRAD_STUDENT = 'GRAD_STUDENT',
  UNDERGRAD_TECH = 'UNDERGRAD_TECH',
}

export enum OrderStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  ORDERED = 'ORDERED',
  SHIPPED = 'SHIPPED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export enum BookingStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  EXPIRATION_WARNING = 'EXPIRATION_WARNING',
  EQUIPMENT_REMINDER = 'EQUIPMENT_REMINDER',
  ORDER_UPDATE = 'ORDER_UPDATE',
  PROJECT_MENTION = 'PROJECT_MENTION',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  labAffiliation: string;
  profileImage?: string;
  isActive: boolean;
  lastActive: Date;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  progress: number;
  status: string;
  startDate: Date;
  targetEndDate?: Date;
  budget?: number;
  budgetUsed: number;
  ownerId: string;
  owner?: User;
  members?: ProjectMember[];
  updates?: ProjectUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
  role: string;
  joinedAt: Date;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  content: string;
  milestone: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface Protocol {
  id: string;
  name: string;
  description?: string;
  version: string;
  content: string;
  category?: string;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reagent {
  id: string;
  name: string;
  barcode?: string;
  vendor: string;
  catalogNumber: string;
  lotNumber?: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  storageLocation: string;
  storageTemp?: string;
  handlingNotes?: string;
  receivedDate: Date;
  expirationDate?: Date;
  isExpired: boolean;
  isLowStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Equipment {
  id: string;
  name: string;
  model?: string;
  serialNumber?: string;
  location: string;
  description?: string;
  maintenanceNotes?: string;
  isAvailable: boolean;
  requiresTraining: boolean;
  bookingDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  equipmentId: string;
  equipment?: Equipment;
  userId: string;
  user?: User;
  startTime: Date;
  endTime: Date;
  purpose?: string;
  status: BookingStatus;
  isRecurring: boolean;
  recurringPattern?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  projectId?: string;
  project?: Project;
  status: OrderStatus;
  itemName: string;
  vendor: string;
  catalogNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  justification?: string;
  trackingNumber?: string;
  notes?: string;
  createdById: string;
  createdBy?: User;
  approvedById?: string;
  approvedBy?: User;
  requestedDate: Date;
  approvedDate?: Date;
  orderedDate?: Date;
  receivedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  metadata?: any;
  createdAt: Date;
}

export interface DashboardStats {
  activeProjects: number;
  protocolsCount: number;
  lowStockCount: number;
  totalOrders: number;
  pendingOrders: number;
}

export interface StorageSuggestion {
  storageLocation: string;
  storageTemp: string;
  handlingNotes: string;
  shelfLife: string;
  reasoning: string;
}
