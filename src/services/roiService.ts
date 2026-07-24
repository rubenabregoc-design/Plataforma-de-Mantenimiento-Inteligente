import { JobRequest, Asset } from '../types';

export const ROIService = {
  calculateAvoidedLoss: (assetType: string) => {
    // Estimación de pérdida por hora de inactividad según industria en Panamá
    const lossPerHour: Record<string, number> = {
      'generator': 150,     // PH o Clínica sin luz
      'industrial_equip': 300, // Planta detenida
      'ac': 50,             // Oficinas calientes (baja productividad)
      'car': 80,             // Logística detenida
      'solar_panels': 40,    // Pérdida de generación
      'house': 30
    };
    return lossPerHour[assetType] || 50;
  },

  getDetailedMetrics: (assets: Asset[], requests: JobRequest[]) => {
    const completed = requests.filter(r => r.status === 'completed');

    // Inversión Total (Lo que el cliente ha pagado en mantenimientos)
    const totalInvestment = completed.reduce((sum, r) => sum + (r.price || 0), 0);

    // Ahorro Estimado (Basado en fallas críticas evitadas)
    let estimatedSavings = 0;
    completed.forEach(req => {
      const asset = assets.find(a => a.id === req.assetId);
      if (asset) {
        // Un mantenimiento preventivo evita un fallo que costaría 10 veces más + paro técnico
        const repairCostAvoided = (req.price || 100) * 5;
        const downtimeAvoided = ROIService.calculateAvoidedLoss(asset.type) * 8;
        estimatedSavings += (repairCostAvoided + downtimeAvoided);
      }
    });

    const netGain = estimatedSavings - totalInvestment;
    const roiPercentage = totalInvestment > 0 ? (netGain / totalInvestment) * 100 : 0;

    return {
      totalInvestment,
      estimatedSavings,
      netGain,
      roiPercentage: roiPercentage.toFixed(1),
      preventedMajorFailures: Math.floor(completed.length * 0.8),
      uptimeBonus: "98.4%"
    };
  },

  getMonthlyROISummary: (assets: Asset[], requests: JobRequest[]) => {
    const completedLastMonth = requests.filter(r =>
      r.status === 'completed' &&
      new Date(r.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    let totalSavings = 0;
    completedLastMonth.forEach(req => {
      const asset = assets.find(a => a.id === req.assetId);
      if (asset) {
        // Asumimos que cada mantenimiento preventivo evita al menos 4h de paro técnico
        totalSavings += ROIService.calculateAvoidedLoss(asset.type) * 4;
      }
    });

    return {
      totalSavings,
      preventedFailures: completedLastMonth.length,
      efficiencyGain: '12%'
    };
  }
};
