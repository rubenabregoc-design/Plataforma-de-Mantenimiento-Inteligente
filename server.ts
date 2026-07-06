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

// Lógica de "Smart Fallback" para que el diagnóstico sea coherente sin IA
const getSmartFallback = (asset: string, problem: string) => {
  const p = problem.toLowerCase();
  const a = asset.toLowerCase();

  console.log('⚡ Activando Smart Fallback para un diagnóstico coherente...');

  // Caso 1: Incendio / Cortocircuito (Crítico)
  if (p.includes('fuego') || p.includes('humo') || p.includes('chispas') || p.includes('quemado')) {
    return {
      possibleCauses: ['Cortocircuito en bobinado primario', 'Fallo crítico de aislamiento', 'Sobrecalentamiento por obstrucción'],
      urgency: 'Crítica',
      urgencyReason: 'Existe un riesgo inminente de incendio o descarga eléctrica fatal. El síntoma de fuego indica daño severo en componentes.',
      troubleshootingSteps: ['Paso 1: Corte la electricidad desde el breaker principal.', 'Paso 2: Use extintor tipo C si es necesario.', 'Paso 3: No intente encenderlo de nuevo.'],
      estimatedCostRange: '$80 - $250 (Requiere piezas nuevas)',
      specialistType: a.includes('aire') ? 'tecnico_ac' : 'electricista'
    };
  }

  // Caso 2: Agua / Goteo
  if (p.includes('agua') || p.includes('gotea') || p.includes('mojado')) {
    return {
      possibleCauses: ['Obstrucción en línea de drenaje', 'Congelamiento de serpentín', 'Fisura en bandeja'],
      urgency: 'Alta',
      urgencyReason: 'El agua puede dañar componentes electrónicos cercanos y causar moho en las paredes.',
      troubleshootingSteps: ['Paso 1: Coloque un recipiente para capturar el agua.', 'Paso 2: Verifique que el equipo esté nivelado.', 'Paso 3: Limpie los filtros de aire.'],
      estimatedCostRange: '$35 - $65',
      specialistType: 'tecnico_ac'
    };
  }

  // Fallback Genérico Profesional
  return {
    possibleCauses: ['Desgaste natural de componentes', 'Fallo en sistema de control', 'Necesidad de mantenimiento preventivo'],
    urgency: 'Media',
    urgencyReason: 'El síntoma reportado sugiere una pérdida de eficiencia técnica. Se recomienda inspección para evitar daños mayores.',
    troubleshootingSteps: ['Paso 1: Reinicie el equipo.', 'Paso 2: Revise cables externos.', 'Paso 3: Contacte un especialista.'],
    estimatedCostRange: '$40 - $90',
    specialistType: a.includes('aire') ? 'tecnico_ac' : 'mecanico'
  };
};

app.post('/api/diagnose', async (req, res) => {
  const { assetName, problemDescription } = req.body;
  res.json(getSmartFallback(assetName, problemDescription));
});

app.post('/api/send-email', (req, res) => res.json({ success: true }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MantechPro: Diagnóstico Pseudo-Inteligente Activo en puerto ${PORT}`);
});
