import { onSchedule } from "firebase-functions/v2/scheduler";
import { setGlobalOptions } from "firebase-functions/v2";
import { info, error as logError } from "firebase-functions/logger";
import admin from "firebase-admin";
import { format, parseISO, differenceInCalendarDays, getDay } from "date-fns";
import { es } from "date-fns/locale";
import fetch from "node-fetch";

const app = admin.apps.length === 0 ? admin.initializeApp() : admin.apps[0];
const db = admin.firestore(app);

setGlobalOptions({ maxInstances: 10, region: "us-central1" });

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = 'mantechpro@protonmail.com';
const SENDER_NAME = 'Mantech Pro Global';
const BASE_URL = 'https://cltech-prod-fix--cltech-project-hub.us-central1.hosted.app';

// --- MOTOR DE NOTIFICACIONES MULTICANAL ---

async function registrarNotificacion(userId, title, body, type, metadata = {}) {
    try {
        await db.collection("notifications").add({
            userId,
            title,
            body,
            type, // 'maintenance' | 'system' | 'billing'
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
            metadata
        });
        info(`📌 Registro en historial para usuario: ${userId}`);
    } catch (err) {
        logError("💥 Error registrando en base de datos:", err.message);
    }
}

async function enviarPush(userId, title, body, data = {}) {
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        const token = userDoc.data()?.pushToken;
        if (token) {
            await admin.messaging().send({
                notification: { title, body },
                data: { ...data, click_action: "FLUTTER_NOTIFICATION_CLICK" },
                token: token
            });
            info(`📲 Push enviada a: ${userId}`);
        }
        // Siempre registramos en el panel de la App
        await registrarNotificacion(userId, title, body, data.type || 'system', data);
    } catch (err) { logError("💥 Error Push:", err.message); }
}

async function enviarCorreoMantech(to, subject, htmlContent) {
    try {
        const emailHtml = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0e12; color: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid #1c1d21;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -1px;">
              MANTECH<span style="color: #5d3cfe;">PRO</span>
            </h1>
          </div>
          <div style="background-color: #16171d; padding: 30px; border-radius: 20px; border: 1px solid #2a2b2f;">
            ${htmlContent}
          </div>
          <p style="text-align: center; color: #474556; font-size: 10px; margin-top: 30px; text-transform: uppercase;">
            © 2026 MantechPro Industries Panamá • Sistema Inteligente
          </p>
        </div>`;

        await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: { "accept": "application/json", "api-key": BREVO_API_KEY, "content-type": "application/json" },
            body: JSON.stringify({
                sender: { name: SENDER_NAME, email: SENDER_EMAIL },
                to: [{ email: to }],
                subject: subject,
                htmlContent: emailHtml
            })
        });
    } catch (err) { logError("💥 Error Correo:", err.message); }
}

// --- ROBOT MAESTRO ---
export const cronMantechProSmartBot = onSchedule({
    schedule: "0 8 * * *",
    timeZone: "America/Panama",
    region: "us-central1"
}, async (event) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const hoyPanama = new Date(utc + (3600000 * -5));
    const diaSemana = getDay(hoyPanama);

    try {
        const remindersSnap = await db.collection("reminders").get();
        const assetsSnap = await db.collection("assets").get();
        const assetsMap = new Map();
        assetsSnap.forEach(doc => assetsMap.set(doc.id, doc.data()));

        for (const doc of remindersSnap.docs) {
            const data = doc.data();
            if (data.status === 'completed' || !data.dueDate) continue;

            const fechaEvento = parseISO(data.dueDate);
            const diasRestantes = differenceInCalendarDays(fechaEvento, hoyPanama);
            const asset = assetsMap.get(data.assetId) || {};

            if (diasRestantes === 3) {
                await enviarPush(data.clientId, "🚨 Protocolo Próximo", `Mantenimiento de ${asset.name || data.title} en 3 días.`, { type: 'maintenance', assetId: data.assetId });
            } else if (diasRestantes === 0) {
                await enviarPush(data.clientId, "🛠️ Día de Ejecución", `Hoy se realiza el mantenimiento de ${asset.name || data.title}.`, { type: 'maintenance', assetId: data.assetId });
            }
        }
        info("✅ Patrullaje de historial completado.");
    } catch (err) { logError("💥 Error:", err.message); }
});
