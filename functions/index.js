import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
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
        await registrarNotificacion(userId, title, body, data.type || 'system', data);
    } catch (err) { logError("💥 Error Push:", err.message); }
}

// --- TRIGGERS INTELIGENTES ---

// 1. Inicialización automática de usuario
export const onUserCreated = onDocumentCreated("users/{userId}", async (event) => {
    const userId = event.params.userId;
    const data = event.data.data();

    // Si no tiene suscripción, asignar Plan Gratis
    if (!data.subscription) {
        await db.collection("users").doc(userId).update({
            subscription: {
                planId: data.role === 'tech' ? 'plan-basic' : 'plan-free',
                status: 'active',
                startDate: admin.firestore.FieldValue.serverTimestamp(),
                nextBillingDate: format(addDays(new Date(), 30), 'yyyy-MM-dd')
            }
        });
        info(`✅ Suscripción inicial configurada para: ${userId}`);
    }
});

// 2. Procesamiento Financiero Automático (Liquidación)
export const onJobCompleted = onDocumentUpdated("requests/{requestId}", async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    // Notificar al Técnico cuando el pago es aceptado (Agendado)
    if (before.status !== 'accepted' && after.status === 'accepted') {
        await enviarPush(after.techUserId, "✅ Pago Verificado", `El pago para ${after.assetName} ha sido verificado. Puedes iniciar el servicio según la agenda.`, { type: 'system', requestId: event.params.requestId });
    }

    // Notificar al Técnico cuando el pago de imprevisto es aceptado
    if (before.status !== 'unforeseen_paid' && after.status === 'unforeseen_paid') {
        await enviarPush(after.techUserId, "💰 Imprevisto Pagado", `El cliente ha pagado el imprevisto de ${after.assetName}. Puedes continuar con el trabajo.`, { type: 'system', requestId: event.params.requestId });
    }

    // Liquidación final al completar el trabajo
    if (before.status !== 'completed' && after.status === 'completed') {
        const { techId, price, techUserId, assetName } = after;

        // Regla MantechPro: 15% Comisión (B2C)
        const commission = price * 0.15;
        const earnings = price - commission;

        try {
            const techRef = db.collection("technicians").doc(techId);
            await techRef.update({
                "wallet.balance": admin.firestore.FieldValue.increment(earnings),
                "wallet.transactions": admin.firestore.FieldValue.arrayUnion({
                    id: `tx-${Date.now()}`,
                    amount: earnings,
                    type: 'credit',
                    description: `Servicio completado: ${assetName}`,
                    timestamp: new Date().toISOString(),
                    status: 'completed'
                })
            });

            await enviarPush(techUserId, "💰 Fondos Liberados", `Se han acreditado $${earnings.toFixed(2)} a tu billetera.`, { type: 'billing' });
            info(`⚖️ Liquidación completada para técnico ${techId}.`);
        } catch (err) {
            logError("💥 Error en liquidación:", err.message);
        }
    }
});

// 3. Notificación de Mensajes de Chat
export const onNewMessage = onDocumentCreated("messages/{messageId}", async (event) => {
    const msg = event.data.data();
    const { requestId, sender, text } = msg;

    try {
        const reqDoc = await db.collection("requests").doc(requestId).get();
        if (!reqDoc.exists) return;
        const req = reqDoc.data();

        const targetUserId = sender === 'client' ? req.techUserId : req.clientId;
        const senderName = sender === 'client' ? req.clientName : req.techName;

        await enviarPush(targetUserId, `💬 Nuevo mensaje de ${senderName}`, text, { type: 'chat', requestId });
    } catch (err) {
        logError("💥 Error en notificación de chat:", err.message);
    }
});

// --- ROBOT MAESTRO (CRON) ---
export const cronMantechProSmartBot = onSchedule({
    schedule: "0 8 * * *",
    timeZone: "America/Panama",
    region: "us-central1"
}, async (event) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const hoyPanama = new Date(utc + (3600000 * -5));

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
    } catch (err) { logError("💥 Error en Cron:", err.message); }
});

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
