import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import nodemailer from 'nodemailer';

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

app.post('/api/send-email', async (req, res) => {
  const { to, subject, assetName, title, dueDate, smtpConfig } = req.body;

  try {
    // Si no hay configuración SMTP, usamos un simulador de Etheral para pruebas
    let transporter;
    let isDemo = false;

    if (smtpConfig && smtpConfig.user && smtpConfig.pass) {
      transporter = nodemailer.createTransport({
        host: smtpConfig.host || 'smtp.gmail.com',
        port: parseInt(smtpConfig.port) || 587,
        secure: smtpConfig.secure || false,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
      });
    } else {
      // Fallback a cuenta de prueba de Ethereal
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isDemo = true;
    }

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">MantechPro: Alerta de Mantenimiento</h2>
        <p>Hola,</p>
        <p>Tu activo <strong>${assetName}</strong> requiere atención pronto.</p>
        <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">⚠️ Tarea: ${title}</p>
          <p style="margin: 5px 0 0 0; color: #b45309;">Fecha límite sugerida: ${dueDate}</p>
        </div>
        <p>Por favor, ingresa a la aplicación para cotizar con un técnico especializado.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">MantechPro Panamá - Sistema de Gestión Inteligente</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: smtpConfig?.from || '"MantechPro Alertas" <alertas@mantechpro.com>',
      to,
      subject,
      html: htmlContent,
    });

    console.log('✅ Correo enviado:', info.messageId);

    if (isDemo) {
      return res.json({
        success: true,
        isDemo: true,
        previewUrl: nodemailer.getTestMessageUrl(info)
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error enviando email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-report', async (req, res) => {
  const { to, reportData } = req.body;

  console.log(`📊 Generando reporte para: ${to}`);

  try {
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    };

    let transporter = nodemailer.createTransport(smtpConfig);

    const info = await transporter.sendMail({
      from: `"MantechPro Reportes" <${process.env.SMTP_USER}>`,
      to,
      subject: `Reporte Técnico - ${reportData.assetName}`,
      text: `Adjunto encontrará el reporte técnico de su servicio.`,
      html: `<h1>Reporte de Servicio</h1><p>Detalles del mantenimiento...</p>`
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Servir la aplicación (Frontend)
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MantechPro: Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✅ Módulo de Diagnóstico: Modo Experto Local Activo.`);
});
