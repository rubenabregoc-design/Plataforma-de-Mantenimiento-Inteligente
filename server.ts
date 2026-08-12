// MantechPro Server Nodo-V4 - Live Production v6.0.7-FIXED
import express from 'express';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

// POLYFILL SEGURO PARA RUTAS (ESM + CJS)
const getDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (e) {
    return process.cwd();
  }
};

const __dirname = getDirname();
const app = express();
const PORT = process.env.PORT || 8080;

// 1. INICIALIZACIÓN DE FIREBASE (Blindada)
const initFirebase = () => {
  if (admin.apps.length > 0) return admin.firestore();

  // Buscamos el archivo de llaves en la raíz absoluta de la ejecución
  const serviceAccountPath = path.join(process.cwd(), 'service-account.json');

  console.log("🔍 [AUDITORÍA] Buscando llaves en:", serviceAccountPath);

  try {
    if (fs.existsSync(serviceAccountPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath)
      });
      console.log("💎 [FIREBASE] CONECTADO: Llaves Locales Activadas.");
    } else {
      admin.initializeApp();
      console.log("☁️ [FIREBASE] CONECTADO: Modo Nube Activado.");
    }
  } catch (error: any) {
    console.error("🔥 [FIREBASE ERROR]:", error.message);
  }
  return admin.firestore();
};

const db = initFirebase();

// 2. CONFIGURACIÓN DE CORREO (Resiliente)
const BREVO_KEY = process.env.BREVO_API_KEY || process.env.SMTP_PASS || '';
const SMTP_USER = process.env.SMTP_USER || 'b31b49001@smtp-brevo.com';

const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: SMTP_USER,
    pass: BREVO_KEY
  }
});

async function sendEmail({ to, subject, html }: any) {
  if (!BREVO_KEY) return console.warn("⚠️ [SMTP] Ignorado: Sin API Key.");
  const sender = process.env.SENDER_EMAIL || 'info@mantech-pro.com';
  try {
    await mailTransporter.sendMail({
      from: `"Mantech Pro Global" <${sender}>`,
      to, subject, html
    });
    console.log(`📧 [CORREO] Enviado a: ${to}`);
  } catch (e: any) { console.error("❌ [SMTP ERROR]", e.message); }
}

// 3. MIDDLEWARES
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(process.cwd(), 'dist')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// 4. API CONTACTO (A prueba de errores 500)
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message, whatsapp } = req.body;

  // Respuesta inmediata al navegador para evitar timeout
  res.status(200).json({ success: true, status: "protocol_initiated" });

  // Trabajo de fondo
  try {
    console.log(`📩 [SISTEMA] Recibida solicitud de: ${email}`);

    await db.collection("support_tickets").add({
      userName: name || 'Anon',
      userEmail: email,
      whatsapp: whatsapp || 'N/A',
      subject: subject || 'Consulta Web',
      message: message || '',
      status: 'new',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log("📥 [DB] Ticket guardado.");

    // Alerta al Admin
    sendEmail({
      to: 'rubenabregoc@gmail.com',
      subject: `[AUDITORÍA] Nuevo contacto: ${name}`,
      html: `<div style="background:#0d0e12; color:#fff; padding:20px; border-radius:15px; font-family:sans-serif;">
              <h2>Protocolo de Contacto</h2>
              <p><b>Nombre:</b> ${name}</p>
              <p><b>Email:</b> ${email}</p>
              <p><b>WhatsApp:</b> ${whatsapp || 'N/A'}</p>
              <hr style="border:0; border-top:1px solid #333; margin:15px 0;">
              <p><b>Mensaje:</b> ${message}</p>
             </div>`
    });

    // Auto-respuesta al Cliente (Sin decir "por donde")
    sendEmail({
      to: email,
      subject: `MantechPro: Hemos recibido tu solicitud`,
      html: `<div style="background:#0d0e12; color:#fff; padding:30px; border-radius:20px; font-family:sans-serif; text-align:center;">
              <h1 style="color:#52ffac;">¡Hola, ${name?.split(' ')[0] || 'Cliente'}!</h1>
              <p>Tu información ha sido procesada con éxito.</p>
              <p style="font-size:18px; font-weight:bold;">Un especialista te contactará.</p>
              <div style="margin-top:30px; color:#474556; font-size:10px;">PANAMÁ • MANTECHPRO INDUSTRIES</div>
            </div>`
    });

  } catch (err: any) {
    console.error("❌ [BACKGROUND ERROR]:", err.message);
  }
});

// SPA Support
app.get('*', (req, res) => {
  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.sendFile(path.join(process.cwd(), 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 SERVIDOR MANTECH PRO V6.0.7 ACTIVO`);
  console.log(`🚀 ESCUCHANDO EN PUERTO: ${PORT}\n`);
});
