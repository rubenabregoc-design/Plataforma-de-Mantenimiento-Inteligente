import { Asset, TechProfile, MaintenanceReminder, JobRequest, AgendaEvent } from './types';

export const initialAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'GEELY',
    type: 'car',
    details: 'NEO 2026',
    licensePlate: '828854',
    registeredAt: '2026-01-10',
    mileage: 44500,
    lastMaintenanceDate: '2026-07-03',
    nextMaintenanceDate: '2026-07-31',
    observations: 'NO PRENDE',
    latitude: 8.9830,
    longitude: -79.5170
  },
  {
    id: 'asset-2',
    name: 'Toyota Yaris',
    type: 'car',
    details: 'Toyota Yaris Hatchback 2021, Motor 1.5L',
    licensePlate: 'AA4567',
    registeredAt: '2026-01-10',
    mileage: 44500,
    lastMaintenanceDate: '2026-03-15',
    nextMaintenanceDate: '2026-06-25',
    observations: 'Requiere cambio de pastillas pronto.'
  },
  {
    id: 'asset-2',
    name: 'Aire Acondicionado Sala',
    type: 'ac',
    details: 'Samsung Inverter 18,000 BTU, Split Wall-mount',
    registeredAt: '2025-05-20',
    lastMaintenanceDate: '2026-01-20',
    nextMaintenanceDate: '2026-06-27',
  },
  {
    id: 'asset-3',
    name: 'Planta Eléctrica Auxiliar',
    type: 'generator',
    details: 'Generac Guardian 14kW, Gas Licuado',
    registeredAt: '2025-09-01',
    usageHours: 120,
    lastMaintenanceDate: '2026-02-10',
    nextMaintenanceDate: '2026-07-10',
  },
  {
    id: 'asset-4',
    name: 'Servidor de Datos B2B',
    type: 'computer',
    details: 'Dell PowerEdge R750 Xeon, 64GB RAM, RAID 5',
    registeredAt: '2024-11-15',
    lastMaintenanceDate: '2025-12-15',
    nextMaintenanceDate: '2026-06-20', // Due now
  }
];

export const initialReminders: MaintenanceReminder[] = [
  {
    id: 'rem-1',
    assetId: 'asset-1',
    title: 'Cambio de Aceite de Motor',
    description: 'Cambio de aceite sintético 5W-30 y filtro de aceite original.',
    dueDate: '2026-06-25', // 5 days from June 20, 2026
    status: 'urgent',
    type: 'oil'
  },
  {
    id: 'rem-2',
    assetId: 'asset-2',
    title: 'Limpieza Profunda de Filtros y Serpentín',
    description: 'Mantenimiento preventivo completo para evitar goteos y mejorar la eficiencia de soplado.',
    dueDate: '2026-06-27', // 7 days from June 20, 2026
    status: 'pending',
    type: 'filter'
  },
  {
    id: 'rem-3',
    assetId: 'asset-4',
    title: 'Limpieza de Polvo e Inspección de UPS',
    description: 'Mantenimiento estructural de hardware, limpieza interna del chasís para evitar sobrecalentamiento.',
    dueDate: '2026-06-20', // Today
    status: 'urgent',
    type: 'it'
  }
];

export const initialTechnicians: TechProfile[] = [
  {
    id: 'tech-1',
    name: 'Carlos Mendoza',
    category: 'mecanico',
    title: 'Mecánico Automotriz Certificado - ASE',
    rating: 4.9,
    reviewCount: 142,
    experienceYears: 12,
    location: 'Bella Vista, Ciudad de Panamá',
    hourlyRate: 25,
    bio: 'Especialista en motores japoneses y coreanos. Diagnóstico computarizado, cambios de fluidos, frenos y sistemas de suspensión. Servicio a domicilio disponible.',
    certifications: ['Certificación ASE en Motores', 'Técnico Especialista Toyota Motors Corp'],
    portfolioImages: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    plan: 'enterprise',
    completedJobs: 156,
    latitude: 8.9833,
    longitude: -79.5167,
    mantechId: {
      status: 'verified',
      idNumber: '8-888-8888',
      verifiedAt: '2026-01-15'
    },
    wallet: {
      balance: 450.25,
      pendingBalance: 85.00,
      transactions: [
        { id: 'tx-1', amount: 80.00, type: 'credit', description: 'Cambio de aceite Toyota Yaris', timestamp: '2026-06-20', status: 'completed' },
        { id: 'tx-2', amount: 120.00, type: 'credit', description: 'Mantenimiento preventivo', timestamp: '2026-06-18', status: 'completed' }
      ]
    }
  },
  {
    id: 'tech-2',
    name: 'Ing. Luis Carlos Pitti',
    category: 'tecnico_ac',
    title: 'Técnico HVAC / Aire Acondicionado',
    rating: 4.8,
    reviewCount: 98,
    experienceYears: 8,
    location: 'San Francisco, Ciudad de Panamá',
    hourlyRate: 20,
    bio: 'Mantenimiento, diagnóstico y reparación de aires acondicionados residenciales y comerciales. Lavado a presión ecológica, recarga de refrigerante R410A.',
    certifications: ['Certificación HVAC Panamá', 'Técnico Autorizado Daikin'],
    portfolioImages: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    plan: 'pro',
    completedJobs: 120,
    latitude: 8.9950,
    longitude: -79.5012
  },
  {
    id: 'tech-3',
    name: 'Alberto Gómez Ramos',
    category: 'electricista',
    title: 'Electricista Idóneo Residencial y Comercial',
    rating: 4.7,
    reviewCount: 64,
    experienceYears: 15,
    location: 'Bethania, Ciudad de Panamá',
    hourlyRate: 18,
    bio: 'Instalaciones eléctricas seguras, paneles de distribución, balance térmico, y reparación de cableados obsoletos. Firmas de planos y avales de seguridad.',
    certifications: ['Idoneidad SPIA-Panamá', 'Técnico Electricista INADEH'],
    portfolioImages: [
      'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    plan: 'basic',
    completedJobs: 42,
    latitude: 9.0125,
    longitude: -79.5230
  },
  {
    id: 'tech-4',
    name: 'Ing. Javier Esquivel',
    category: 'informatico',
    title: 'Especialista en Infraestructura TI y Redes B2B',
    rating: 5.0,
    reviewCount: 41,
    experienceYears: 10,
    location: 'Clayton, Ciudad de Panamá',
    hourlyRate: 35,
    bio: 'Mantenimiento de centro de datos, servidores, cableado estructurado, ruteadores CISCO, configuración de switches industriales y mantenimiento preventivo de UPS.',
    certifications: ['Cisco CCNA', 'Microsoft Certified Azure Expert'],
    portfolioImages: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    plan: 'enterprise',
    completedJobs: 56,
    latitude: 9.0010,
    longitude: -79.5820
  },
  {
    id: 'tech-5',
    name: 'Esteban Boyd',
    category: 'especialista_solar',
    title: 'Ingeniero en Energía Solar y Renovables',
    rating: 4.9,
    reviewCount: 29,
    experienceYears: 6,
    location: 'El Cangrejo, Panamá',
    hourlyRate: 30,
    bio: 'Mantenimiento de sistemas solares fotovoltaicos, limpieza técnica de paneles solares, monitoreo de inversores y diagnóstico de banco de baterías de litio.',
    certifications: ['Certified PV Professional', 'Idóneo en Ingeniería Industrial'],
    portfolioImages: [
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    plan: 'pro',
    completedJobs: 34,
    latitude: 8.9880,
    longitude: -79.5280
  }
];

export const initialRequests: JobRequest[] = [
  {
    id: 'req-101',
    clientId: 'user-client-1',
    clientName: 'Rubén Ábrego',
    assetId: 'asset-1',
    assetName: 'Toyota Yaris',
    techId: 'tech-1',
    techName: 'Carlos Mendoza',
    description: 'Solicitud de cotización para cambio de aceite reglamentario de los 45k kilómetros.',
    status: 'quoted',
    createdAt: '2026-06-18T10:30:00Z',
    price: 80,
    commission: 12, // 15% of 80
    technicianEarnings: 68,
  },
  {
    id: 'req-102',
    clientId: 'user-client-1',
    clientName: 'Rubén Ábrego',
    assetId: 'asset-3',
    assetName: 'Planta Eléctrica Auxiliar',
    techId: 'tech-3',
    techName: 'Alberto Gómez Ramos',
    description: 'Revisión y mantenimiento general de la planta eléctrica que no enciende el motor de arranque.',
    status: 'completed',
    createdAt: '2026-06-10T09:00:00Z',
    price: 120,
    commission: 18,
    technicianEarnings: 102,
    rating: 5,
    comment: 'Excelente servicio. Alberto revisó los relevadores eléctricos y arrancó la planta rápidamente de forma segura.'
  }
];

export const initialAgendaEvents: AgendaEvent[] = [
  {
    id: 'evt-1',
    techId: 'tech-1',
    clientName: 'Juan Pérez',
    title: 'Cambio de aceite y filtros - Toyota Hilux',
    date: '2026-06-22',
    time: '08:00',
    duration: '1.5h',
    status: 'pending'
  },
  {
    id: 'evt-2',
    techId: 'tech-1',
    clientName: 'María López',
    title: 'Limpieza de goteo de Split AC',
    date: '2026-06-22',
    time: '11:00',
    duration: '1h',
    status: 'pending'
  }
];

export const initialInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Filtro de Aceite Sintético',
    category: 'filtros',
    quantity: 2,
    minStock: 1,
    unit: 'unidades',
    pricePerUnit: 12.50,
    compatibleAssets: ['asset-1']
  },
  {
    id: 'inv-2',
    name: 'Aceite 5W-30 Full Synthetic',
    category: 'aceites',
    quantity: 1,
    minStock: 2,
    unit: 'galones',
    pricePerUnit: 35.00,
    compatibleAssets: ['asset-1']
  },
  {
    id: 'inv-3',
    name: 'Filtro de Aire AC 18k BTU',
    category: 'filtros',
    quantity: 5,
    minStock: 2,
    unit: 'unidades',
    pricePerUnit: 8.00,
    compatibleAssets: ['asset-2']
  }
];

export const defaultInspectionSteps: Omit<InspectionStep, 'id'>[] = [
  { label: 'Limpieza de área de trabajo', status: 'pending' },
  { label: 'Verificación de voltajes/niveles', status: 'pending' },
  { label: 'Inspección visual de fugas', status: 'pending' },
  { label: 'Prueba de funcionamiento final', status: 'pending' }
];
