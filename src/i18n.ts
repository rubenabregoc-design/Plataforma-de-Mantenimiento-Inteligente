import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome",
      "greetings": "Hello! I am your MantechPro Advisor for Panama 🇵🇦. My goal is to provide the support you need so your assets and fleet always operate in optimal conditions. How can I assist you today?",
      "greetings_sales": "Good day! It is a pleasure to greet you. I am your **MantechPro Advisor** 💼. I am at your full disposal to help you optimize the management and profitability of your equipment. Would you like to know the benefits we offer for **clients** or do you prefer information on how to join our network of specialized **technicians**?",
      "advisor_name": "MantechPro Advisor",
      "online_now": "Online now",
      "ask_anything": "How can I assist you today?",
      "plans": "Plans",
      "technical_support": "Technical Support",
      "contracts": "Contracts",
      "fleet": "Fleet",
      "inventory": "Inventory",
      "settings": "Settings",
      "logout": "Logout",
      "service_type_remote": "Remote",
      "service_type_onsite": "On-site",
      "my_assets": "My Assets",
      "fleet_b2b": "B2B Fleet",
      "self_diagnostic": "Self-Diagnostic",
      "find_experts": "Find Experts",
      "membership": "Membership",
      "spare_parts": "Spare Parts",
      "security": "Security",
      "warranty_vault": "Warranty Vault",
      "sos_emergency": "SOS Emergency",
      "audit": "Audit",
      "chat": "Chat",
      "protected_assets": "Protected Assets",
      "expiring_soon": "Expiring Soon",
      "active_protection": "Active Protection",
      "expired": "Expired",
      "days_left": "days left",
      "landing_logistica_title": "Total Visibility and Control",
      "landing_logistica_subtitle": "STRESS-FREE LOGISTICS",
      "landing_logistica_desc": "Keep your fleet running and your customers happy. MantechPro takes care of tracking and maintenance, so you can focus on growing your business.",
      "landing_auditoria_title": "Industrial Continuity",
      "landing_auditoria_subtitle": "ZERO DOWNTIME",
      "landing_auditoria_desc": "Maximize the uptime of your critical assets. We predict failures before they happen, ensuring your production line never stops.",
      "landing_b2b_title": "Smart Property Management",
      "landing_b2b_subtitle": "EFFICIENCY AT SCALE",
      "landing_b2b_desc": "The definitive tool for Property Managers. Coordinate maintenance, track budgets, and ensure common areas are always in top condition.",
      "landing_security_title": "Your Peace of Mind, Our Priority",
      "landing_security_subtitle": "CERTIFIED TRUST",
      "landing_security_desc": "Every technician is verified and every payment is protected. Experience the security of working with the best-rated professionals in Panama."
    }
  },
  es: {
    translation: {
      "welcome": "Bienvenido",
      "greetings": "¡Hola! Es un placer atenderle. 👋 Soy su **Asesor MantechPro** para Panamá 🇵🇦. Mi objetivo es brindarle el soporte necesario para que sus activos y flota operen siempre en óptimas condiciones. ¿En qué puedo asistirle el día de hoy?",
      "greetings_sales": "¡Buen día! Es un placer saludarle. Soy su **Asesor MantechPro** 💼. Estoy a su entera disposición para ayudarle a optimizar la gestión y rentabilidad de sus equipos. ¿Le gustaría conocer los beneficios que ofrecemos para **clientes** o prefiere información sobre cómo unirse a nuestra red de **técnicos** especializados?",
      "advisor_name": "Asesor MantechPro",
      "online_now": "En línea ahora",
      "ask_anything": "¿En qué puedo asistirle el día de hoy?",
      "plans": "Planes",
      "technical_support": "Soporte Técnico",
      "contracts": "Contratos",
      "fleet": "Flota",
      "inventory": "Inventario",
      "settings": "Ajustes",
      "logout": "Cerrar Sesión",
      "service_type_remote": "Remoto",
      "service_type_onsite": "En Sitio",
      "my_assets": "Mis Equipos",
      "fleet_b2b": "Flota B2B",
      "self_diagnostic": "Autodiagnóstico",
      "find_experts": "Buscar Expertos",
      "membership": "Membresía",
      "spare_parts": "Repuestos",
      "security": "Seguridad",
      "warranty_vault": "Bóveda Garantías",
      "sos_emergency": "Emergencia SOS",
      "audit": "Auditoría",
      "chat": "Chat",
      "protected_assets": "Activos Protegidos",
      "expiring_soon": "Vencen pronto",
      "active_protection": "Protección Activa",
      "expired": "Expirada",
      "days_left": "días restantes",
      "landing_logistica_title": "Visibilidad y Control Total",
      "landing_logistica_subtitle": "LOGÍSTICA SIN ESTRÉS",
      "landing_logistica_desc": "Mantenga su flota operativa y a sus clientes felices. MantechPro se encarga del seguimiento y el mantenimiento, para que usted se encargue de crecer.",
      "landing_auditoria_title": "Continuidad Industrial",
      "landing_auditoria_subtitle": "CERO PAROS TÉCNICOS",
      "landing_auditoria_desc": "Maximice el tiempo de actividad de sus activos críticos. Predecimos fallas antes de que ocurran, asegurando que su línea de producción nunca se detenga.",
      "landing_b2b_title": "Gestión de PH Inteligente",
      "landing_b2b_subtitle": "EFICIENCIA A ESCALA",
      "landing_b2b_desc": "La herramienta definitiva para Administradores de PH. Coordine mantenimientos, rastree presupuestos y asegure áreas comunes impecables.",
      "landing_security_title": "Su Tranquilidad, Nuestra Prioridad",
      "landing_security_subtitle": "CONFIANZA CERTIFICADA",
      "landing_security_desc": "Cada técnico es verificado y cada pago está protegido. Experimente la seguridad de trabajar con los mejores profesionales de Panamá."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
