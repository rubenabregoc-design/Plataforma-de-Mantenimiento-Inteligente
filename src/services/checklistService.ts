import { AssetType, TaskItem } from '../types';

export const ChecklistService = {
  getTemplateByAssetType: (type: AssetType): TaskItem[] => {
    const templates: Record<string, string[]> = {
      'generator': [
        'Verificación de nivel de aceite y refrigerante',
        'Prueba de arranque y transferencia manual',
        'Limpieza de terminales de batería',
        'Inspección de fugas de combustible'
      ],
      'ac': [
        'Limpieza de filtros y serpentín evaporador',
        'Medición de presión de gas refrigerante',
        'Revisión de drenaje y bomba de condensado',
        'Inspección de consumo eléctrico (Amperaje)'
      ],
      'car': [
        'Revisión de niveles (Aceite, Frenos, Coolant)',
        'Inspección visual de correas y mangueras',
        'Verificación de presión de neumáticos',
        'Escaneo computarizado de códigos de falla'
      ],
      'solar_panels': [
        'Limpieza profunda de paneles',
        'Revisión de conexiones de inversor',
        'Medición de eficiencia de baterías',
        'Inspección de cableado DC/AC'
      ],
      'industrial_equip': [
        'Engrase de partes móviles',
        'Ajuste de tornillería y vibraciones',
        'Prueba de sensores de seguridad',
        'Calibración de instrumentos'
      ]
    };

    const tasks = templates[type] || ['Inspección general del activo', 'Prueba de funcionamiento'];

    return tasks.map((desc, idx) => ({
      id: `task-${idx}-${Date.now()}`,
      description: desc,
      isCompleted: false
    }));
  }
};
