# ⚙️ MantechPro: Plataforma de Mantenimiento Especializado

<<<<<<< HEAD
**MantechPro** es una solución integral diseñada para optimizar la gestión de mantenimiento preventivo y correctivo de activos críticos (vehículos, sistemas de climatización, infraestructura TI y energía solar). La plataforma combina automatización de alertas, diagnósticos expertos y un marketplace de técnicos certificados.

## 🚀 Características Principales

*   **Diagnóstico Especializado:** Analiza fallas comunes mediante un motor de conocimiento técnico, proporcionando causas probables, nivel de urgencia y presupuestos estimados.
*   **Gestión de Activos:** Registro y seguimiento detallado de vehículos (millaje), aires acondicionados, servidores y plantas eléctricas.
*   **Alertas Automatizadas:** Sistema de notificaciones vía **Email (SMTP)** y **Web Push** para recordar mantenimientos próximos o vencidos.
*   **Marketplace de Técnicos:** Conecta con profesionales idóneos en Ciudad de Panamá (Mecánicos, Eléctricos, HVAC, TI) con sistema de valoraciones y perfiles premium.
*   **Agendamiento en 1-Clic:** Flujo optimizado para convertir una alerta de mantenimiento en una cita técnica inmediata.
=======
**MantechPro** es una solución integral diseñada para optimizar la gestión de mantenimiento preventivo y correctivo de activos críticos (vehículos, sistemas de climatización, infraestructura TI y energía solar). La plataforma combina análisis predictivo local, automatización de alertas y un marketplace de técnicos certificados en Panamá.

## 🚀 Características Principales

*   **🧠 Diagnóstico Técnico Predictivo (Local):** Sistema autónomo que analiza fallas mediante palabras clave, proporcionando causas probables, nivel de urgencia y presupuestos estimados del mercado panameño de forma instantánea.
*   **📦 Inventario de Repuestos:** Módulo para el control de stock de insumos (aceites, filtros, frenos) con alertas automáticas de reabastecimiento y vinculación por activos.
*   **📊 Dashboard de Gastos y Analítica:** Visualización interactiva de inversión mensual, cálculo de ahorro generado por prevención y score de salud de los equipos.
*   **📝 Checklist de Inspección Digital:** Flujo de trabajo para técnicos con protocolos de seguridad y calidad, integrando firma digital y reportes finales detallados.
*   **🔔 Alertas Multicanal:** Notificaciones en tiempo real vía **Email (SMTP)** y **Web Push (Capacitor)** para mantenimientos preventivos y situaciones críticas.
*   **🏙️ Marketplace Local:** Conexión directa con especialistas certificados en Ciudad de Panamá y provincias.
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf

## 🛠️ Stack Tecnológico

*   **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
*   **Backend:** Node.js, Express.
<<<<<<< HEAD
=======
*   **Infraestructura:** Firebase (Authentication, Firestore, Storage).
*   **Mobile / Native:** Capacitor (Push Notifications, Device Info).
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf
*   **Notificaciones:** Nodemailer (SMTP) y Web Push API.
*   **Build Tool:** Vite + Concurrently para ejecución simultánea.

## 📦 Instalación y Configuración

1.  **Clonar el repositorio e instalar dependencias:**
    ```bash
    npm install
    ```

<<<<<<< HEAD
2.  **Configurar Variables de Envío:**
    Crea un archivo `.env` en la raíz (usa `.env.example` como guía):
    ```env
    SMTP_USER=tu_correo@gmail.com
    SMTP_PASS=tu_password_de_aplicacion
    APP_URL=http://localhost:3000
    ```
=======
2.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz (usa `.env.example` como guía) con tus credenciales de Firebase y configuración SMTP.
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf

3.  **Ejecutar en modo desarrollo:**
    El comando iniciará automáticamente el servidor de la API (puerto 8080) y el cliente Vite (puerto 3000):
    ```bash
    npm run dev
    ```

## 📋 Estructura del Proyecto

<<<<<<< HEAD
*   `/src/components`: Componentes modulares (Modales de registro, Asistente Técnico, Chat).
*   `/src/mockData.ts`: Base de datos simulada de activos, técnicos y solicitudes.
*   `server.ts`: Servidor Express que maneja el motor de diagnóstico y el despacho de correos electrónicos.
=======
*   `/src/components`: Módulos de Inventario, Analítica, Checklist, Chat y Modales.
*   `/src/firebase.ts`: Configuración y conexión con los servicios de Google Firebase.
*   `/src/mockData.ts`: Datos iniciales para demostraciones y pruebas locales.
*   `server.ts`: Servidor API que maneja el despacho de correos y la lógica de diagnóstico predictivo local.
>>>>>>> 704b6d958a85e1739c0273d956d23c9955ad9baf
*   `types.ts`: Definiciones de interfaces TypeScript para todo el ecosistema.

---
**Actualización V3: Mayor independencia, gestión de repuestos y analítica financiera.**

## 📱 Desarrollo Mobile (Android)

Este proyecto utiliza **Capacitor** para ejecutarse como una aplicación nativa en Android.

1.  **Generar el build del frontend:**
    ```bash
    npm run build
    ```
2.  **Sincronizar con el proyecto de Android:**
    ```bash
    npx cap sync android
    ```
3.  **Abrir en Android Studio:**
    ```bash
    npx cap open android
    ```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas mejorar MantechPro:
1. Haz un **Fork** del proyecto.
2. Crea una rama para tu funcionalidad (`git checkout -b feature/NuevaFuncionalidad`).
3. Realiza tus cambios y haz un **Commit** (`git commit -m 'Añadir nueva funcionalidad'`).
4. Sube los cambios a tu rama (`git push origin feature/NuevaFuncionalidad`).
5. Abre un **Pull Request**.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## 📧 Contacto

**MantechPro Team** - Ciudad de Panamá, Panamá.
*   **Sitio Web:** [mantechpro.pa](https://mantechpro.pa)
*   **Soporte:** soporte@mantechpro.pa

---
*Optimizado para el sector industrial, automotriz y residencial en Panamá.*
