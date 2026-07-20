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
      "security": "Security"
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
      "security": "Seguridad"
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
