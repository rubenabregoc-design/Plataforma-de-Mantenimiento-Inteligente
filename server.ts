// MantechPro Server Nodo-V4 - Live Production v6.1.7
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const getDirname = () => {
  try { return path.dirname(fileURLToPath(import.meta.url)); } catch (e) { return process.cwd(); }
};

const __dirname = getDirname();
const app = express();
const PORT = process.env.PORT || 8080;

// 1. FIREBASE INIT
const initFirebase = () => {
  if (admin.apps.length > 0) return admin.firestore();
  const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
  try {
    if (fs.existsSync(serviceAccountPath)) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccountPath) });
      console.log("💎 [FIREBASE] Local Connected.");
    } else {
      admin.initializeApp();
      console.log("☁️ [FIREBASE] Cloud Connected.");
    }
  } catch (error: any) { console.error("🔥 [FIREBASE ERROR]:", error.message); }
  return admin.firestore();
};
const db = initFirebase();

// 2. SMTP CONFIG
const SMTP_PASS = process.env.SMTP_PASS || process.env.BREVO_API_KEY || '';
const SMTP_USER = process.env.SMTP_USER || 'b31b49001@smtp-brevo.com';
const mailTransporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});

async function sendEmail({ to, subject, html, replyTo }: any) {
  if (!SMTP_PASS) return;
  const sender = process.env.SENDER_EMAIL || 'info@mantech-pro.com';
  try {
    await mailTransporter.sendMail({
      from: `"Mantech Pro Global" <${sender}>`,
      sender: sender, replyTo: replyTo || sender,
      to, subject, html,
      headers: { 'X-Mailer': 'MantechPro Master Node V4' }
    });
    console.log(`📧 [CORREO] Enviado a: ${to}`);
  } catch (e: any) { console.error("❌ [SMTP ERROR]", e.message); }
}

// 3. MIDDLEWARES (Prioridad 1)
app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// 4. API ROUTES (Prioridad 2 - Deben estar ANTES del catch-all '*')

app.get("/api/health", (req, res) => res.json({ status: "active", version: "6.1.7" }));

// Contacto Web
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message, whatsapp, type } = req.body;
  res.status(200).json({ success: true }); // Respuesta rápida

  try {
    await db.collection("support_tickets").add({
      userName: name || 'Anon', userEmail: email, whatsapp: whatsapp || 'N/A',
      subject: subject || 'Consulta', message: message || '', type: type || 'info',
      status: 'new', createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    sendEmail({
      to: 'rubenabregoc@gmail.com',
      subject: `MantechPro: Nuevo contacto de ${name}`,
      html: `<h3>Nuevo Requerimiento</h3><p><b>De:</b> ${name}</p><p>${message}</p>`
    });
  } catch (err: any) { console.error("❌ API Contact Error:", err.message); }
});

// Respuesta a Tickets (Respuesta Oficial Premium)
app.post("/api/admin/reply-ticket", async (req, res) => {
  console.log("📤 [ADMIN] Procesando respuesta oficial...");
  const { name, email, whatsapp, subject, message, originalMessage } = req.body;

  const brandHeader = `
    <div style="background-color: #1c1d21; padding: 40px; text-align: center; border-bottom: 2px solid #5d3cfe;">
      <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">
        MANTECH<span style="color: #5d3cfe;">PRO</span>
      </h1>
      <p style="color: #52ffac; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-top: 10px;">Comunicación Industrial Autorizada</p>
    </div>
  `;

  const reputationFooter = `
    <div style="background-color: #0d0e12; padding: 30px; text-align: center; border-top: 1px solid #1c1d21;">
      <p style="margin: 0; color: #474556; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px;">
        MantechPro Industries Panamá • Soporte Estratégico <br>
        Ciudad de Panamá, Edificio Advanced Tower.
      </p>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: `Respuesta Oficial MantechPro: ${subject}`,
      html: `
        <div style="background-color: #0a0b0d; padding: 40px 20px; font-family: 'Segoe UI', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #121317; border: 1px solid #2a2b2f; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            ${brandHeader}

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
                     <span style="font-size: 10px; color: #474556; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Tu consulta original:</span>
                  </div>
                  <p style="color: #8a879d; font-size: 14px; line-height: 1.6; font-style: italic; margin: 0;">
                    "${originalMessage}"
                  </p>
               </div>

               <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #2a2b2f; text-align: center;">
                  <a href="https://mantech-pro.com" style="display: inline-block; background-color: #5d3cfe; color: #ffffff; padding: 14px 30px; border-radius: 12px; font-weight: 900; text-decoration: none; text-transform: uppercase; font-size: 10px;">Acceder al Portal Oficial</a>
               </div>
            </div>

            ${reputationFooter}
          </div>
        </div>
      `
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// IA Diagnose
app.post("/api/diagnose", async (req, res) => {
  const { assetName, problemDescription } = req.body;
  res.json({ success: true, diagnosis: "IA Analizando..." });
});

// 5. STATIC FILES & SPA (Prioridad 3 - Al final de todo)
app.use(express.static(path.join(process.cwd(), 'dist')));

app.get('*', (req, res) => {
  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.sendFile(path.join(process.cwd(), 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 [NODO MASTER V6.1.7] ACTIVO EN PUERTO ${PORT}\n`);
});
