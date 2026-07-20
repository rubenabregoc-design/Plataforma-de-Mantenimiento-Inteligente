export type AssetType = 
  | 'car' 
  | 'house' 
  | 'ac' 
  | 'computer' 
  | 'generator' 
  | 'solar_panels' 
  | 'moto' 
  | 'industrial_equip';

export type FuelType = 'diesel' | 'gas91' | 'gas95';

export interface Asset {
  id: string;
  name: string; // Marca o Nombre descriptivo
  type: AssetType;
  details: string; // Modelo
  licensePlate?: string; // Placa (Panamá)
  serialNumber?: string; // Número de Serie / IMEI
  registeredAt: string;
  // Dynamic metrics:
  mileage?: number; // for cars/motos
  usageHours?: number; // for generators/industrial
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  ownerId?: string; // Para Modo Flota
  location?: string; // Para Modo Flota (Ej: Provincia/Sede)
  observations?: string; // Nuevas observaciones del equipo
  gpsDeviceId?: string; // ID o IMEI del rastreador GPS para sincronización real
  latitude?: number;
  longitude?: number;
  currentRoute?: string;
  routeStartedAt?: string;
  driverName?: string;
  fuelType?: FuelType;
  // Finanzas y QR
  qrCodeUrl?: string;
  totalMaintenanceSpend?: number;
  avgCostPerUnit?: number; // km o hora
  performanceRating?: 'efficient' | 'average' | 'costly';
  fuelEfficiency?: number; // km por galón
  fuelLogs?: { date: string, gallons: number, price: number, mileage: number, photoUrl?: string, status: 'ok' | 'anomaly' }[];
  preTripInspections?: { date: string, inspectorName: string, items: { label: string, status: 'ok' | 'fail' }[], observations?: string }[];
  usageStats?: { dailyAvgKm?: number, predictedMaintenanceDate?: string };
  routeHistory?: { lat: number; lng: number; timestamp: string; locationName?: string; type?: 'track'; speed?: number }[];
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
  isOnline?: boolean; // Estado de disponibilidad en el radar
  companyName?: string; // Nombre de la empresa a la que pertenece
  hourlyRate: number;
  bio: string;
  certifications: string[];
  portfolioImages: string[];
  plan: 'basic' | 'pro' | 'enterprise';
  adminNotes?: string; // Solo editable por el admin
  requestsUsedThisMonth: number;
  isVerified: boolean;
  mantechId?: MantechID; // Seguridad Verificada
  wallet?: TechWallet; // Pagos y Billetera
  // GPS Location for Radar
  latitude?: number;
  longitude?: number;
  lastLocationUpdate?: string;
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
  status: 'pending' | 'quoted' | 'accepted' | 'executing' | 'completed' | 'rated' | 'rejected' | 'disputed' | 'cancelled' | 'open_bidding';
  isPublic?: boolean; // Si es true, aparece en el Market abierto
  bids?: { techId: string; techName: string; price: number; time: string; timestamp: string }[];
  serviceType?: 'onsite' | 'remote';
  remotePlatform?: 'anydesk' | 'zoom' | 'meet' | 'teams' | 'whatsapp' | 'other';
  remoteLink?: string;
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
  paymentMethod?: string;
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
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
  ownerName?: string;
  yappyNumber?: string;
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
