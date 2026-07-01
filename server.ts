import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = 8080;

app.use(express.json({ limit: '10mb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Lógica de "Smart Fallback" para un diagnóstico profesional 100% local
const getSmartFallback = (asset: string, problem: string) => {
  const p = problem.toLowerCase();
  const a = asset.toLowerCase();

  // PRIORIDAD 1: SEGURIDAD (Humo, Fuego, Chispas) - Universal
  if (p.includes('fuego') || p.includes('humo') || p.includes('chispas') || p.includes('quemado') || p.includes('olor a quemado')) {
    return {
      possibleCauses: ['Cortocircuito en bobinado primario', 'Fallo crítico de aislamiento', 'Sobrecalentamiento por obstrucción'],
      urgency: 'Crítica',
      urgencyReason: 'Riesgo inminente de incendio o descarga eléctrica fatal. El síntoma indica degradación severa de componentes.',
      troubleshootingSteps: ['Paso 1: Corte la electricidad desde el breaker principal.', 'Paso 2: Use extintor tipo C si hay llamas.', 'Paso 3: No intente encenderlo hasta inspección experta.'],
      estimatedCostRange: '$80 - $250+',
      specialistType: a.includes('aire') ? 'tecnico_ac' : 'electricista'
    };
  }

  // CATEGORÍA: AIRE ACONDICIONADO
  if (a.includes('aire') || a.includes('split') || a.includes('ac')) {
    if (p.includes('agua') || p.includes('gotea') || p.includes('mojado')) {
      return {
        possibleCauses: ['Obstrucción en línea de drenaje', 'Congelamiento de serpentín por filtros sucios', 'Bandeja de condensado fisurada'],
        urgency: 'Alta',
        urgencyReason: 'El agua puede causar daños estructurales en paredes y cortocircuitos en la unidad interior.',
        troubleshootingSteps: ['Paso 1: Apague la unidad inmediatamente.', 'Paso 2: Limpie los filtros de malla frontales.', 'Paso 3: Verifique si la manguera exterior está obstruida.'],
        estimatedCostRange: '$35 - $65',
        specialistType: 'tecnico_ac'
      };
    }
    if (p.includes('enfría') || p.includes('calor') || p.includes('poco aire')) {
      return {
        possibleCauses: ['Fuga de gas refrigerante R410A/R22', 'Capacitor de arranque defectuoso', 'Compresor sobrecalentado'],
        urgency: 'Media',
        urgencyReason: 'Pérdida de eficiencia operativa. Forzar el equipo puede quemar el compresor.',
        troubleshootingSteps: ['Paso 1: Verifique que el modo esté en "Cool" (Copo de nieve).', 'Paso 2: Revise si el ventilador exterior gira.', 'Paso 3: Evite usarlo hasta que sea revisado.'],
        estimatedCostRange: '$45 - $120',
        specialistType: 'tecnico_ac'
      };
    }
  }

  // CATEGORÍA: VEHÍCULOS (CARRO/MOTO)
  if (a.includes('carro') || a.includes('auto') || a.includes('toyota') || a.includes('geely') || a.includes('moto')) {
    if (p.includes('freno') || p.includes('chillido') || p.includes('tiembla')) {
      return {
        possibleCauses: ['Pastillas de freno desgastadas', 'Discos de freno cristalizados o deformados', 'Bajo nivel de líquido de frenos'],
        urgency: 'Alta',
        urgencyReason: 'Seguridad vial comprometida. La distancia de frenado aumenta peligrosamente.',
        troubleshootingSteps: ['Paso 1: Revise el nivel del depósito de líquido de frenos.', 'Paso 2: Evite frenadas bruscas.', 'Paso 3: Lleve el vehículo a inspección inmediata.'],
        estimatedCostRange: '$65 - $150',
        specialistType: 'mecanico'
      };
    }
    if (p.includes('arranca') || p.includes('batería') || p.includes('prend') || p.includes('luces')) {
      return {
        possibleCauses: ['Batería con vida útil agotada (Sulfatación)', 'Alternador no carga correctamente', 'Bornes flojos o sucios'],
        urgency: 'Media',
        urgencyReason: 'Riesgo de quedar varado. El sistema eléctrico no mantiene la carga mínima.',
        troubleshootingSteps: ['Paso 1: Verifique si los bornes tienen polvo blanco/celeste.', 'Paso 2: Intente un arranque con cables auxiliares.', 'Paso 3: Mida el voltaje en un centro de baterías.'],
        estimatedCostRange: '$75 - $130',
        specialistType: 'mecanico'
      };
    }
  }

  // CATEGORÍA: TI / SERVIDORES / COMPUTACIÓN
  if (a.includes('servidor') || a.includes('pc') || a.includes('computadora') || a.includes('red')) {
    if (p.includes('lento') || p.includes('internet') || p.includes('caído') || p.includes('wifi')) {
      return {
        possibleCauses: ['Saturación de memoria RAM / Cache', 'Fallo en switch o ruteador de borde', 'Fragmentación de disco o virus'],
        urgency: 'Media',
        urgencyReason: 'Afecta la productividad. Si es un servidor, puede haber degradación de servicios críticos.',
        troubleshootingSteps: ['Paso 1: Reinicie el equipo y el ruteador.', 'Paso 2: Ejecute un test de velocidad.', 'Paso 3: Verifique cables de red (Ethernet).'],
        estimatedCostRange: '$40 - $120',
        specialistType: 'informatico'
      };
    }
    if (p.includes('disco') || p.includes('azul') || p.includes('volumen') || p.includes('raid')) {
      return {
        possibleCauses: ['Fallo físico de sector de disco duro', 'Corrupción de sistema de archivos', 'Fallo en controladora RAID'],
        urgency: 'Crítica',
        urgencyReason: 'Riesgo inminente de pérdida de datos permanente.',
        troubleshootingSteps: ['Paso 1: Apague el equipo para evitar más daños físicos.', 'Paso 2: No intente formatear.', 'Paso 3: Contacte soporte de datos urgente.'],
        estimatedCostRange: '$100 - $350',
        specialistType: 'informatico'
      };
    }
  }

  // CATEGORÍA: ENERGÍA (SOLAR / GENERADORES)
  if (a.includes('solar') || a.includes('panel') || a.includes('planta') || a.includes('generador')) {
    return {
      possibleCauses: ['Inversor en modo error', 'Baterías con carga profunda insuficiente', 'Transferencia automática pegada'],
      urgency: 'Alta',
      urgencyReason: 'Pérdida de respaldo energético. Puede afectar equipos sensibles conectados.',
      troubleshootingSteps: ['Paso 1: Verifique códigos de error en el display.', 'Paso 2: Revise niveles de combustible/aceite (si es planta).', 'Paso 3: Limpie los paneles (si es solar).'],
      estimatedCostRange: '$60 - $200',
      specialistType: a.includes('solar') ? 'especialista_solar' : 'electricista'
    };
  }

  // FALLBACK GENÉRICO PROFESIONAL
  return {
    possibleCauses: ['Necesidad de mantenimiento preventivo', 'Desgaste natural de piezas internas', 'Fallo en sensor de control'],
    urgency: 'Media',
    urgencyReason: 'El síntoma reportado sugiere una pérdida de eficiencia. Se recomienda inspección para evitar reparaciones costosas.',
    troubleshootingSteps: ['Paso 1: Reinicie el equipo.', 'Paso 2: Revise conexiones externas.', 'Paso 3: Solicite una cotización preventiva.'],
    estimatedCostRange: '$45 - $95',
    specialistType: 'mecanico'
  };
};

app.post('/api/diagnose', (req, res) => {
  const { assetName, problemDescription } = req.body;

  // Diagnóstico 100% Local y Privado (Sin dependencia de APIs externas/IA)
  console.log(`🔍 Procesando diagnóstico local para: ${assetName}`);

  const diagnostic = getSmartFallback(assetName || 'Equipo', problemDescription || 'Sin descripción');
  res.json(diagnostic);
});

app.post('/api/send-email', (req, res) => res.json({ success: true }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MantechPro: Diagnóstico Pseudo-Inteligente Activo en puerto ${PORT}`);
});
