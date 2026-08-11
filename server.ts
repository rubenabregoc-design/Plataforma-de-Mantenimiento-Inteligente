// MantechPro Server Nodo-V4 - Live Production v6.0.3
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

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "🚨 Demasiadas solicitudes. Nodo bloqueado temporalmente.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Inicializar Firebase Admin (Blindado)
const initFirebase = () => {
  if (admin.apps.length > 0) return admin.firestore();

  try {
    const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccountPath) });
      console.log("✅ Firebase Vinculado (Local)");
    } else {
      admin.initializeApp();
      console.log("✅ Firebase Vinculado (Cloud)");
    }
  } catch (e: any) {
    console.warn("⚠️ Firebase Init Warning:", e.message);
    try { admin.initializeApp(); } catch(err) {}
  }
  return admin.firestore();
};

const db = initFirebase();

// CONFIGURACIÓN DE SMTP
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'info@mantech-pro.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'rubenabregoc@gmail.com';
const BREVO_KEY = process.env.BREVO_API_KEY || '';

const mailTransporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: '85773a001@smtp-brevo.com',
    pass: BREVO_KEY
  }
});

async function sendEmail({ to, subject, html, replyTo }: any) {
  if (!BREVO_KEY) {
    console.error("❌ ERROR: BREVO_API_KEY faltante");
    return;
  }
  try {
    const info = await mailTransporter.sendMail({
      from: `"Mantech Pro Global" <${SENDER_EMAIL}>`,
      to, subject, html, ...(replyTo ? { replyTo } : {})
    });
    console.log(`✅ Email a ${to} enviado: ${info.messageId}`);
  } catch (err: any) {
    console.error(`❌ SMTP Error a ${to}:`, err.message);
  }
}

app.use(express.json({ limit: '10mb' }));
const staticPath = path.resolve(__dirname);
app.use(express.static(staticPath));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// --- ENDPOINTS ---

app.get("/api/health", (req, res) => {
  res.json({ status: "online", node: "MantechPro-V6", time: new Date().toISOString() });
});

// API CONTACTO (A prueba de balas)
app.post("/api/contact", async (req, res) => {
  const { name, email, whatsapp, subject, message, type } = req.body;

  if (!name || !email) return res.status(400).json({ success: false, error: "Datos incompletos" });

  // 1. Respuesta inmediata al cliente
  res.json({ success: true, message: "Captado" });

  // 2. Procesamiento en segundo plano (No bloquea el res.json)
  const isJob = type === 'jobs';
  const prefix = isJob ? '[TALENTO]' : '[SOPORTE]';

  // Registrar en DB
  db.collection("support_tickets").add({
    userName: name, userEmail: email, whatsapp: whatsapp || '',
    subject: subject || 'Consulta', message: message || '',
    type: type || 'general', status: 'new', createdAt: admin.firestore.FieldValue.serverTimestamp()
  }).catch(e => console.error("🔥 DB Error:", e.message));

  // Email al Admin
  sendEmail({
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `${prefix} ${subject || 'Contacto'}: ${name}`,
    html: `<div style="background:#0d0e12; color:#fff; padding:30px; border-radius:20px; font-family:sans-serif;">
            <h1 style="color:#5d3cfe;">MantechPro Auditoría</h1>
            <p><strong>De:</strong> ${name} (${email})</p>
            <p><strong>WhatsApp:</strong> ${whatsapp || 'N/A'}</p>
            <div style="background:#16171d; padding:20px; border-radius:10px; border-left:4px solid #5d3cfe;">
              ${message}
            </div>
          </div>`
  });

  // Email de cortesía al Cliente
  sendEmail({
    to: email,
    subject: isJob ? 'MantechPro: Postulación Recibida' : 'MantechPro: Hemos recibido tu consulta',
    html: `<div style="background:#0d0e12; color:#fff; padding:30px; border-radius:20px; font-family:sans-serif; text-align:center;">
            <h1 style="color:#52ffac;">¡Hola, ${name.split(' ')[0]}!</h1>
            <p>Tu información ha sido procesada con éxito. Un especialista te contactará pronto.</p>
            <div style="margin-top:20px; color:#474556; font-size:10px;">PANAMÁ • MANTECHPRO INDUSTRIES</div>
          </div>`
  });
});

app.post("/api/admin/reply-ticket", async (req, res) => {
  const { name, email, subject, message, originalMessage, whatsapp } = req.body;
  try {
    await sendEmail({
      to: email,
      subject: `Respuesta Oficial MantechPro: ${subject}`,
      html: `<div style="background:#0a0b0d; color:#fff; padding:40px; font-family:sans-serif;">
              <div style="max-width:600px; margin:auto; background:#121317; padding:40px; border-radius:24px; border:1px solid #2a2b2f;">
                <h2 style="color:#5d3cfe;">RE: ${subject}</h2>
                <p style="line-height:1.8;">${message}</p>
                <div style="background:#0d0e12; padding:20px; border-radius:16px; margin-top:30px; border:1px solid #1c1d21; color:#8a879d; font-style:italic;">
                  "${originalMessage}"
                </div>
              </div>
            </div>`
    });
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/diagnose", async (req, res) => {
  const { assetName, assetDetails, problemDescription } = req.body;
  try {
    const prompt = `Analiza fallo: ${assetName}. Descripción: ${problemDescription}. Responde JSON: {cause, prevention, damage, urgency, cost, specialist}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(text));
  } catch (e) { res.status(500).json({ error: "IA Error" }); }
});

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 MantechPro Ultra-Server activo en puerto ${PORT}`);
});
