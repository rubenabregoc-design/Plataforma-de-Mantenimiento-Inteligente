export type AssetType = 
  | 'car' 
  | 'house' 
  | 'ac' 
  | 'computer' 
  | 'generator' 
  | 'solar_panels' 
  | 'moto' 
  | 'industrial_equip';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  details: string; // e.g. "Toyota Yaris Hatchback 2021", "Samsung 12000 BTU"
  registeredAt: string;
  // Dynamic metrics:
  mileage?: number; // for cars/motos
  usageHours?: number; // for generators/industrial
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
}

export interface MaintenanceReminder {
  id: string;
  assetId: string;
  clientId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'urgent' | 'completed';
  type: 'oil' | 'filter' | 'general' | 'regulatory' | 'it';
  lastNotified?: string; // Fecha del último correo enviado
}

export type TechCategory = 
  | 'mecanico' 
  | 'electricista' 
  | 'plomero' 
  | 'tecnico_ac' 
  | 'informatico' 
  | 'especialista_solar';

export interface TechProfile {
  id: string;
  name: string;
  category: TechCategory;
  title: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  experienceYears: number;
  location: string;
  hourlyRate: number;
  bio: string;
  certifications: string[];
  portfolioImages: string[];
  plan: 'basic' | 'premium';
  companyName?: string; // Nombre de la empresa del técnico
  adminNotes?: string; // Solo editable por el admin
  requestsUsedThisMonth: number;
  isVerified: boolean;
  // Documents for verification
  policeRecordUrl?: string;
  idCardUrl?: string;
  userId?: string; // Link to auth user
}

export interface MaterialItem {
  name: string;
  price: number;
  quantity: number;
  category?: string;
  addedAt?: string;
}

export interface TaskItem {
  id: string;
  description: string;
  isCompleted: boolean;
}

export interface JobRequest {
  id: string;
  clientId: string;
  clientName: string;
  assetId: string;
  assetName: string;
  techId: string;
  techName: string;
  description: string;
  status: 'pending' | 'quoted' | 'accepted' | 'completed' | 'rated' | 'rejected' | 'disputed' | 'cancelled';
  createdAt: string;
  scheduledDate?: string;
  scheduledTime?: string; // Hora propuesta por el técnico (HH:MM)
  scheduledDuration?: number; // Duración en horas (0.5, 1, 2, etc.)
  scheduledTravelTime?: number; // Tiempo de viaje en minutos
  price?: number;
  commission?: number;
  technicianEarnings?: number;

  // Technician Tools
  materials?: MaterialItem[];
  checklist?: TaskItem[];

  // Security & Tracking
  visitStartedAt?: string;
  visitFinishedAt?: string;
  clientPhone?: string;
  techPhone?: string;
  serviceAddress?: string;

  // Issues
  issueReportedByClient?: boolean;
  issueDescription?: string;

  // Rescheduling Audit
  rescheduleCount?: number;
  rescheduleHistory?: {
    oldDate: string;
    oldTime: string;
    newDate: string;
    newTime: string;
    reason: string;
    timestamp: string;
  }[];

  // Ratings
  rating?: number;
  comment?: string;
  clientRating?: number;
  clientComment?: string;
  clientSignature?: string; // Base64 signature image
}

export interface ChatMessage {
  id: string;
  requestId: string;
  sender: 'client' | 'tech';
  text: string;
  timestamp: string;
  image?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'filtros' | 'aceites' | 'frenos' | 'electricidad' | 'general';
  quantity: number;
  minStock: number;
  unit: string;
  pricePerUnit: number;
  compatibleAssets: string[]; // IDs de equipos
}

export interface InspectionStep {
  id: string;
  label: string;
  status: 'pending' | 'ok' | 'fail' | 'na';
  observation?: string;
}

export interface ServiceChecklist {
  id: string;
  requestId: string;
  steps: InspectionStep[];
  completedAt?: string;
}

// NUEVOS TIPOS V4: NEGOCIO Y ESCALABILIDAD
export interface MantechID {
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  idNumber: string;
  documentUrl?: string;
  policeRecordUrl?: string;
  verifiedAt?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  maxAssets: number;
}

export interface UserSubscription {
  planId: string;
  status: 'active' | 'expired' | 'canceled';
  startDate: string;
  nextBillingDate: string;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  timestamp: string;
  status: 'pending' | 'completed';
}

export interface TechWallet {
  balance: number;
  pendingBalance: number;
  transactions: WalletTransaction[];
}

export interface TechProfile {
  id: string;
  name: string;
  category: TechCategory;
  title: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  location: string;
  hourlyRate: number;
  bio: string;
  certifications: string[];
  portfolioImages: string[];
  plan: 'basic' | 'premium';
  mantechId?: MantechID; // Seguridad Verificada
  wallet?: TechWallet; // Pagos y Billetera
  completedJobs: number;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  details: string;
  registeredAt: string;
  mileage?: number;
  usageHours?: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  ownerId?: string; // Para Modo Flota
  location?: string; // Para Modo Flota (Ej: Provincia/Sede)
  observations?: string; // Nuevas observaciones del equipo
}

export interface AgendaEvent {
  id: string;
  techId: string;
  techUserId?: string; // Para reglas de seguridad
  clientName: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  duration: string; // e.g. "1.5h"
  travelTime?: string; // e.g. "30 min"
  status: 'pending' | 'completed';
}
