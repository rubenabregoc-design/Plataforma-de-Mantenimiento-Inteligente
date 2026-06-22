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
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'urgent' | 'completed';
  type: 'oil' | 'filter' | 'general' | 'regulatory' | 'it';
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
  title: string; // e.g., "Mecánico Automotriz Certificado"
  rating: number;
  reviewCount: number;
  experienceYears: number;
  location: string;
  hourlyRate: number;
  bio: string;
  certifications: string[];
  portfolioImages: string[];
  plan: 'basic' | 'premium';
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
  status: 'pending' | 'quoted' | 'accepted' | 'completed' | 'rated';
  createdAt: string;
  scheduledDate?: string;
  price?: number;
  commission?: number;
  technicianEarnings?: number;
  rating?: number;
  comment?: string;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  sender: 'client' | 'tech';
  text: string;
  timestamp: string;
  image?: string;
}

export interface AgendaEvent {
  id: string;
  techId: string;
  clientName: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  duration: string; // e.g. "1.5h"
  status: 'pending' | 'completed';
}
