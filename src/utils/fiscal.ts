/**
 * Fiscal Utilities for Panama (DGI Compliance)
 * MantechPro Master V7.0
 */

import { JobRequest } from '../types';

/**
 * Generates a simulated CUFE (Código Único de Factura Electrónica) for Panama.
 * In a real environment, this would be returned by the DGI or a PAC (Proveedor Autorizado de Certificación).
 */
export const generateCUFE = (request: JobRequest): string => {
  const timestamp = new Date().getTime().toString(16);
  const requestIdPart = request.id.substring(0, 8);
  const randomPart = Math.random().toString(16).substring(2, 10);

  // Simulated CUFE format:
  // [Timestamp]-[RequestID]-[Random]-[Checksum]
  const cufe = `CUFE-${timestamp}-${requestIdPart}-${randomPart}-PAN`.toUpperCase();

  return cufe;
};

/**
 * Calculates the ITBMS Breakdown for a project
 */
export const calculateFiscalBreakdown = (basePrice: number, isTaxObligated: boolean) => {
  const techITBMS = isTaxObligated ? basePrice * 0.07 : 0;
  const platformCommissionRate = 0.15; // Example 15%
  const platformCommission = basePrice * platformCommissionRate;
  const platformITBMS = platformCommission * 0.07;

  return {
    basePrice,
    techITBMS,
    platformCommission,
    platformITBMS,
    totalToClient: basePrice + techITBMS + (basePrice * 0.04) + 0.30, // Including PayPal estimated fee
  };
};
