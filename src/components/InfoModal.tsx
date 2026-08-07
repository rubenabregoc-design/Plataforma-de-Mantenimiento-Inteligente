import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Globe, Zap, Users, Building2, FileText, Layout, Store, PieChart, BadgeCheck, Heart, Leaf, Rocket, Clock, CheckCircle2, BarChart3, Lock, Send, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface InfoContent {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  description: string;
  longDesc: string;
  points: { title: string; desc: string; icon: any }[];
}

const infoRegistry: Record<string, InfoContent> = {
  'quienes_somos': {
    title: 'Quiénes somos',
    subtitle: 'La Infraestructura Técnica de Panamá',
    icon: Building2,
    color: '#5d3cfe',
    description: 'MantechPro nació con una misión clara: profesionalizar el sector de mantenimiento en la región mediante tecnología de punta y protocolos de seguridad industrial.',
    longDesc: 'Fundada por AbregoTech Solutions en el corazón de Ciudad de Panamá, MantechPro se ha consolidado como el sistema operativo para activos físicos. No somos solo una app, somos el puente entre la ingeniería de precisión y la necesidad diaria de hogares y empresas. Nuestra infraestructura procesa miles de datos mensuales para asegurar que cada tornillo ajustado y cada motor reparado cumpla con estándares de clase mundial.',
    points: [
      { title: 'Ingeniería Panameña', desc: 'Desarrollado localmente con estándares globales para el mercado regional.', icon: Globe },
      { title: 'Visión 2030', desc: 'Nuestra meta es digitalizar el 80% de los mantenimientos industriales en Panamá.', icon: Zap },
      { title: 'Compromiso Ético', desc: 'Transparencia total en precios y trazabilidad de cada servicio ejecutado.', icon: ShieldCheck },
      { title: 'Cultura Élite', desc: 'Solo el top 15% de los aplicantes técnicos logra la certificación Mantech ID.', icon: Users }
    ]
  },
  'lo_que_ofrecemos': {
    title: 'Lo que ofrecemos',
    subtitle: 'Ecosistema de Mantenimiento 360°',
    icon: Layout,
    color: '#52ffac',
    description: 'Desde soporte residencial hasta gestión de flotas B2B, nuestra plataforma adapta sus herramientas a su necesidad real.',
    longDesc: 'El ecosistema MantechPro se divide en tres capas de poder: Core, Activo y Portafolio. Ofrecemos una solución modular donde el usuario paga solo por lo que usa. Ya sea que necesite reparar un aire acondicionado en su hogar o gestionar una flota de 100 camiones refrigerados, la interfaz se transforma para darle los controles exactos, eliminando la complejidad innecesaria.',
    points: [
      { title: 'Diagnóstico IA', desc: 'Motor MDM-V4 que analiza historial y previene fallas críticas antes de que ocurran.', icon: Zap },
      { title: 'Wallet Blindada', desc: 'Sistema de custodia Escrow que protege los fondos de ambas partes.', icon: BadgeCheck },
      { title: 'Red de Expertos', desc: 'Acceso a especialistas certificados en 12 categorías técnicas diferentes.', icon: Users },
      { title: 'Auditoría Digital', desc: 'Cada servicio genera un reporte técnico firmado electrónicamente.', icon: FileText }
    ]
  },
  'flotas_b2b': {
    title: 'Flotas B2B',
    subtitle: 'Logística de Grado Industrial',
    icon: Globe,
    color: '#5d3cfe',
    description: 'Optimice el tiempo operativo de su flota con nuestro panel de control centralizado y mantenimiento proyectado.',
    longDesc: 'Diseñado para gerentes de logística que no pueden permitirse paros técnicos. Nuestra suite B2B integra rastreo GPS satelital con telemetría de mantenimiento. El sistema "aprende" el desgaste de sus unidades basándose en el kilometraje real y las condiciones climáticas de Panamá, enviando alertas automáticas a su equipo de mecánicos.',
    points: [
      { title: 'Rastreo Satelital', desc: 'Ubicación en tiempo real y detección de desviaciones de ruta no autorizadas.', icon: Globe },
      { title: 'Carga Masiva', desc: 'Sincronice miles de unidades desde archivos Excel en segundos.', icon: FileText },
      { title: 'Auditoría Fuel', desc: 'Algoritmos que detectan anomalías en el consumo de combustible por unidad.', icon: Zap },
      { title: 'SLA Prioritario', desc: 'Atención técnica garantizada en carretera en menos de 90 minutos.', icon: Clock }
    ]
  },
  'seguridad_mantech_id': {
    title: 'Seguridad Mantech ID',
    subtitle: 'Confianza Validada Biométricamente',
    icon: ShieldCheck,
    color: '#e11d48',
    description: 'El protocolo Mantech ID asegura que cada profesional en su propiedad sea quien dice ser, con antecedentes verificados.',
    longDesc: 'En un mundo de servicios informales, Mantech ID es el estándar de oro. Cada técnico pasa por un proceso de 5 pasos: Validación de Cédula, Récord Policivo actualizado, Prueba de conocimientos técnicos, Entrevista personal y Verificación biométrica. Al llegar a su puerta, usted escanea un código QR único que le confirma el estatus legal y la foto real del especialista.',
    points: [
      { title: 'Biometría Facial', desc: 'Reconocimiento facial obligatorio para que el técnico inicie su jornada.', icon: BadgeCheck },
      { title: 'Antecedentes', desc: 'Monitoreo constante de antecedentes legales y récord policivo.', icon: ShieldCheck },
      { title: 'Sello Digital', desc: 'Firma inmutable en cada reporte generado por el técnico.', icon: FileText },
      { title: 'Cero Efectivo', desc: 'Transacciones 100% digitales para evitar riesgos de seguridad física.', icon: Lock }
    ]
  },
  'sostenibilidad': {
    title: 'Sostenibilidad',
    subtitle: 'Mantenimiento Verde & Eficiente',
    icon: Leaf,
    color: '#52ffac',
    description: 'Creemos en alargar la vida útil de los activos para reducir el impacto ambiental y mejorar el ROI de nuestros clientes.',
    longDesc: 'La sostenibilidad en MantechPro se traduce en eficiencia. Un equipo bien mantenido consume hasta un 30% menos energía. Nuestra plataforma promueve la economía circular priorizando la reparación sobre el descarte, y eliminamos por completo el uso de papel en facturación y reportes técnicos, ahorrando toneladas de desperdicio anualmente en Panamá.',
    points: [
      { title: 'Cero Papel', desc: 'Gestión 100% digital desde la cotización hasta el cierre del servicio.', icon: FileText },
      { title: 'Eco-Eficiencia', desc: 'Optimización de rutas para técnicos, reduciendo la huella de carbono vial.', icon: Globe },
      { title: 'Vida Útil', desc: 'Protocolos que extienden la vida de los equipos hasta un 50%.', icon: Zap },
      { title: 'Energía Limpia', desc: 'Reportes específicos sobre el consumo energético de sus activos.', icon: Leaf }
    ]
  },
  'ecosistema_panama': {
    title: 'Ecosistema Panamá',
    subtitle: 'Crecimiento Económico Local',
    icon: Rocket,
    color: '#5d3cfe',
    description: 'MantechPro impulsa a la pequeña y mediana empresa técnica panameña, dándoles herramientas digitales de nivel corporativo.',
    longDesc: 'Panamá es nuestro centro de operaciones y el motor de nuestra innovación. Estamos comprometidos con la formalización del talento local, convirtiendo a técnicos independientes en empresarios tecnológicos. Al usar MantechPro, usted apoya directamente el crecimiento de talleres panameños que ahora compiten con herramientas de estándar global.',
    points: [
      { title: 'Impulso PYME', desc: 'Herramientas de gestión gratuitas para pequeños talleres locales.', icon: Building2 },
      { title: 'Capacitación', desc: 'Programas de actualización técnica en nuevas tecnologías industriales.', icon: Users },
      { title: 'Hub Regional', desc: 'Exportando tecnología "Made in Panamá" al resto de Latinoamérica.', icon: Globe },
      { title: 'Empleo Formal', desc: 'Facilitamos la bancarización y formalidad de cientos de especialistas.', icon: Zap }
    ]
  },
  'centro_ayuda': {
    title: 'Centro de Ayuda',
    subtitle: 'Soporte 24/7 a su disposición',
    icon: Users,
    color: '#5d3cfe',
    description: 'Nuestro equipo de soporte estratégico y nuestro asistente IA están listos para resolver cualquier incidencia.',
    longDesc: 'El soporte en MantechPro no es solo contestar preguntas; es resolver problemas técnicos. Contamos con una estructura híbrida de atención: un Asistente IA disponible 24/7 para diagnósticos rápidos y un equipo de Concierges Técnicos humanos para casos complejos y cuentas Enterprise.',
    points: [
      { title: 'Chat 24/7', desc: 'Asistencia inmediata integrada directamente en el Dashboard.', icon: Zap },
      { title: 'Gerente Dedicado', desc: 'Acompañamiento VIP para cuentas corporativas y flotas.', icon: BadgeCheck },
      { title: 'Guías de Usuario', desc: 'Biblioteca interactiva de tutoriales para dominar la plataforma.', icon: FileText },
      { title: 'SLA < 1 Hora', desc: 'Tiempo de respuesta garantizado para incidentes críticos.', icon: Clock }
    ]
  },
  'boveda_garantias': {
    title: 'Bóveda de Garantías',
    subtitle: 'Seguridad para sus activos',
    icon: ShieldCheck,
    color: '#f59e0b',
    description: 'Nunca pierda una garantía de nuevo. Almacenamos digitalmente facturas y certificados con alertas de vencimiento.',
    longDesc: '¿Cuántas veces ha buscado una factura vieja para reclamar una garantía y no la encuentra? La Bóveda de Garantías digitaliza este proceso. Al registrar un activo, usted sube el documento y nuestro sistema extrae la fecha de vencimiento, enviándole recordatorios proactivos 30 días antes de que expire la protección de fábrica.',
    points: [
      { title: 'Alertas Expiry', desc: 'Notificaciones automáticas antes de que venza el plazo legal.', icon: Zap },
      { title: 'Hash Inmutable', desc: 'Documentos protegidos con tecnología blockchain para evitar alteraciones.', icon: Lock },
      { title: 'Acceso QR', desc: 'Escanee el equipo y visualice su certificado de garantía al instante.', icon: BadgeCheck },
      { title: 'Historial', desc: 'Trazabilidad de cada reclamo realizado ante el fabricante.', icon: FileText }
    ]
  },
  'sala_prensa': {
    title: 'Sala de Prensa',
    subtitle: 'Comunicación Corporativa Oficial',
    icon: FileText,
    color: '#5d3cfe',
    description: 'Manténgase al día con los hitos de MantechPro, desde lanzamientos tecnológicos hasta alianzas estratégicas.',
    longDesc: 'Nuestra sala de prensa es el canal oficial para periodistas y aliados estratégicos. Aquí compartimos el crecimiento de nuestra red en Panamá, nuevas rondas de inversión y lanzamientos de módulos experimentales como el Diagnóstico por Sonido IA. Mantenemos una comunicación abierta sobre el impacto de la tecnología en la infraestructura nacional.',
    points: [
      { title: 'Notas Oficiales', desc: 'Comunicados sobre hitos operativos y alianzas gremiales.', icon: Globe },
      { title: 'Media Kit', desc: 'Recursos visuales de alta resolución para prensa y partners.', icon: Layout },
      { title: 'Tech Summits', desc: 'Resúmenes de nuestra participación en eventos de tecnología mundial.', icon: Zap },
      { title: 'Reportes', desc: 'Estudios trimestrales sobre el estado del mantenimiento en Panamá.', icon: BarChart3 }
    ]
  },
  'blog': {
    title: 'Mantech Blog',
    subtitle: 'Cultura Técnica Panameña',
    icon: Globe,
    color: '#52ffac',
    description: 'Descubra artículos sobre mantenimiento predictivo, optimización de equipos y el futuro del PropTech.',
    longDesc: 'El Blog de MantechPro es una fuente de conocimiento para el usuario moderno. Publicamos semanalmente contenido escrito por ingenieros reales sobre cómo cuidar sus activos, trucos de ahorro energético y comparativas de equipos. Es el lugar donde la teoría de la ingeniería se encuentra con la práctica del día a día.',
    points: [
      { title: 'Consejos Pro', desc: 'Guías prácticas para extender la vida útil de su línea blanca y maquinaria.', icon: Zap },
      { title: 'Casos Éxito', desc: 'Historias reales de empresas que optimizaron su ROI con nosotros.', icon: BadgeCheck },
      { title: 'Tech Trends', desc: 'Exploración de tendencias como Smart Cities y Gemelos Digitales.', icon: Rocket },
      { title: 'Opinión', desc: 'Visiones de expertos sobre el futuro del trabajo técnico en la región.', icon: Users }
    ]
  },
  'oportunidades_laborales': {
    title: 'Trabaja con Nosotros',
    subtitle: 'Únete a la Revolución Técnica',
    icon: Users,
    color: '#5d3cfe',
    description: 'Buscamos ingenieros, desarrolladores y especialistas en logística apasionados por transformar la industria.',
    longDesc: 'En MantechPro, no contratamos empleados, reclutamos visionarios. Somos una empresa impulsada por la tecnología donde el talento panameño tiene voz global. Ofrecemos un entorno de alto rendimiento, aprendizaje continuo y el orgullo de construir la infraestructura digital de un país. Si le apasiona la eficiencia y la ingeniería, este es su lugar.',
    points: [
      { title: 'Cultura Tech', desc: 'Trabajamos con el stack tecnológico más avanzado de la industria.', icon: Zap },
      { title: 'Flexibilidad', desc: 'Modelos de trabajo híbridos diseñados para la productividad real.', icon: Globe },
      { title: 'Crecimiento', desc: 'Planes de carrera acelerados en gestión de productos y operaciones.', icon: Rocket },
      { title: 'Impacto Real', desc: 'Vea el resultado de su trabajo en la seguridad de miles de hogares.', icon: Heart }
    ]
  },
  'soporte_residencial': {
    title: 'Soporte Residencial',
    subtitle: 'Tu Hogar Bajo Protocolo Master',
    icon: Building2,
    color: '#52ffac',
    description: 'Mantenimiento preventivo y correctivo para aires acondicionados, plomería, y electricidad con seguridad garantizada.',
    longDesc: 'Dormir tranquilo sabiendo que sus equipos están en manos expertas es invaluable. El Soporte Residencial de MantechPro elimina la incertidumbre de contratar extraños. Cada visita está agendada, cada técnico está monitoreado por GPS y cada pago está protegido. Es el mantenimiento de su hogar, profesionalizado.',
    points: [
      { title: 'Verificación', desc: 'Protocolo Mantech ID para total seguridad de su familia.', icon: ShieldCheck },
      { title: 'Agendamiento', desc: 'Usted controla el tiempo; el técnico llega en el bloque exacto elegido.', icon: Layout },
      { title: 'Garantía OK', desc: 'Si el trabajo no queda bien, el Escrow no se libera hasta que se corrija.', icon: BadgeCheck },
      { title: 'Precios Justos', desc: 'Tarifas estandarizadas por categoría para evitar cobros abusivos.', icon: PieChart }
    ]
  },
  'mantenimiento_industrial': {
    title: 'Mantenimiento Industrial',
    subtitle: 'Operatividad Crítica Sin Interrupciones',
    icon: Zap,
    color: '#e11d48',
    description: 'Servicios especializados para maquinaria pesada, cuartos fríos y sistemas eléctricos de alto voltaje.',
    longDesc: 'La industria no se detiene, y MantechPro es su garantía de continuidad. Ofrecemos planes de mantenimiento preventivo de grado militar para activos de alta demanda. Nuestra ingeniería MDM-V4 permite monitorear el estado de salud de compresores, generadores y sistemas de elevación, prediciendo fallos antes de que ocurra un paro de producción costoso.',
    points: [
      { title: 'Predicción IA', desc: 'Análisis de telemetría para detectar patrones de desgaste inusuales.', icon: Rocket },
      { title: 'Intervención', desc: 'Equipos de respuesta rápida para reparaciones de emergencia 24/7.', icon: Zap },
      { title: 'Certificación', desc: 'Emisión de reportes técnicos válidos para auditorías ISO y seguros.', icon: FileText },
      { title: 'Asset History', desc: 'Expediente digital inmutable de cada intervención realizada al activo.', icon: ShieldCheck }
    ]
  },
  'sos_hogar_247': {
    title: 'SOS Hogar 24/7',
    subtitle: 'Emergencias Técnicas Inmediatas',
    icon: Zap,
    color: '#e11d48',
    description: 'Protocolo de respuesta ultra-rápido para urgencias que no pueden esperar (Fugas, cortocircuitos, cerrajería).',
    longDesc: 'Una tubería rota a las 2 AM es un desastre. Con el botón SOS de MantechPro, se activa una alerta de prioridad nacional en nuestra red. El técnico disponible más cercano es despachado automáticamente, permitiéndole ver su llegada en tiempo real en el mapa, igual que una app de transporte, pero con un especialista certificado.',
    points: [
      { title: 'Despacho Veloz', desc: 'Algoritmo de cercanía que reduce el tiempo de espera a minutos.', icon: Zap },
      { title: 'Rastreo Mapa', desc: 'Visualice la ruta del especialista hacia su ubicación exacta.', icon: Globe },
      { title: 'Disponibilidad', desc: 'Operativos los 365 días del año, incluyendo feriados nacionales.', icon: ShieldCheck },
      { title: 'Kit de Urgencia', desc: 'Técnicos equipados con materiales base para soluciones inmediatas.', icon: Layout }
    ]
  },
  'marketplace': {
    title: 'Marketplace Mantech',
    subtitle: 'Subasta Inversa de Servicios',
    icon: Store,
    color: '#5d3cfe',
    description: 'Publique su necesidad y deje que los mejores talleres de Panamá compitan por su proyecto con precios transparentes.',
    longDesc: 'El Marketplace de Subasta democratiza el servicio técnico. Al publicar una solicitud, usted recibe múltiples propuestas de especialistas calificados. No solo compiten por precio, sino por reputación y tiempo de entrega. Usted tiene el poder de elegir basándose en datos reales de desempeño, no en promesas vacías.',
    points: [
      { title: 'Transparencia', desc: 'Desglose detallado de mano de obra e insumos antes de contratar.', icon: Layout },
      { title: 'Certificación', desc: 'Solo profesionales con validación de identidad y seguros activos.', icon: BadgeCheck },
      { title: 'Ahorro Real', desc: 'La competencia sana reduce los costos operativos hasta en un 25%.', icon: PieChart },
      { title: 'Reseñas', desc: 'Calificaciones reales basadas en servicios completados exitosamente.', icon: Users }
    ]
  },
  'guias_tecnicas': {
    title: 'Guías Técnicas',
    subtitle: 'Conocimiento Industrial Compartido',
    icon: FileText,
    color: '#5d3cfe',
    description: 'Manuales interactivos y documentación técnica para entender mejor el funcionamiento y cuidado de sus activos.',
    longDesc: 'El conocimiento es poder. Nuestra biblioteca de Guías Técnicas está diseñada para que el usuario domine el funcionamiento de sus equipos. Desde protocolos de instalación hasta diagnósticos de primer nivel, todo el contenido es curado por ingenieros certificados de MantechPro.',
    points: [
      { title: 'Manuales QR', desc: 'Acceso instantáneo a la documentación de fábrica de su equipo específico.', icon: Zap },
      { title: 'Protocolos SOP', desc: 'Procedimientos Operativos Estándar para mantenimiento preventivo básico.', icon: Layout },
      { title: 'Safe Check', desc: 'Listas de verificación de seguridad para antes de operar maquinaria.', icon: ShieldCheck },
      { title: 'Updates', desc: 'Actualización constante de guías según nuevos modelos en el mercado.', icon: Globe }
    ]
  },
  'roi_dashboard': {
    title: 'ROI Dashboard',
    subtitle: 'Analítica Financiera de Activos',
    icon: PieChart,
    color: '#52ffac',
    description: 'Visualice cuánto está ahorrando gracias al mantenimiento preventivo y analice el retorno de inversión.',
    longDesc: 'Un activo es una inversión, no un gasto. El ROI Dashboard de MantechPro le muestra el panorama financiero completo. Comparamos el costo de mantenimiento preventivo contra el costo evitado de reparaciones mayores, dándole una cifra real de ahorro. Es la herramienta definitiva para la toma de decisiones de recambio de equipos.',
    points: [
      { title: 'Ahorro Pro', desc: 'Cálculo matemático de fallos evitados mediante telemetría predictiva.', icon: Zap },
      { title: 'History Cost', desc: 'Gráficas detalladas de gasto acumulado por unidad operativa.', icon: BarChart3 },
      { title: 'Optimización', desc: 'Sugerencias basadas en datos sobre cuándo es más rentable cambiar un equipo.', icon: PieChart },
      { title: 'Exportación', desc: 'Reportes listos para presentar en juntas directivas o contabilidad.', icon: FileText }
    ]
  },
  'relaciones_inversionistas': {
    title: 'Relaciones con Inversionistas',
    subtitle: 'Transparencia y Crecimiento',
    icon: BarChart3,
    color: '#5d3cfe',
    description: 'Información estratégica sobre el desempeño financiero, planes de expansión regional y gobernanza corporativa de MantechPro.',
    longDesc: 'MantechPro es una empresa de alto crecimiento (Scale-up) enfocada en la digitalización de la infraestructura técnica de Panamá. Mantenemos una política de puertas abiertas para nuestros inversionistas y socios estratégicos, proporcionando reportes trimestrales de tracción, rentabilidad y impacto social en la red de técnicos local.',
    points: [
      { title: 'Reportes Q1-Q4', desc: 'Acceso a los estados financieros auditados y métricas de crecimiento.', icon: FileText },
      { title: 'Expansión 2026', desc: 'Plan detallado de apertura en mercados secundarios de Centroamérica.', icon: Globe },
      { title: 'Sostenibilidad', desc: 'Métricas de impacto ambiental (reducción de CO2) y social en el talento local.', icon: Leaf },
      { title: 'Gobernanza', desc: 'Cumplimiento estricto con las regulaciones comerciales de la República de Panamá.', icon: ShieldCheck }
    ]
  }
};

// Map original footer strings to slugs
const slugMap: Record<string, string> = {
  'Quiénes somos': 'quienes_somos',
  'Lo que ofrecemos': 'lo_que_ofrecemos',
  'Sala de prensa': 'sala_prensa',
  'Blog': 'blog',
  'Relaciones con inversionistas': 'relaciones_inversionistas',
  'Oportunidades laborales': 'oportunidades_laborales',
  'Flotas B2B': 'flotas_b2b',
  'Soporte Residencial': 'soporte_residencial',
  'Mantenimiento Industrial': 'mantenimiento_industrial',
  'SOS Hogar 24/7': 'sos_hogar_247',
  'Marketplace': 'marketplace',
  'Seguridad Mantech ID': 'seguridad_mantech_id',
  'Sostenibilidad': 'sostenibilidad',
  'Ecosistema Panamá': 'ecosistema_panama',
  'Centro de Ayuda': 'centro_ayuda',
  'Guías Técnicas': 'guias_tecnicas',
  'ROI Dashboard': 'roi_dashboard',
  'Bóveda de Garantías': 'boveda_garantias'
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

export default function InfoModal({ isOpen, onClose, slug }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', message: '' });
  const scrollRef = useRef<HTMLDivElement>(null);

  // RESET SCROLL TO TOP ON OPEN OR VIEW CHANGE
  useEffect(() => {
    if (isOpen || showForm) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, showForm, slug]);

  if (!isOpen) return null;

  const actualSlug = slugMap[slug] || slug;
  const content = infoRegistry[actualSlug] || {
    title: slug,
    subtitle: 'MantechPro Information Node',
    icon: Building2,
    color: '#5d3cfe',
    description: 'Estamos trabajando para brindarle el mejor contenido técnico.',
    longDesc: 'Muy pronto podrá ver todos los detalles industriales de esta sección. Estamos compilando la información oficial.',
    points: [
      { title: 'Innovación Constante', desc: 'Actualizando protocolos semanalmente.', icon: Zap },
      { title: 'Transparencia', desc: 'Información clara para el usuario.', icon: FileText },
      { title: 'Soporte', desc: 'Contáctenos para más información.', icon: Users }
    ]
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subject: `Consulta sobre ${content.title}`,
          type: actualSlug === 'oportunidades_laborales' ? 'jobs' : 'info'
        })
      });
      if (res.ok) {
        toast.success("Solicitud enviada. Un especialista le contactará por WhatsApp.");
        setShowForm(false);
        setForm({ name: '', email: '', whatsapp: '', message: '' });
      } else {
        throw new Error("Error en el servidor");
      }
    } catch (e) {
      toast.error("Error al enviar. Intente más tarde.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0d0e12]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl bg-[#121317] border border-white/5 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="p-6 sm:p-8 border-b border-white/5 flex justify-between items-center bg-[#1c1d21]/50 shrink-0">
           <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-xl shrink-0" style={{ backgroundColor: `${content.color}20`, color: content.color }}>
                 <content.icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="overflow-hidden">
                 <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tighter italic leading-none truncate">{content.title}</h2>
                 <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-40 mt-1 truncate">{content.subtitle}</p>
              </div>
           </div>
           <button onClick={() => { setShowForm(false); onClose(); }} className="p-3 bg-white/5 hover:bg-rose-600/20 text-white rounded-xl transition-all active:scale-95 shrink-0"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
        </div>

        {/* CONTENT */}
        <div
          ref={scrollRef}
          className="p-6 sm:p-10 space-y-10 overflow-y-auto custom-scrollbar flex-1 scroll-smooth"
        >
           <AnimatePresence mode="wait">
             {!showForm ? (
               <motion.div
                 key="content"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="space-y-10"
               >
                 <div className="space-y-6">
                    <p className="text-[#c8c4d9] text-base sm:text-xl font-medium leading-relaxed italic border-l-4 pl-6 text-justify" style={{ borderColor: content.color }}>
                       "{content.description}"
                    </p>
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8">
                      <p className="text-[#8a879d] text-sm sm:text-base leading-relaxed font-medium text-justify">
                        {content.longDesc}
                      </p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.4em] ml-1">Puntos de Protocolo</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                       {content.points.map((p, i) => (
                         <div key={i} className="p-6 bg-[#0d0e12] rounded-3xl border border-white/5 space-y-4 group hover:border-white/10 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#5d3cfe] group-hover:scale-110 transition-transform duration-500">
                               <p.icon className="w-5 h-5" style={{ color: content.color }} />
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{p.title}</h4>
                               <p className="text-[10px] text-[#474556] font-bold leading-relaxed">{p.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-gradient-to-r from-[#5d3cfe]/10 to-transparent p-8 rounded-[2rem] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center sm:text-left">
                       <h4 className="text-sm font-black text-white uppercase tracking-tight">¿Necesita más información?</h4>
                       <p className="text-[10px] text-[#c8c4d9] font-bold uppercase tracking-widest opacity-60">Póngase en contacto con nuestro equipo estratégico.</p>
                    </div>
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-8 py-3 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:scale-105 transition-all flex items-center gap-3"
                    >
                       <Mail className="w-4 h-4" /> Contactar Ahora
                    </button>
                 </div>
               </motion.div>
             ) : (
               <motion.div
                 key="form"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8"
               >
                 <button
                   onClick={() => setShowForm(false)}
                   className="text-[9px] font-black text-[#5d3cfe] uppercase tracking-widest flex items-center gap-2 hover:underline mb-4"
                 >
                    ← Volver a la información
                 </button>

                 <form onSubmit={handleSendEmail} className="space-y-6 bg-[#0d0e12] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Nombre Completo</label>
                          <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#121317] border border-white/5 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-[#5d3cfe]" placeholder="Ej: Rubén Abrego" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-[#474556] uppercase ml-1">WhatsApp</label>
                          <input required type="tel" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full bg-[#121317] border border-white/5 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-[#52ffac]" placeholder="+507 6000-0000" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Correo Electrónico</label>
                          <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[#121317] border border-white/5 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-[#5d3cfe]" placeholder="email@ejemplo.com" />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-[#474556] uppercase ml-1">Mensaje o Consulta</label>
                       <textarea required rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full bg-[#121317] border border-white/5 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-[#5d3cfe] resize-none" placeholder="Escriba aquí los detalles industriales de su solicitud..." />
                    </div>
                    <button type="submit" disabled={isSending} className="w-full py-4 bg-[#5d3cfe] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
                       {isSending ? "PROCESANDO..." : <><Send className="w-4 h-4" /> Enviar Solicitud Oficial</>}
                    </button>
                 </form>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3 order-2 sm:order-1">
                 <div className="w-2 h-2 rounded-full bg-[#52ffac] animate-pulse"></div>
                 <span className="text-[9px] font-black text-[#474556] uppercase tracking-widest italic">Protocolo Actualizado v4.7 PA • 2026</span>
              </div>
              <button
                onClick={onClose}
                className="w-full sm:w-fit px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all order-1 sm:order-2 active:scale-95 shadow-xl"
              >
                Cerrar Ventana
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
