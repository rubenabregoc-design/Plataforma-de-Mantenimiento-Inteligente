# ⚙️ MantechPro Master V4: Inteligencia Operativa Panamá

**MantechPro** es una solución integral híbrida (Web/Android) diseñada para optimizar la gestión de mantenimiento preventivo y correctivo de activos críticos en Panamá. La plataforma combina inteligencia operativa, sincronización en la nube vía Firebase y un ecosistema blindado para técnicos y clientes.

## 🚀 Características Principales

*   **🧠 Diagnóstico Técnico Predictivo:** Análisis de fallas mediante palabras clave y lógica local, proporcionando causas probables y presupuestos estimados del mercado panameño.
*   **📊 Monitor de Ejecución en Tiempo Real:** Los clientes pueden visualizar el progreso del técnico, checklist de tareas y materiales cargados a la factura mientras el servicio ocurre.
*   **📦 Inventario de Repuestos:** Control de stock de insumos con alertas de reabastecimiento y vinculación directa por activos.
*   **🛡️ Centro de Seguridad (Mantech ID):** Validación de identidad mediante Cédula y Récord Policivo para garantizar la confianza en el ecosistema.
*   **💳 Billetera Digital & Pagos:** Flujo automatizado de cobros vía Yappy/PayPal con liberación de fondos tras firma de conformidad.

## 🛠️ Stack Tecnológico

*   **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React.
*   **Backend:** Node.js, Express (IA Gemini 1.5 Flash Fallback).
*   **Infraestructura:** Firebase (Auth, Firestore, Storage).
*   **Mobile:** Capacitor (Android Push Notifications).

## 📋 Historial de Actualizaciones (Changelog)

### [2024-06-22] - Master V4 Update (Estabilidad y Real-Time)
- **Seguridad:** Implementada validación de Récord Policivo obligatoria para técnicos aprobada por Administrador.
- **Real-Time Progress:** Nueva interfaz para el Cliente que permite ver el Checklist y Materiales en vivo durante el servicio.
- **Admin Root:** Consolidación de credenciales admin (`admin@mantech.com`) con bypass de seguridad para gestión de usuarios.
- **UI/UX:** Restauración total de la estética Master V4 (Glow effects, Steppers de contrato y tarjetas premium).
- **Backend:** Actualizado servidor Express al puerto 3000 para compatibilidad Windows y despliegue local estable.

## 📦 Instalación y Configuración

1.  **Clonar e instalar:** `npm install`
2.  **Variables de Entorno:** Configura el `.env` con tus llaves de Firebase y SMTP.
3.  **Ejecutar:** `npm run dev` (Interfaz) y `npm run server` (API).

## 📱 Despliegue Android
1.  `npm run build`
2.  `npx cap sync android`
3.  `npx cap open android`

---
**🔐 Seguridad GitHub:** Última subida de parches de seguridad y validación de reglas de Firestore: `22 de Junio, 2024`.

*MantechPro Team - Ciudad de Panamá.*
