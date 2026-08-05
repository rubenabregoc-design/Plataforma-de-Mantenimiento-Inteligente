import express from 'express';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { format, addDays, parseISO, differenceInCalendarDays, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

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
  try {
    const serviceAccountPath = path.join(process.cwd(), 'service-account.json');

    if (admin.apps.length === 0) {
      // Intentar cargar desde archivo local
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath)
        });
        console.log("✅ Sistema Operativo Mantech Pro: Firebase Admin Vinculado (Archivo).");
      } catch (err) {
        // Fallback: Intentar cargar desde variables de entorno si existen (Modo Cloud)
        if (process.env.FIREBASE_PROJECT_ID) {
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.FIREBASE_PROJECT_ID
          });
          console.log("✅ Sistema Operativo Mantech Pro: Firebase Admin Vinculado (Default).");
        } else {
          console.warn("⚠️ Advertencia: No se encontró 'service-account.json'. Las funciones de servidor que requieren Firestore no funcionarán.");
          // Inicializar app vacía para evitar crash fatal en arranque
          admin.initializeApp({
            projectId: "mantech-pro-placeholder"
          });
        }
      }
    }
  } catch (error) {
    console.error("❌ Error Crítico en Nodo Maestro (Firebase):", error);
  }
};

initFirebaseAdmin();

const db = admin.firestore();

// API KEY BREVO (MANTECH PRO)
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'b31b49001@smtp-brevo.com';
const SENDER_NAME = 'Mantech Pro Global';
const APP_URL = process.env.APP_URL || 'https://mantech-pro.com';

app.use(express.json({ limit: '10mb' }));

// Servir archivos estáticos del Frontend (React/Vite)
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

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
    timestamp: new Date().toISOString()
  });
});

// 2. Envío de Email de Bienvenida (Prueba)
app.post("/api/welcome-email", async (req, res) => {
  const { email, name } = req.body;
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY || '',
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email }],
        subject: "🚀 Bienvenido al Ecosistema MantechPro",
        htmlContent: `<h1>Hola ${name}</h1><p>Tu cuenta ha sido vinculada a MantechPro Panamá.</p>`
      })
    });
    res.json({ success: true, detail: "Email en cola de envío" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2.5 Contact Form Handler (Industrial Routing)
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message, type } = req.body;

  // Determinamos el destino basado en el tipo de consulta
  let destination = 'info@mantech-pro.com';
  if (type === 'support') destination = 'soporte@mantech-pro.com';
  if (type === 'jobs') destination = 'admin@mantech-pro.com';

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY || '',
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: `Portal Web: ${name}`, email: SENDER_EMAIL },
        to: [{ email: destination }],
        replyTo: { email: email, name: name },
        subject: `[WEB CONTACT] ${subject}`,
        htmlContent: `
          <div style="font-family: sans-serif; background: #0d0e12; color: #fff; padding: 40px; border-radius: 20px;">
            <h2 style="color: #5d3cfe;">Nueva Consulta desde mantech-pro.com</h2>
            <div style="background: #16171d; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <p><strong>Remitente:</strong> ${name} (${email})</p>
              <p><strong>Tipo:</strong> ${type}</p>
              <p><strong>Asunto:</strong> ${subject}</p>
              <hr style="border: 0; border-top: 1px solid #2a2b2f; margin: 20px 0;">
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="font-size: 10px; color: #474556; margin-top: 20px;">MantechPro Node V4.6 - Email Routing Engine</p>
          </div>
        `
      })
    });

    const result = await response.json();
    console.log("Brevo API Response:", result);

    if (!response.ok) throw new Error(JSON.stringify(result));

    res.json({ success: true });
  } catch (error: any) {
    console.error("Contact Form Error:", error);
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
  const { email, reportData } = req.body;

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

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY || '',
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email }],
        subject: `📊 Reporte Mensual MantechPro - ${reportData.month}`,
        htmlContent
      })
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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

        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "accept": "application/json", "api-key": BREVO_API_KEY, "content-type": "application/json" },
          body: JSON.stringify({
            sender: { name: SENDER_NAME, email: SENDER_EMAIL },
            to: [{ email: clientEmail }],
            subject: `🚨 ALERTA MANTECH PRO: Protocolo ${assetData.name || 'Mantenimiento'}`,
            htmlContent: html
          })
        });
        sentCount++;
      }
    }
    res.json({ success: true, alertsSent: sentCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta Catch-all: Para que el Frontend maneje el enrutamiento (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 MantechPro Server Nodo-V4 activo en puerto ${PORT}`);
});
