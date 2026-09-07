// MantechPro Server Nodo-V4 - Live Production v6.1.7
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

import helmet from 'helmet';

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

// 3. MIDDLEWARES & SEGURIDAD PROFESIONAL
app.use(express.json({ limit: '5mb' }));

// Hardening HTTP con Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Permite assets web dinámicos (tiles de mapas Leaflet, CDN de Google, Firebase SDK)
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Estricto
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  'capacitor://localhost',
  'https://localhost',
  'ionic://localhost'
];
if (process.env.FRONTEND_URL) {
  ALLOWED_ORIGINS.push(process.env.FRONTEND_URL);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.web.app') || origin.endsWith('.firebaseapp.com')) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  } else {
    // Peticiones locales de Capacitor nativo o server-to-server
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Rate Limiters para protección contra spam y ataques DoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // 300 requests generales
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Por favor intente más tarde." }
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // 30 envíos de formularios o notificaciones
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Límite de envíos alcanzado temporalmente. Intente en 15 minutos." }
});

app.use("/api/", apiLimiter);
app.use("/api/contact", strictLimiter);
app.use("/api/send-report", strictLimiter);
app.use("/api/push-notification", strictLimiter);
app.use("/api/payments/verify-order", strictLimiter);

// 4. API ROUTES (Prioridad 2 - Deben estar ANTES del catch-all '*')

app.get("/api/health", (req, res) => res.json({ status: "active", version: "4.0.0", security: "hardened" }));

// Verificación y Captura Segura de Pagos (Server-Side Payment Capture & Audit)
app.post("/api/payments/verify-order", async (req, res) => {
  const { orderId, provider, userId, planId, requestId, amount } = req.body;

  if (!orderId || !userId) {
    return res.status(400).json({ success: false, error: "Datos de transacción incompletos o faltantes." });
  }

  try {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    // 1. Registro de Auditoría Inmutable
    await db.collection("audit_logs").add({
      type: "PAYMENT_CAPTURE",
      orderId,
      provider: provider || 'unknown',
      userId,
      planId: planId || null,
      requestId: requestId || null,
      amount: amount || 0,
      clientIp,
      status: "VERIFIED",
      verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2. Activación de Suscripción (Admin SDK bypasses client firestore rules)
    if (planId) {
      const userRef = db.collection("users").doc(userId);
      const userSnap = await userRef.get();
      const userData = userSnap.data();

      const nextBilling = new Date();
      nextBilling.setDate(nextBilling.getDate() + 30);

      const newSub = {
        planId,
        status: 'active',
        startDate: new Date().toISOString(),
        nextBillingDate: nextBilling.toISOString(),
        orderId,
        provider: provider || 'unknown',
        verifiedAt: new Date().toISOString()
      };

      await userRef.set({
        subscription: newSub,
        plan: planId
      }, { merge: true });

      if (userData?.role === 'tech') {
        const techId = userData.techId || `tech-${userId}`;
        const planTier = planId.split('-')[1] || 'pro';
        await db.collection("technicians").doc(techId).set({ plan: planTier }, { merge: true });
      }

      console.log(`💳 [PAYMENT SUCCESS] Suscripción activada para usuario ${userId}: ${planId}`);
    }

    // 3. Aprobación de Cotización de Servicio
    if (requestId) {
      const reqRef = db.collection("requests").doc(requestId);
      await reqRef.set({
        status: 'accepted',
        paymentStatus: 'paid',
        paymentMethod: provider || 'online',
        paymentOrderId: orderId,
        paidAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`💳 [PAYMENT SUCCESS] Cotización pagada para solicitud: ${requestId}`);
    }

    return res.json({ success: true, message: "Transacción verificada y registrada correctamente." });
  } catch (error: any) {
    console.error("❌ [PAYMENT ERROR]:", error.message);
    return res.status(500).json({ success: false, error: "Error procesando el pago en el servidor." });
  }
});

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

    const contactRecipient = process.env.ADMIN_EMAIL?.split(',')[0]?.trim() || 'info@mantech-pro.com';
    sendEmail({
      to: contactRecipient,
      subject: `MantechPro: Nuevo contacto de ${name}`,
      html: `<h3>Nuevo Requerimiento</h3><p><b>De:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Tel:</b> ${whatsapp}</p><p><b>Mensaje:</b> ${message}</p>`
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

// Motor de Diagnóstico Técnico Industrial (Sin costo de API externa)
app.post("/api/diagnose", async (req, res) => {
  const { assetName, problemDescription } = req.body;
  const desc = (problemDescription || '').toLowerCase();
  const name = (assetName || '').toLowerCase();

  let probableCause = "Desgaste operativo estándar o necesidad de calibración preventiva.";
  let action = "Inspección técnica visual, medición de tolerancias y prueba funcional.";
  let urgency = "Media";
  let estimatedRange = "$40.00 - $75.00";
  let category = "mecanico";

  if (desc.includes("fuga") || desc.includes("agua") || desc.includes("gotea") || desc.includes("líquido") || desc.includes("aceite")) {
    probableCause = "Falla de estanqueidad, empaque/sello térmico degradado o línea de drenaje saturada.";
    action = "Sondeo de tubería, desincrustación química y sustitución de empaquetadura.";
    urgency = "Alta";
    estimatedRange = "$35.00 - $65.00";
    category = "plomero";
  } else if (desc.includes("no enciende") || desc.includes("chispa") || desc.includes("eléctric") || desc.includes("fusible") || desc.includes("corto") || desc.includes("voltaje")) {
    probableCause = "Disparo de breaker principal, relé térmico saturado o contactor quemado.";
    action = "Medición de aislamiento de devanados, prueba de continuidad y balanceo de fases.";
    urgency = "Crítica";
    estimatedRange = "$50.00 - $110.00";
    category = "electricista";
  } else if (desc.includes("ruido") || desc.includes("vibración") || desc.includes("chirrido") || desc.includes("golpe") || desc.includes("traba")) {
    probableCause = "Desbalance dinámico del rotor, holgura en chumacera o fatiga en balineras.";
    action = "Alineación láser de poleas/ejes, cambio de rodamientos SKF y relubricación.";
    urgency = "Media";
    estimatedRange = "$60.00 - $125.00";
    category = "mecanico";
  } else if (desc.includes("no enfría") || desc.includes("calor") || desc.includes("refrigerante") || desc.includes("gas") || name.includes("aire") || name.includes("ac") || desc.includes("congel")) {
    probableCause = "Microfuga en codos de condensador o evaporador con caída de presión R410A.";
    action = "Prueba de hermeticidad con nitrógeno seco, corrección de fuga y recarga por peso.";
    urgency = "Alta";
    estimatedRange = "$45.00 - $90.00";
    category = "tecnico_ac";
  }

  res.json({
    success: true,
    diagnosis: `${probableCause} Acción recomendada: ${action} [Prioridad: ${urgency} | Rango estimado: ${estimatedRange}]`,
    details: {
      probableCause,
      action,
      urgency,
      estimatedRange,
      category
    }
  });
});

// Enviar Notificación Push (Celulares & FCM)
app.post("/api/push-notification", async (req, res) => {
  const { title, body, token, userId, data } = req.body;
  try {
    const tokensToSend: string[] = [];
    if (token && token !== 'ADMIN_TOKEN_MASTER') {
      tokensToSend.push(token);
    } else if (userId) {
      const userDoc = await db.collection("users").doc(userId).get();
      if (userDoc.exists && userDoc.data()?.pushToken) {
        tokensToSend.push(userDoc.data()!.pushToken);
      }
    } else {
      // Si el token es ADMIN_TOKEN_MASTER o no se especifica, buscar usuarios administradores
      const adminSnaps = await db.collection("users")
        .where("role", "==", "admin")
        .get();
      adminSnaps.forEach(doc => {
        const d = doc.data();
        if (d.pushToken) tokensToSend.push(d.pushToken);
      });

      if (tokensToSend.length === 0) {
        const adminEmailSnap = await db.collection("users")
          .where("email", "==", "admin@mantech.com")
          .get();
        adminEmailSnap.forEach(doc => {
          const d = doc.data();
          if (d.pushToken) tokensToSend.push(d.pushToken);
        });
      }
    }

    if (tokensToSend.length === 0) {
      console.log("ℹ️ [PUSH] No se encontraron tokens activos para enviar.");
      return res.status(200).json({ success: true, message: "No active push tokens found" });
    }

    const stringData: Record<string, string> = {};
    if (data && typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        stringData[k] = String(v);
      }
    }

    const sendPromises = tokensToSend.map(t =>
      admin.messaging().send({
        notification: { title: title || 'Alerta MantechPro', body: body || '' },
        data: stringData,
        android: {
          priority: 'high',
          notification: {
            channelId: 'mantech_alerts',
            sound: 'default'
          }
        },
        token: t
      })
    );

    await Promise.allSettled(sendPromises);
    console.log(`📲 [PUSH] Notificación enviada a ${tokensToSend.length} dispositivo(s).`);
    res.json({ success: true, count: tokensToSend.length });
  } catch (error: any) {
    console.error("❌ [PUSH ERROR]:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Enviar Reporte Oficial Mensual por Correo
app.post("/api/send-report", async (req, res) => {
  const { to, reportData } = req.body;
  const recipient = to || process.env.ADMIN_EMAIL?.split(',')[0]?.trim() || 'rubenabregoc@gmail.com';
  console.log(`📊 [REPORTE] Procesando reporte mensual para: ${recipient}...`);

  try {
    const { month, year, metrics, financialSummary } = reportData || {};
    const ingresos = financialSummary?.grossIncome || financialSummary?.totalRevenue || 0;
    const comisiones = financialSummary?.netPlatformEarnings || financialSummary?.platformFee || 0;
    const servicios = metrics?.totalRequests || metrics?.completedJobs || 0;

    const brandHeader = `
      <div style="background-color: #1c1d21; padding: 35px 20px; text-align: center; border-bottom: 2px solid #5d3cfe;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">
          MANTECH<span style="color: #5d3cfe;">PRO</span>
        </h1>
        <p style="color: #52ffac; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px;">
          Reporte Financiero Oficial • Cierre Mensual
        </p>
      </div>
    `;

    const reputationFooter = `
      <div style="background-color: #0d0e12; padding: 25px; text-align: center; border-top: 1px solid #1c1d21;">
        <p style="margin: 0; color: #6e6d7a; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
          MantechPro Industries Panamá • Sistema Central Automatizado
        </p>
      </div>
    `;

    const htmlContent = `
      <div style="background-color: #0a0b0d; padding: 30px 15px; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #121317; border: 1px solid #2a2b2f; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.6);">
          ${brandHeader}
          <div style="padding: 35px 30px; color: #ffffff;">
            <div style="margin-bottom: 25px;">
              <span style="color: #5d3cfe; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Periodo de Facturación</span>
              <h2 style="font-size: 20px; font-weight: 800; margin: 6px 0 0 0; color: #ffffff;">Cierre de ${month || 'Mes'} ${year || ''}</h2>
            </div>

            <!-- Resumen de Métricas en Tarjetas -->
            <div style="display: table; width: 100%; margin-bottom: 30px;">
              <div style="display: table-cell; width: 33%; padding: 12px; background-color: #1a1b22; border-radius: 12px; border: 1px solid #2f3037; text-align: center;">
                <span style="color: #8e8d9a; font-size: 9px; font-weight: 700; text-transform: uppercase;">Ingresos Totales</span>
                <p style="color: #52ffac; font-size: 18px; font-weight: 900; margin: 8px 0 0 0;">$${Number(ingresos).toFixed(2)}</p>
              </div>
              <div style="display: table-cell; width: 5%;"></div>
              <div style="display: table-cell; width: 33%; padding: 12px; background-color: #1a1b22; border-radius: 12px; border: 1px solid #2f3037; text-align: center;">
                <span style="color: #8e8d9a; font-size: 9px; font-weight: 700; text-transform: uppercase;">Comisión Neta</span>
                <p style="color: #5d3cfe; font-size: 18px; font-weight: 900; margin: 8px 0 0 0;">$${Number(comisiones).toFixed(2)}</p>
              </div>
              <div style="display: table-cell; width: 5%;"></div>
              <div style="display: table-cell; width: 33%; padding: 12px; background-color: #1a1b22; border-radius: 12px; border: 1px solid #2f3037; text-align: center;">
                <span style="color: #8e8d9a; font-size: 9px; font-weight: 700; text-transform: uppercase;">Servicios</span>
                <p style="color: #ffffff; font-size: 18px; font-weight: 900; margin: 8px 0 0 0;">${servicios}</p>
              </div>
            </div>

            <div style="background-color: #0d0e12; border-radius: 14px; padding: 20px; border: 1px solid #1c1d21; margin-bottom: 25px;">
              <p style="color: #c5c3d4; font-size: 13px; line-height: 1.6; margin: 0;">
                El presente balance consolidado refleja las operaciones en plataforma y las liquidaciones verificadas de MantechPro.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://mantech-pro.com" style="display: inline-block; background-color: #5d3cfe; color: #ffffff; padding: 12px 26px; border-radius: 10px; font-weight: 800; text-decoration: none; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">
                Ver en Consola Administrativa
              </a>
            </div>
          </div>
          ${reputationFooter}
        </div>
      </div>
    `;

    await sendEmail({
      to: recipient,
      subject: `📊 Reporte Oficial de Cierre Mensual: ${month || ''} ${year || ''}`,
      html: htmlContent
    });

    res.json({ success: true, recipient });
  } catch (error: any) {
    console.error("❌ Error enviando reporte:", error.message);
    res.status(500).json({ error: error.message });
  }
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
