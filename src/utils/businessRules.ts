import { Asset, TechProfile, RiskLevel } from '../types';

/**
 * Protocolo de Seguridad Mantech Pro V4
 * Define qué nivel de técnico y protecciones se requieren según el riesgo del activo.
 */
export const SECURITY_PROTOCOLS = {
  low: {
    minLevel: 1,
    levelName: 'Técnico Básico',
    insuranceRequired: false,
    description: 'Equipos de bajo impacto operativo o residencial estándar.'
  },
  medium: {
    minLevel: 2,
    levelName: 'Especialista Senior',
    insuranceRequired: false,
    description: 'Activos vitales para la operación diaria.'
  },
  high: {
    minLevel: 3,
    levelName: 'Master Idóneo',
    insuranceRequired: true,
    description: 'Infraestructura crítica. Requiere Seguro de Daños a Terceros.'
  }
};

export const canTechHandleAsset = (tech: TechProfile, asset: Asset): { can: boolean; reason?: string } => {
  const risk = asset.riskLevel || 'low';
  const protocol = SECURITY_PROTOCOLS[risk];

  if (tech.verificationLevel < protocol.minLevel) {
    return {
      can: false,
      reason: `Se requiere un técnico nivel ${protocol.minLevel} (${protocol.levelName}) para este activo.`
    };
  }

  if (protocol.insuranceRequired && !tech.hasLiabilityInsurance) {
    return {
      can: false,
      reason: 'Este activo de alto riesgo requiere un técnico con Seguro de Responsabilidad Civil activo.'
    };
  }

  return { can: true };
};
