export type AssetType = 
  | 'car' 
  | 'house' 
  | 'ac' 
  | 'computer' 
  | 'generator' 
  | 'solar_panels' 
  | 'moto' 
  | 'industrial_equip'
  | 'plumbing'
  | 'electrical';

export type FuelType = 'diesel' | 'gas91' | 'gas95';

export type AssetCategory = 'GENERAL' | 'PH' | 'SALUD' | 'CONSTRUCCION';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Asset {
  id: string;
  name: string; // Marca o Nombre descriptivo
  type: AssetType;
  category: AssetCategory;
  riskLevel?: RiskLevel; // Punto #22: Clasificación por riesgo
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
  usageStats?: {
    dailyAvgKm?: number,
    predictedMaintenanceDate?: string,
    rol?: number, // Remaining Oil Life (0-100)
    thermalStress?: number, // Horas motor / ralentí
    altitudeFactor?: number, // Coeficiente MDM por Boquete/Montaña
    environmentalImpact?: number // Salinidad/Humedad
  };
  // Nuevos campos Casero & Business V4
  purchaseDate?: string;
  warrantyMonths?: number;
  emergencyInstructions?: string;
  isEmergencyAsset?: boolean;
  // Campos PH / Médico / Construcción
  locationDetails?: string; // Ej: Piso 4, Sótano 1
  isRented?: boolean;
  rentalHourlyRate?: number;
  criticalityLevel?: 'low' | 'medium' | 'high' | 'critical';
  maintenanceContractUrl?: string;
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
  profileImage?: string; // Foto de perfil del especialista
  isOnline?: boolean; // Estado de disponibilidad en el radar
  companyName?: string; // Nombre de la empresa a la que pertenece
  hourlyRate: number;
  bio: string;
  certifications: string[];
  portfolioImages: string[];
  plan: 'basic' | 'pro' | 'enterprise';
  verificationLevel: 1 | 2 | 3; // Punto #4: Niveles de verificación
  hasLiabilityInsurance: boolean; // Punto #5: Seguro de daños
  insurancePolicyUrl?: string;
  adminNotes?: string; // Solo editable por el admin
  requestsUsedThisMonth: number;
  isVerified: boolean;
  isTaxObligated: boolean; // Punto ITBMS: Si el técnico debe cobrar 7% al cliente
  loyaltyPoints?: number; // Puntos acumulados del Club Mantech
  unlockedModules?: string[]; // IDs de módulos desbloqueados (fidelidad)
  fiscalInfo?: {
    isDGIInscribed: boolean;
    emitsElectronicInvoice: boolean;
    ruc: string;
    contributorType: 'natural' | 'legal';
    itbmsStatus: 'yes' | 'no' | 'unsure';
  };
  mantechId?: MantechID; // Seguridad Verificada
  wallet?: TechWallet; // Pagos y Billetera

  // Punto #2: Reputación del Técnico
  acceptanceRate?: number; // 0.0 - 1.0
  totalRequestsReceived?: number;
  acceptedRequestsCount?: number;

  // GPS Location for Radar
  latitude?: number;
  longitude?: number;
  lastLocationUpdate?: string;
  cedula?: string;
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
  techCompanyName?: string; // Nombre de la empresa del especialista
  description: string;
  status: 'pending' | 'quoted' | 'accepted' | 'executing' | 'completed' | 'rated' | 'rejected' | 'disputed' | 'cancelled' | 'open_bidding';
  isPublic?: boolean; // Si es true, aparece en el Market abierto
  bids?: { techId: string; techName: string; price: number; time: string; timestamp: string }[];
  serviceType?: 'onsite' | 'remote';
  remotePlatform?: 'anydesk' | 'zoom' | 'meet' | 'teams' | 'whatsapp' | 'other';
  remoteLink?: string;
  createdAt: string;
  scheduledDate?: string;
  scheduledEndDate?: string; // Punto #6: Rango de fechas
  scheduledTime?: string; // Hora propuesta por el técnico (HH:MM)
  scheduledDuration?: number; // Duración en horas (0.5, 1, 2, etc.)
  scheduledTravelTime?: number; // Tiempo de viaje en minutos
  price?: number;
  commission?: number;
  commissionItbms?: number; // ITBMS que MantechPro le cobra al técnico por el servicio de plataforma
  technicianEarnings?: number;
  itbmsAmount?: number; // ITBMS que el técnico le cobra al cliente

  // Ajustes de Presupuesto en Sitio
  priceAdjustment?: {
    newPrice: number;
    reason: string;
    status: 'pending' | 'accepted' | 'rejected';
    timestamp: string;
  };

  // Technician Tools
  materials?: MaterialItem[];
  checklist?: TaskItem[];
  proofOfWork?: {
    oldPartPhoto?: string;
    newPartPhoto?: string;
    timestamp: string;
    location: { lat: number; lng: number; address?: string };
  };

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
  cufe?: string; // Código Único de Factura Electrónica (Panamá)

  // Punto #6 & #21: Garantías y Responsabilidad
  warrantyDays?: number;
  warrantyCoverage?: string;
  contractAccepted?: boolean; // Confirmación de relación independiente

  // Punto #7: Protocolo de Daños
  incidentReport?: {
    description: string;
    photos: string[];
    videoUrl?: string;
    techDefense?: string;
    status: 'reported' | 'mediation' | 'resolved';
    resolution?: string;
  };

  // Payment Window (MantechPro Flow)
  paymentDeadlineAt?: string;
  paymentWindowMode?: 'urgent' | 'normal';
  hasNotified50?: boolean;
  hasNotified70?: boolean;

  // Waitlist (FIFO)
  onHold?: boolean;
  waitlistEntryAt?: string;
  waitlistTTLAt?: string; // 7 days expiration
  waitlistRenewCount?: number;

  // Punto #6: Flujo Corporativo B2B
  isCorporate?: boolean;
  approverEmail?: string;
  approvalLink?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
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

export interface StaffingProject {
  id: string;
  clientId: string;
  clientName: string;
  category: TechCategory;
  techCount: number;
  days: number;
  startDate: string;
  dailyRatePerTech: number;

  // SPCP: Gastos Extraordinarios
  extraordinaryExpenses: {
    id: string;
    label: string; // Hotel, Pasajes, Ferry
    amount: number;
    status: 'pending' | 'approved' | 'committed'; // Committed = No reembolsable
  }[];

  // MAC: Motor de Compensación
  logistics: {
    distanceKm: number;
    tolls: number;
    fuelCost: number;
    totalMobilization: number;
  };

  // Escrow Inteligente (Bolsas Diarias)
  dailyBags: {
    day: number;
    amount: number; // Pago técnico + fee + impuestos
    status: 'locked' | 'released' | 'refunded';
    workProgress: number; // 0-100% (Para el día de cancelación)
  }[];

  status: 'pending_escrow' | 'active' | 'completed' | 'terminated_early';
  techAssignments: {
    techId: string;
    techName: string;
    verificationLevel: number;
  }[];
  createdAt: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  repliesCount: number;
  viewsCount: number;
  lastReplyAt?: string;
}

export interface ForumReply {
  id: string;
  topicId: string;
  text: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
}
