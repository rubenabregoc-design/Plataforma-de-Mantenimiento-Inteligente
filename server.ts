import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// CORS headers to allow communication with the frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Full fidelity Email dispatch endpoint
app.post('/api/send-email', async (req, res) => {
  const { to, subject, assetName, title, dueDate, smtpConfig } = req.body;
  
  const recipient = to || 'rubenabregoc@gmail.com';
  const mailSubject = subject || `⚠️ Alerta Crítica para tu Activo: ${assetName}`;
  
  const smtpUser = (smtpConfig && smtpConfig.user) || process.env.SMTP_USER;
  const smtpPass = (smtpConfig && smtpConfig.pass) || process.env.SMTP_PASS;
  const smtpHost = (smtpConfig && smtpConfig.host) || process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt((smtpConfig && smtpConfig.port) || process.env.SMTP_PORT || '587');
  const smtpSecure = (smtpConfig && smtpConfig.secure !== undefined) ? smtpConfig.secure : (process.env.SMTP_SECURE === 'true');
  const smtpFrom = (smtpConfig && smtpConfig.from) || process.env.SMTP_FROM;
  
  let transporter;
  let isDemoAccount = false;
  let testMessageUrl = '';

  try {
    if (smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        }
      });
    } else {
      console.log('No direct credentials found. Creating simulated/live Ethereal email account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        }
      });
      isDemoAccount = true;
    }

    const appUrl = process.env.APP_URL || 'https://ais-pre-q5pynj3k6zdoqc7lcyuar3-224952098429.us-west1.run.app';

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; padding: 40px 10px; margin: 0; width: 100%;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e1e8ed; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header Accent Banner -->
          <div style="background-color: #4f46e5; background-image: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; font-family: sans-serif;">Mantech<span style="color: #a5b4fc;">Pro</span></h1>
            <p style="color: #c7d2fe; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 4px 0 0 0; font-family: sans-serif;">Inteligencia Predictiva de Activos</p>
          </div>
          
          <!-- Content Body -->
          <div style="padding: 32px 24px; color: #1f2937; line-height: 1.6; font-family: sans-serif;">
            <p style="font-size: 15px; margin-top: 0;">Estimado/a <strong>Rubén Ábrego</strong>,</p>
            
            <p style="font-size: 14px;">Hemos detectado mediante nuestra bitácora automatizada de mantenimiento predictivo que tu equipo requiere atención técnica urgente.</p>
            
            <!-- Asset Alert Box -->
            <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding-bottom: 8px; font-size: 11px; font-weight: bold; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; font-family: sans-serif;">🚨 Alerta Preventiva</td>
                </tr>
                <tr>
                  <td style="font-size: 16px; font-weight: 800; color: #1e1b4b; padding-bottom: 6px; font-family: sans-serif;">${title}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #4b5563; font-family: sans-serif;"><strong>Activo afectado:</strong> ${assetName}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #4b5563; font-family: sans-serif;"><strong>Periodicidad sugerida:</strong> ${dueDate || 'De inmediato'}</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 14px; margin-bottom: 24px;">Para facilitarte la solución, nuestro sistema ha enrutado tu requerimiento con especialistas certificados con valoraciones de 5 estrellas en Ciudad de Panamá. Puedes revisar y agendar el servicio directo con un solo toque:</p>
            
            <!-- Call To Action Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${appUrl}" style="background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14.5px 32px; font-size: 13px; font-weight: bold; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.15); font-family: sans-serif;">
                ⚡ Agendar Visita Técnica en 1-Clic
              </a>
            </div>
            
            <p style="font-size: 11px; color: #6b7280; text-align: center; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px; font-family: sans-serif;">
              Este es un correo interactivo automático de MantechPro.<br/>
              Si resides en Ciudad de Panamá, puedes desasociar activos en tu aplicación en cualquier momento.
            </p>
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: smtpFrom || (smtpUser ? `"MantechPro Alertas" <${smtpUser}>` : '"MantechPro Alertas" <alertas@mantechpro.com>'),
      to: recipient,
      subject: mailSubject,
      html: htmlContent
    });

    if (isDemoAccount) {
      testMessageUrl = nodemailer.getTestMessageUrl(info) || '';
      console.log('Simulated email sent! URL:', testMessageUrl);
    }

    res.json({
      success: true,
      recipient: recipient,
      isDemo: isDemoAccount,
      previewUrl: testMessageUrl,
      messageId: info.messageId,
      message: isDemoAccount 
        ? 'Correo simulado procesado exitosamente vía red de demostración' 
        : '¡Correo real despachado de forma exitosa a la bandeja del cliente!'
    });

  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Fallo al procesar o transmitir alerta por correo', details: error.message });
  }
});

// Lazy initializer for Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.includes('ESCRIBE_AQUI')) {
    return null;
  }

  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI(key);
    } catch (e) {
      console.error('Error al inicializar Google AI:', e);
      return null;
    }
  }
  return aiClient;
}

// AI Diagnostic API route
app.post('/api/diagnose', async (req, res) => {
  const { assetName, assetDetails, problemDescription, userPhoto } = req.body;

  if (!assetName || !problemDescription) {
    res.status(400).json({ error: 'Faltan campos obligatorios: assetName, problemDescription' });
    return;
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Graceful fallback when GEMINI_API_KEY is not configured
    console.log('GEMINI_API_KEY limit or placeholder. Returning graceful simulation.');
    
    // Custom smart simulation based on basic keyword matching
    let isAC = assetName.toLowerCase().includes('aire') || assetName.toLowerCase().includes('ac') || assetName.toLowerCase().includes('split') || problemDescription.toLowerCase().includes('frío') || problemDescription.toLowerCase().includes('agua');
    let isCar = assetName.toLowerCase().includes('carro') || assetName.toLowerCase().includes('auto') || assetName.toLowerCase().includes('yaris') || assetName.toLowerCase().includes('toyota') || problemDescription.toLowerCase().includes('aceite') || problemDescription.toLowerCase().includes('ruido') || problemDescription.toLowerCase().includes('motor');
    let isIT = assetName.toLowerCase().includes('servidor') || assetName.toLowerCase().includes('computadora') || assetName.toLowerCase().includes('pc') || problemDescription.toLowerCase().includes('red') || problemDescription.toLowerCase().includes('lento') || problemDescription.toLowerCase().includes('servidor');
    let isSolar = assetName.toLowerCase().includes('solar') || assetName.toLowerCase().includes('panel') || problemDescription.toLowerCase().includes('batería') || problemDescription.toLowerCase().includes('inversor');
    
    let simulatedResponse = {
      possibleCauses: [
        'Filtros de aire acumulados con suciedad u obstrucción física parcial.',
        'Fluctuación de voltaje o relé de control electrónico desgastado.',
        'Necesidad de calibración técnica de fluidos/parámetro térmico.'
      ],
      urgency: 'Media',
      urgencyReason: 'El síntoma reportado compromete la eficiencia operativa pero no presenta riesgo inminente de cortocircuito o incendio.',
      troubleshootingSteps: [
        'Paso 1: Desconecte la alimentación general eléctrica del equipo por 2 minutos para restablecer el procesador interno.',
        'Paso 2: Realice una inspección visual general buscando goteos, manchas de hollín o sonidos extraños al encender.',
        'Paso 3: Verifique si los filtros están visibles y límpielos suavemente con agua a temperatura ambiente.',
        'Paso 4: Si continúa la anomalía, evite forzar el encendido y contacte al técnico calificado.'
      ],
      estimatedCostRange: '$35.00 - $75.00',
      specialistType: isAC ? 'tecnico_ac' : (isCar ? 'mecanico' : (isIT ? 'informatico' : (isSolar ? 'especialista_solar' : 'mecanico'))),
      isFallback: true
    };

    if (isAC) {
      simulatedResponse.possibleCauses = [
        'Filtro de aire sumamente obstruido por polvo del ambiente.',
        'Fuga lenta de gas refrigerante R410A en las conexiones del serpentín.',
        'Bandeja de drenaje obstruida con algas o sedimentos causando goteo interno.'
      ];
      simulatedResponse.urgency = 'Alta';
      simulatedResponse.urgencyReason = 'La falta de flujo de aire o congelamiento puede sobrecargar el compresor inverter causando daños muy costosos.';
      simulatedResponse.troubleshootingSteps = [
        'Paso 1: Apague el aire inmediatamente para evitar que se congele el serpentín.',
        'Paso 2: Abra la cubierta frontal y verifique visualmente si los filtros de plástico están opacos de suciedad.',
        'Paso 3: Revise el tubo exterior de drenaje para ver si está soltando gotas de agua libremente.',
        'Paso 4: Mantenga el breaker desconectado durante la espera del profesional especializado.'
      ];
      simulatedResponse.estimatedCostRange = '$25.00 - $60.00 USD';
    } else if (isCar) {
      simulatedResponse.possibleCauses = [
        'Nivel de lubricante bajo o viscosidad de aceite degradada.',
        'Filtro de aire del motor saturado de partículas.',
        'Desgaste en la faja de accesorios o tensor debilitado.'
      ];
      simulatedResponse.urgency = 'Media';
      simulatedResponse.urgencyReason = 'Recomendado atención preventiva antes de realizar viajes largos para evitar fricción severa en cilindros.';
      simulatedResponse.troubleshootingSteps = [
        'Paso 1: Estacione el vehículo en una superficie complementamente plana y espere 15 minutos con el motor apagado.',
        'Paso 2: Retire la varilla de medición de aceite, límpiela con un paño limpio, reinfrodúzcala y verifique el nivel.',
        'Paso 3: Inspeccione visualmente el depósito de refrigerante de motor (radiador frío) verificando que esté entre el MIN y MAX.',
        'Paso 4: Revise el tablero del auto buscando luces indicadoras de advertencia (Check Engine).'
      ];
      simulatedResponse.estimatedCostRange = '$60.00 - $110.00';
    } else if (isIT) {
      simulatedResponse.possibleCauses = [
        'Bloqueo térmico por ventiladores saturados de partículas finas.',
        'Fuga de batería de respaldo (UPS) o capacitores inflados.',
        'Fragmentación lógica de disco o fallo de disco duro mecánico redundante.'
      ];
      simulatedResponse.urgency = 'Crítica';
      simulatedResponse.urgencyReason = 'Fallo térmico o de alimentación en servidores puede ocasionar corrupción irreversible de base de datos corporativos.';
      simulatedResponse.troubleshootingSteps = [
        'Paso 1: Monitoree el panel frontal de LEDs para identificar luz ámbar o indicadores de falla de disco/fuente.',
        'Paso 2: Compruebe el flujo de aire libre en la rejilla del rack o chasís posterior.',
        'Paso 3: Verifique si el suministro del UPS emite alertas de batería de soporte agotada.',
        'Paso 4: Tenga a mano la bitácora de copias de seguridad activas antes de cualquier reinicio físico.'
      ];
      simulatedResponse.estimatedCostRange = '$80.00 - $250.00';
    }

    res.json(simulatedResponse);
    return;
  }

  try {
    const promptInstructions = `
      Eres un Ingeniero Experto en Diagnóstico de Mantenimiento de Equipos e Infraestructura.
      Analiza la siguiente descripción técnica sobre un equipo/activo y sugiere un reporte inteligente estructurado.
      
      Equipo principal: ${assetName}
      Detalles del equipo: ${assetDetails || 'Sin especificaciones'}
      Problema descrito: ${problemDescription}
      
      Debes proveer las causas probables, el nivel de urgencia, recomendaciones de auto-revisión básicas que el cliente puede hacer con seguridad, un rango de precios estimado del mercado de Panamá en dólares, y sugerir la categoría adecuada de técnico que resolvería esto.
    `;

    // Supporting base64 images if supplied by the diagnostic client:
    let parts: any[] = [];
    if (userPhoto && userPhoto.startsWith('data:image/')) {
      const mimeType = userPhoto.split(';')[0].split(':')[1];
      const base64Data = userPhoto.split(',')[1];
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }
    parts.push({ text: promptInstructions });

    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: 'Analiza el problema de mantenimiento reportado de forma profesional, clara y en español.',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['possibleCauses', 'urgency', 'urgencyReason', 'troubleshootingSteps', 'estimatedCostRange', 'specialistType'],
          properties: {
            possibleCauses: {
              type: Type.ARRAY,
              description: 'Lista de 3 a 4 causas probables de la falla o el síntoma descrito.',
              items: { type: Type.STRING }
            },
            urgency: {
              type: Type.STRING,
              description: 'El nivel de urgencia estimado. Debe ser estrictamente entre "Baja", "Media", "Alta" o "Crítica".'
            },
            urgencyReason: {
              type: Type.STRING,
              description: 'Explicación del porqué de la urgencia de forma comprensible para el cliente.'
            },
            troubleshootingSteps: {
              type: Type.ARRAY,
              description: 'Pizcas o acciones seguras de auto-revisión que el cliente puede realizar para diagnosticar o mitigar temporalmente sin riesgo eléctrico/químico.',
              items: { type: Type.STRING }
            },
            estimatedCostRange: {
              type: Type.STRING,
              description: 'Una cotización preliminar razonable en dólares de lo que cobrarían en el mercado promedio (ej: "$50 - $90").'
            },
            specialistType: {
              type: Type.STRING,
              description: 'La categoría que mejor resuelve el caso. Debe ser uno de los siguientes valores exactos: "tecnico_ac", "mecanico", "plomero", "electricista", "informatico", "especialista_solar".'
            }
          }
        }
      }
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: parts }]
    });

    const responseText = result.response.text();
    const parsedJson = JSON.parse(responseText || '{}');
    res.json(parsedJson);
  } catch (error: any) {
    console.error('Gemini API diagnostic failure, switching to simulation: ', error);

    // Fallback simulation in case of API error (Rate limit, invalid key, etc.)
    const assetName = req.body.assetName || '';
    const problemDescription = req.body.problemDescription || '';

    let isAC = assetName.toLowerCase().includes('aire') || assetName.toLowerCase().includes('ac') || assetName.toLowerCase().includes('split');
    let isCar = assetName.toLowerCase().includes('carro') || assetName.toLowerCase().includes('auto');

    const simulatedResponse = {
      possibleCauses: [
        'Desgaste por uso acumulado en componentes internos.',
        'Necesidad de mantenimiento preventivo profundo.',
        'Posible falla en sensores de control electrónico.'
      ],
      urgency: 'Media',
      urgencyReason: 'El síntoma reportado sugiere una degradación que requiere atención para evitar daños mayores.',
      troubleshootingSteps: [
        'Paso 1: Desconecte el equipo de la red eléctrica por 5 minutos.',
        'Paso 2: Realice una inspección visual buscando fugas o ruidos extraños.',
        'Paso 3: Verifique si hay obstrucciones en los filtros o entradas de aire.',
        'Paso 4: Si el problema persiste, contacte al técnico sugerido.'
      ],
      estimatedCostRange: '$45.00 - $85.00',
      specialistType: isAC ? 'tecnico_ac' : (isCar ? 'mecanico' : 'mecanico'),
      isFallback: true
    };

    res.json(simulatedResponse);
  }
});

// Configure delivery
async function run() {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));

  // For production builds (SPA)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server API ready at http://localhost:${PORT}`);
    console.log(`🤖 Gemini AI Mode: ${process.env.GEMINI_API_KEY ? 'Active' : 'Simulation'}`);
  });
}

run().catch(err => {
  console.error('Failure starting Express server:', err);
});
