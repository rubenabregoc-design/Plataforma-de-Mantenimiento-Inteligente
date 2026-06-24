# ⚙️ MantechPro: Plataforma de Mantenimiento Inteligente

**MantechPro** es una solución integral diseñada para optimizar la gestión de mantenimiento preventivo y correctivo de activos críticos (vehículos, sistemas de climatización, infraestructura TI y energía solar). La plataforma combina inteligencia artificial, automatización de alertas y un marketplace de técnicos certificados.

## 🚀 Características Principales

*   **Diagnóstico con IA (Gemini):** Analiza fallas mediante descripciones técnicas y fotos, proporcionando causas probables, nivel de urgencia y presupuestos estimados.
*   **Gestión de Activos:** Registro y seguimiento detallado de vehículos (millaje), aires acondicionados, servidores y plantas eléctricas.
*   **Alertas Automatizadas:** Sistema de notificaciones vía **Email (SMTP)** y **Web Push** para recordar mantenimientos próximos o vencidos.
*   **Marketplace de Técnicos:** Conecta con profesionales idóneos en Ciudad de Panamá (Mecánicos, Eléctricos, HVAC, TI) con sistema de valoraciones y perfiles premium.
*   **Agendamiento en 1-Clic:** Flujo optimizado para convertir una alerta de mantenimiento en una cita técnica inmediata.

## 🛠️ Stack Tecnológico

*   **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
*   **Backend:** Node.js, Express.
*   **IA:** Google Gemini API (@google/genai).
*   **Notificaciones:** Nodemailer (SMTP) y Web Push API.
*   **Build Tool:** Vite.

## 📦 Instalación y Configuración

1.  **Clonar el repositorio e instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz (usa `.env.example` como guía):
    ```env
    GEMINI_API_KEY=tu_api_key_aquí
    SMTP_USER=tu_correo@gmail.com
    SMTP_PASS=tu_password_de_aplicacion
    APP_URL=http://localhost:3000
    ```

3.  **Ejecutar en modo desarrollo:**
    ```bash
    npm run dev
    ```

## 📋 Estructura del Proyecto

*   `/src/components`: Componentes modulares (Modales de registro, Vista de IA, Chat).
*   `/src/mockData.ts`: Base de datos simulada de activos, técnicos y solicitudes.
*   `server.ts`: Servidor Express que maneja la API de diagnóstico IA y el despacho de correos electrónicos.
*   `types.ts`: Definiciones de interfaces TypeScript para todo el ecosistema.

---
**Desarrollado para la optimización operativa y la tranquilidad del propietario.**
