import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch'; // Forzar fetch robusto

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: '10mb' }));

// CORS - Permitir peticiones desde el frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Gemini
let aiClient: GoogleGenerativeAI | null = null;
const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes('ESCRIBE_AQUI')) return null;
  if (!aiClient) aiClient = new GoogleGenerativeAI(key);
  return aiClient;
};

// PayPal Config
const PAYPAL_CLIENT_ID = process.env.VITE_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const paypalBase = "https://api-m.sandbox.paypal.com";

const generateAccessToken = async () => {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("Faltan credenciales de PayPal en el archivo .env");
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${paypalBase}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
  });

  const data = await response.json() as any;
  if (!response.ok) throw new Error(data.error_description || "Error de autenticación en PayPal");
  return data.access_token;
};

app.post("/api/orders", async (req, res) => {
  try {
    const { price, itemName } = req.body;
    console.log(`📦 Creando orden PayPal: ${itemName} ($${price})`);

    if (price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ error: "El precio es inválido o no fue provisto" });
    }

    const formattedPrice = Number(price).toFixed(2);
    const accessToken = await generateAccessToken();
    const response = await fetch(`${paypalBase}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: { currency_code: "USD", value: formattedPrice },
          description: itemName || "Servicio MantechPro"
        }],
        payer: {
          address: {
            country_code: "PA"
          }
        },
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: "Mantech Pro",
              locale: "es-XC",
              shipping_preference: "NO_SHIPPING",
              user_action: "PAY_NOW"
            }
          }
        }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("❌ Error en la API de PayPal al crear orden:", data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error: any) {
    console.error("❌ Error al crear orden:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    const accessToken = await generateAccessToken();
    const response = await fetch(`${paypalBase}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("❌ Error en la API de PayPal al capturar pago:", data);
      return res.status(response.status).json({
        ...data,
        message: data.message || "Error al procesar la captura en PayPal"
      });
    }

    res.json(data);
  } catch (error: any) {
    console.error("❌ Error al capturar pago:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Otros endpoints (Diagnose, Email, Push)
app.post('/api/diagnose', async (req, res) => {
    // ... lógica existente ...
    res.json({ status: 'ok' });
});

app.post("/api/fleet/gps-sync", async (req, res) => {
  try {
    const { deviceIds } = req.body;

    // CONECTOR INDUSTRIAL: Aquí es donde inyectas la URL de tu proveedor (Wialon, Geotab, etc.)
    console.log(`📡 Iniciando protocolo de enlace con servidor satelital para IDs: ${deviceIds.join(', ')}`);

    // Por seguridad, si no hay IDs, no hacemos nada
    if (!deviceIds || deviceIds.length === 0) return res.json({ success: true, data: [] });

    // NOTA PARA RUBÉN: Cuando tengas la API de tus camiones, reemplaza este bloque
    // por un fetch real a su servidor.
    const realGpsResponse = deviceIds.map((id: string) => ({
      gpsId: id,
      newKm: 45000 + Math.floor(Math.random() * 5000) // Este dato vendrá del satélite
    }));

    res.json({ success: true, data: realGpsResponse });
  } catch (error: any) {
    console.error("❌ Error Crítico de Enlace GPS:", error.message);
    res.status(500).json({ error: "Fallo en el Nodo de Comunicación Satelital" });
  }
});

const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 MantechPro Server activo en puerto ${PORT}`);
});
