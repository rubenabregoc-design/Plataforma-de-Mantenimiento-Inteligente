import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Gemini Initialization
let aiClient: GoogleGenAI | null = null;
const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes('ESCRIBE_AQUI') || key.length < 10) return null;
  if (!aiClient) aiClient = new GoogleGenAI(key);
  return aiClient;
};

// Smart Fallback
const getSmartFallback = (asset: string, problem: string) => {
  const p = problem.toLowerCase();
  const a = asset.toLowerCase();
  let isAC = a.includes('aire') || a.includes('ac') || a.includes('split');
  let isCar = a.includes('carro') || a.includes('auto') || a.includes('toyota');

  return {
    possibleCauses: [
      isAC ? 'Filtros obstruidos por suciedad' : (isCar ? 'Nivel de aceite bajo' : 'Desgaste de componentes internos'),
      'Falla en el sensor de control electrónico',
      'Necesidad de mantenimiento preventivo profundo'
    ],
    urgency: 'Media',
    urgencyReason: 'El síntoma sugiere una pérdida de eficiencia operativa que debe ser atendida para evitar daños mayores.',
    troubleshootingSteps: [
      'Paso 1: Reinicie el equipo desconectándolo de la corriente por 2 minutos.',
      'Paso 2: Realice una inspección visual buscando goteos o ruidos extraños.',
      'Paso 3: Verifique que no haya obstrucciones en las entradas de aire.',
      'Paso 4: Contacte al técnico sugerido si el problema persiste.'
    ],
    estimatedCostRange: isAC ? '$35 - $65' : (isCar ? '$60 - $120' : '$45 - $90'),
    specialistType: isAC ? 'tecnico_ac' : (isCar ? 'mecanico' : 'mecanico'),
    isFallback: true
  };
};

app.post('/api/diagnose', async (req, res) => {
  const { assetName, assetDetails, problemDescription } = req.body;

  const ai = getGeminiClient();
  if (!ai) {
    console.log('⚠️ No API Key found. Using Smart Fallback.');
    return res.json(getSmartFallback(assetName, problemDescription));
  }

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: 'Eres un experto en mantenimiento en Panamá. Responde en JSON.',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `Diagnostica este problema para el activo "${assetName}" (${assetDetails}). Problema: ${problemDescription}. Responde con causas, urgencia, razón de urgencia, pasos de revisión y costo estimado en Panamá.`;
    const result = await model.generateContent(prompt);
    const response = JSON.parse(result.response.text());
    res.json(response);
  } catch (error: any) {
    console.error('❌ Gemini Error:', error.message);
    res.json(getSmartFallback(assetName, problemDescription));
  }
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, assetName, title, dueDate, smtpConfig } = req.body;
  try {
    let transporter;
    if (smtpConfig && smtpConfig.user && smtpConfig.pass) {
      transporter = nodemailer.createTransport({
        host: smtpConfig.host || 'smtp.gmail.com',
        port: parseInt(smtpConfig.port) || 587,
        secure: smtpConfig.port === '465',
        auth: { user: smtpConfig.user, pass: smtpConfig.pass }
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    }

    await transporter.sendMail({
      from: smtpConfig?.from || '"MantechPro Alertas" <alertas@mantechpro.com>',
      to, subject,
      html: `<h2>Alerta MantechPro</h2><p>Equipo: ${assetName}</p><p>Tarea: ${title}</p><p>Fecha: ${dueDate}</p>`
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Servir la aplicación
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
