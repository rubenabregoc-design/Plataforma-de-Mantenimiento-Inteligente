import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { format, addDays, parseISO, differenceInCalendarDays, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de Colores Mantech Pro (Master V4)
const BRAND_PRIMARY = '#5d3cfe'; // Púrpura Eléctrico
const BRAND_ACCENT = '#52ffac';  // Neón Mint
const BRAND_BG = '#0d0e12';      // Negro Nodo
const BRAND_CARD = '#16171d';    // Gris Carbón

// Inicializar Firebase Admin
const initFirebaseAdmin = async () => {
  try {
    const serviceAccount = JSON.parse(
      await readFile(path.join(process.cwd(), 'service-account.json'), 'utf8')
    );
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    console.log("✅ Sistema Operativo Mantech Pro: Firebase Admin Vinculado.");
  } catch (error) {
    console.error("❌ Error en Nodo Maestro (Firebase):", error);
  }
};
initFirebaseAdmin();

const db = admin.firestore();

// API KEY BREVO (MANTECH PRO)
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'mantechpro@protonmail.com';
const SENDER_NAME = 'Mantech Pro Global';
const APP_URL = 'https://cltech-prod-fix--cltech-project-hub.us-central1.hosted.app/dashboard/maintenance';

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
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

app.listen(PORT, () => {
  console.log(`🚀 MantechPro Server Nodo-V4 activo en puerto ${PORT}`);
});
