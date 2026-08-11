// MantechPro Server Nodo-V4 - Live Production v4.8.7
import express from 'express';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { readFile } from 'fs/promises';
import { format, addDays, parseISO, differenceInCalendarDays, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de IA (Gemini)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AI_STUDIO_PLACEHOLDER");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Rate Limiting (Seguridad Senior)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "🚨 Demasiadas solicitudes. Nodo bloqueado temporalmente.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Configuración de Colores Mantech Pro (Master V4)
const BRAND_PRIMARY = '#5d3cfe'; // Púrpura Eléctrico
const BRAND_ACCENT = '#52ffac';  // Neón Mint
const BRAND_BG = '#0d0e12';      // Negro Nodo
const BRAND_CARD = '#16171d';    // Gris Carbón

// Inicializar Firebase Admin (Sincrónico para evitar errores de App No Encontrada)
const initFirebaseAdmin = () => {
  if (admin.apps.length > 0) return;

  const serviceAccountPath = path.join(process.cwd(), 'service-account.json');

  try {
    if (fs.existsSync(serviceAccountPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath)
      });
      console.log("✅ Ecosistema Mantech Pro: Firebase Admin Vinculado (Archivo Local).");
    } else {
      // Intentar inicialización por defecto (Cloud)
      admin.initializeApp();
      console.log("✅ Ecosistema Mantech Pro: Firebase Admin Vinculado (Nube/IAM).");
    }
  } catch (error: any) {
    console.warn("⚠️ Advertencia Firebase Admin:", error.message);
    // Fallback: Si falla la inicialización, intentamos inicializar sin credenciales (solo para desarrollo)
    try { admin.initializeApp(); } catch(e) {}
  }
};

initFirebaseAdmin();
const db = admin.firestore();

// CONFIGURACIÓN DE SMTP (BREVO MANTECH PRO)
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'info@mantech-pro.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'rubenabregoc@gmail.com';
const BREVO_KEY = process.env.BREVO_API_KEY || process.env.SMTP_PASS || '';

const mailTransporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: '85773a001@smtp-brevo.com', // Cuenta verificada Mantech
    pass: BREVO_KEY
  }
});

async function sendEmail({ to, subject, html, replyTo }: { to: string; subject: string; html: string; replyTo?: string }) {
  if (!BREVO_KEY) {
    console.error("❌ ERROR: BREVO_API_KEY no encontrada en las variables de entorno.");
    return { success: false, error: "API Key missing" };
  }

  try {
    const info = await mailTransporter.sendMail({
      from: `"Mantech Pro Global" <${SENDER_EMAIL}>`,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {})
    });
    console.log(`✅ Email enviado: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`❌ Error SMTP:`, err.message);
    throw err;
  }
}

app.use(express.json({ limit: '10mb' }));

// Servir archivos estáticos del Frontend (React/Vite)
// Usamos __dirname porque en producción el servidor está DENTRO de la carpeta dist
const staticPath = path.resolve(__dirname);
app.use(express.static(staticPath));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// --- NUEVAS FUNCIONES NODO-V4 ---

// 1. Diagnóstico de Salud del Servidor
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    nodo: "MantechPro-V4",
    firebase: admin.apps.length > 0 ? "connected" : "standalone",
    smtp_ready: !!process.env.BREVO_API_KEY,
    sender: process.env.SENDER_EMAIL,
    timestamp: new Date().toISOString()
  });
});

// 2. Envío de Email de Bienvenida (Prueba)
app.post("/api/welcome-email", async (req, res) => {
  const { email, name } = req.body;
  try {
    await sendEmail({
      to: email,
      subject: "🚀 Bienvenido al Ecosistema MantechPro",
      html: `<h1>Hola ${name}</h1><p>Tu cuenta ha sido vinculada a MantechPro Panamá.</p>`
    });
    res.json({ success: true, detail: "Email enviado correctamente" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2.5 Contact Form Handler (Resiliencia Extrema)
app.post("/api/contact", async (req, res) => {
  const { name, email, whatsapp, subject, message, type } = req.body;

  // Evitar crash por datos faltantes
  if (!name || !email) {
    return res.status(400).json({ success: false, error: "Nombre y Email son obligatorios" });
  }

  let destination = 'info@mantech-pro.com';
  let prefix = '[INFO - GLOBAL]';

  if (type === 'support') {
    destination = 'soporte@mantech-pro.com';
    prefix = '[SOPORTE - TÉCNICO]';
  } else if (type === 'jobs') {
    destination = 'admin@mantech-pro.com';
    prefix = '[RRHH - TALENTO]';
  }

  const targetEmail = ADMIN_EMAIL || destination;

  // EJECUCIÓN ASÍNCRONA PARA NO BLOQUEAR AL USUARIO
  // Intentamos registrar y enviar, pero devolvemos éxito rápido para evitar timeout 500
  res.json({ success: true, message: "Protocolo de recepción iniciado" });

  try {
    // 1. Registro en Base de Datos (Safe)
    db.collection("support_tickets").add({
      userName: name,
      userEmail: email,
      whatsapp: whatsapp || 'N/A',
      subject: subject || 'Consulta Web',
      message: message || '',
      type: type || 'general',
      status: 'new',
      source: 'web_portal',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }).catch(e => console.error("⚠️ Firestore Error:", e.message));

    // 2. Notificación al Admin
    await sendEmail({
      to: targetEmail,
      replyTo: email,
      subject: `${prefix} ${subject}: ${name}`,
      html: `<h2>Nuevo Mensaje</h2><p><strong>De:</strong> ${name}</p><p><strong>Msg:</strong> ${message}</p>`
    }).catch(e => console.error("⚠️ SMTP Admin Error:", e.message));

    // 3. Auto-respuesta al Cliente
    await sendEmail({
      to: email,
      subject: `MantechPro: Recibido - ${name}`,
      html: `<p>Hola ${name}, hemos recibido tu mensaje correctamente.</p>`
    }).catch(e => console.error("⚠️ SMTP Auto Error:", e.message));

  } catch (error: any) {
    console.error("🔥 Error Silencioso en Proceso de Contacto:", error.message);
  }
});

    res.json({ success: true });
  } catch (error: any) {
    console.error("Contact Form Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2.6 Admin Ticket Reply Handler (Premium Template)
app.post("/api/admin/reply-ticket", async (req, res) => {
  const { name, email, subject, message, originalMessage } = req.body;

  try {
    await sendEmail({
      to: email,
      subject: `Respuesta Oficial MantechPro: ${subject}`,
      html: `
        <div style="background-color: #0a0b0d; padding: 40px 20px; font-family: 'Segoe UI', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #121317; border: 1px solid #2a2b2f; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            <!-- Header -->
            <div style="background-color: #1c1d21; padding: 40px; text-align: center; border-bottom: 2px solid #5d3cfe;">
               <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">
                MANTECH<span style="color: #5d3cfe;">PRO</span>
               </h1>
               <p style="color: #52ffac; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-top: 10px;">Comunicación Industrial Autorizada</p>
            </div>

            <div style="padding: 50px; color: #ffffff;">
               <div style="margin-bottom: 35px;">
                  <span style="color: #5d3cfe; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Asunto del Requerimiento</span>
                  <h2 style="font-size: 22px; font-weight: 800; margin: 10px 0 0 0; color: #ffffff;">RE: ${subject}</h2>
               </div>

               <!-- Mensaje de Respuesta -->
               <div style="margin-bottom: 45px;">
                  <p style="color: #ffffff; font-size: 16px; line-height: 1.8; margin: 0; white-space: pre-wrap;">
                    ${message}
                  </p>
               </div>

               <!-- Contexto de la Consulta Original -->
               <div style="background-color: #0d0e12; border-radius: 16px; padding: 30px; border: 1px solid #1c1d21;">
                  <div style="display: flex; align-items: center; margin-bottom: 15px;">
                     <div style="width: 4px; height: 15px; background-color: #474556; margin-right: 10px;"></div>
                     <span style="font-size: 10px; color: #474556; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Consulta Original de ${name}</span>
                  </div>
                  <p style="color: #8a879d; font-size: 14px; line-height: 1.6; font-style: italic; margin: 0;">
                    "${originalMessage}"
                  </p>
               </div>

               <!-- Firma Corporativa -->
               <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #2a2b2f;">
                  <table style="width: 100%;">
                    <tr>
                      <td>
                        <p style="color: #ffffff; font-size: 14px; font-weight: 700; margin: 0;">Departamento de Soporte Estratégico</p>
                        <p style="color: #474556; font-size: 12px; margin: 5px 0 0 0;">MantechPro Industries Panamá</p>
                      </td>
                    </tr>
                  </table>
               </div>
            </div>

            <!-- Footer con Enlaces Rápidos -->
            <div style="background-color: #0d0e12; padding: 30px; text-align: center; border-top: 1px solid #1c1d21;">
               <div style="margin-bottom: 20px;">
                  <a href="https://mantech-pro.com" style="color: #5d3cfe; font-size: 10px; font-weight: 900; text-decoration: none; text-transform: uppercase; margin: 0 15px;">Portal Web</a>
                  <span style="color: #1c1d21;">|</span>
                  <a href="https://wa.me/${whatsapp?.replace(/\D/g,'') || '50760000000'}" style="color: #52ffac; font-size: 10px; font-weight: 900; text-decoration: none; text-transform: uppercase; margin: 0 15px;">WhatsApp Directo</a>
               </div>
               <p style="color: #1c1d21; font-size: 8px; font-weight: bold; text-transform: uppercase; margin: 0;">© 2026 MantechPro Industries. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      `
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Motor de Diagnóstico IA (Gemini 1.5 Flash)
app.post("/api/diagnose", async (req, res) => {
  const { assetName, assetDetails, problemDescription } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key no configurada." });
  }

  try {
    const prompt = `Actúa como un experto en ingeniería industrial y mecánica.
    Analiza el siguiente fallo en un equipo en Panamá:
    Equipo: ${assetName}
    Detalles: ${assetDetails}
    Descripción del problema: ${problemDescription}

    Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
    {
      "cause": "Descripción breve de la causa probable",
      "prevention": "Cómo evitar que vuelva a suceder",
      "damage": "Daños potenciales si no se repara",
      "urgency": "Crítica | Alta | Media",
      "cost": "Rango de costo estimado en USD (ej: $40 - $100)",
      "specialist": "mecanico | tecnico_ac | electricista | informatico | plomero"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpiar el texto si Gemini devuelve markdown (```json ... ```)
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(jsonStr));
  } catch (error: any) {
    console.error("IA Diagnose Error:", error);
    res.status(500).json({ error: "Error en el procesamiento de IA" });
  }
});

// 4. Envío de Reporte de Cierre Mensual
app.post("/api/send-report", async (req, res) => {
  const { email, to, reportData } = req.body;
  const recipient = to || email || ADMIN_EMAIL;

  try {
    const htmlContent = `
      <div style="font-family: sans-serif; background: #0d0e12; color: #fff; padding: 40px; border-radius: 20px;">
        <h1 style="color: ${BRAND_PRIMARY};">Reporte de Cierre: ${reportData.month} ${reportData.year}</h1>
        <div style="background: #16171d; padding: 20px; border-radius: 10px;">
          <p><strong>Comisiones Totales:</strong> $${reportData.totalCommissions}</p>
          <p><strong>Membresías:</strong> $${reportData.totalSubscriptions}</p>
          <p><strong>Utilidad Neta:</strong> $${reportData.netUtility}</p>
        </div>
        <p style="font-size: 10px; color: #474556; margin-top: 20px;">Generado por MantechPro Master Server</p>
      </div>
    `;

    await sendEmail({
      to: recipient,
      subject: `📊 Reporte Mensual MantechPro - ${reportData.month}`,
      html: htmlContent
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Simulación de Notificaciones Push (Para Web & Mobile Debug)
app.post("/api/push-notification", async (req, res) => {
  const { userId, title, body } = req.body;
  console.log(`📲 PUSH EMITIDA -> Usuario: ${userId} | ${title}: ${body}`);

  try {
    res.json({ success: true, status: "simulated" });
  } catch (e) {
    res.json({ success: false });
  }
});

// --- PLANTILLA EXCLUSIVA: PLATAFORMA DE MANTENIMIENTO INTELIGENTE ---
const emailTemplates = {
  maintenanceAlert: (data: any) => `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BRAND_BG}; color: #ffffff; padding: 30px; border-radius: 24px; border: 1px solid #1c1d21;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -1px;">
          MANTECH<span style="color: ${BRAND_PRIMARY};">PRO</span>
        </h1>
        <p style="color: ${BRAND_ACCENT}; font-size: 9px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; margin-top: 5px;">Plataforma de Mantenimiento Inteligente</p>
      </div>

      <div style="background-color: ${BRAND_CARD}; padding: 35px; border-radius: 20px; border: 1px solid #2a2b2f;">
        <h2 style="color: #ffffff; margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase;">🚨 Alerta de Protocolo</h2>

        <p style="color: #c8c4d9; font-size: 14px; line-height: 1.6;">
          Se ha detectado una proximidad de mantenimiento crítico para la unidad operativa en <strong>${data.location}</strong>.
        </p>

        <div style="margin: 30px 0; background: #0d0e12; border-radius: 16px; padding: 20px; border-left: 4px solid ${BRAND_ACCENT};">
          <table style="width: 100%; border-collapse: collapse; color: #ffffff;">
            <tr>
              <td style="padding: 10px 0; font-size: 11px; color: #474556; text-transform: uppercase; font-weight: 900;">Activo</td>
              <td style="padding: 10px 0; font-size: 14px; font-weight: 700;">${data.assetName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 11px; color: #474556; text-transform: uppercase; font-weight: 900;">Fecha Objetivo</td>
              <td style="padding: 10px 0; font-size: 14px; color: ${BRAND_PRIMARY}; font-weight: 900;">${data.date}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 11px; color: #474556; text-transform: uppercase; font-weight: 900;">Estatus</td>
              <td style="padding: 10px 0; font-size: 13px;"><span style="color: ${BRAND_ACCENT}; font-weight: bold;">●</span> ${data.statusLabel}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 11px; color: #474556; text-transform: uppercase; font-weight: 900;">Especialista</td>
              <td style="padding: 10px 0; font-size: 14px; color: #cbd5e1;">${data.engineer}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${APP_URL}" style="background-color: ${BRAND_PRIMARY}; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Acceder al Nodo de Control</a>
        </div>
      </div>

      <div style="text-align: center; padding: 30px 10px; color: #474556; font-size: 9px; text-transform: uppercase; letter-spacing: 1px;">
        MantechPro Industries Panamá • Sistema de Alerta Temprana v4.0 <br>
        © 2026 Registro de Propiedad Intelectual
      </div>
    </div>
  `
};

// CRON: Escáner de Mantenimientos Mantech Pro
app.get("/api/cron/maintenance-alerts", async (req, res) => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const hoyPanama = new Date(utc + (3600000 * -5));

  try {
    const remindersSnap = await db.collection("reminders").get();
    const assetsSnap = await db.collection("assets").get();
    const assetsMap = new Map();
    assetsSnap.forEach(doc => assetsMap.set(doc.id, doc.data()));

    let sentCount = 0;

    for (const doc of remindersSnap.docs) {
      const data = doc.data();
      if (data.status === 'completed' || !data.dueDate) continue;

      const fechaEvento = parseISO(data.dueDate);
      const diasRestantes = differenceInCalendarDays(fechaEvento, hoyPanama);

      // Lógica de Alerta: 15 días, 5 días o Hoy
      const diaSemana = getDay(hoyPanama);
      const targets = [15, 5, 0];
      if (diaSemana === 5) targets.push(1, 2, 3); // Lunes 27 y fin de semana

      if (targets.includes(diasRestantes)) {
        let clientEmail = "rubenabregoc@gmail.com";
        if (data.clientId) {
          const userDoc = await db.collection("users").doc(data.clientId).get();
          if (userDoc.exists) clientEmail = userDoc.data()?.email || clientEmail;
        }

        const assetData = assetsMap.get(data.assetId) || {};

        const html = emailTemplates.maintenanceAlert({
          location: assetData.location || "Central Operativa",
          assetName: assetData.name || data.title,
          date: format(fechaEvento, "EEEE, dd 'de' MMMM", { locale: es }),
          statusLabel: diasRestantes === 0 ? "EJECUCIÓN HOY" : `FALTAN ${diasRestantes} DÍAS`,
          engineer: assetData.driverName || "Operador Élite"
        });

        await sendEmail({
          to: clientEmail,
          subject: `🚨 ALERTA MANTECH PRO: Protocolo ${assetData.name || 'Mantenimiento'}`,
          html
        });
        sentCount++;
      }
    }
    res.json({ success: true, alertsSent: sentCount });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ruta Catch-all: Para que el Frontend maneje el enrutamiento (SPA)
app.get('*', (req, res) => {
  // Protocolo Anti-Caché para el index.html (Evita errores de MIME type en actualizaciones)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 MantechPro Server Nodo-V4 activo en puerto ${PORT}`);
});
