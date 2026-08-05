import React from 'react';
import { X, ShieldCheck, Globe, Zap, Users, Building2, FileText, Layout, Store, PieChart, BadgeCheck, Heart, Leaf, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

interface InfoContent {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  description: string;
  points: { title: string; desc: string; icon: any }[];
}

const infoRegistry: Record<string, InfoContent> = {
  'quienes_somos': {
    title: 'Quiénes somos',
    subtitle: 'La Infraestructura Técnica de Panamá',
    icon: Building2,
    color: '#5d3cfe',
    description: 'MantechPro nació con una misión clara: profesionalizar el sector de mantenimiento en la región mediante tecnología de punta y protocolos de seguridad industrial.',
    points: [
      { title: 'Ingeniería Panameña', desc: 'Desarrollado localmente con estándares globales.', icon: Globe },
      { title: 'Visión 2030', desc: 'Liderar la transformación digital de activos físicos.', icon: Zap },
      { title: 'Compromiso Ético', desc: 'Transparencia total en cada transacción y servicio.', icon: ShieldCheck }
    ]
  },
  'lo_que_ofrecemos': {
    title: 'Lo que ofrecemos',
    subtitle: 'Ecosistema de Mantenimiento 360°',
    icon: Layout,
    color: '#52ffac',
    description: 'Desde soporte residencial hasta gestión de flotas B2B, nuestra plataforma adapta sus herramientas a su necesidad real.',
    points: [
      { title: 'Diagnóstico IA', desc: 'Motor MDM-V4 para predicción de fallos.', icon: Zap },
      { title: 'Wallet Blindada', desc: 'Sistema Escrow para seguridad en el pago.', icon: BadgeCheck },
      { title: 'Red de Expertos', desc: 'Técnicos certificados con Mantech ID.', icon: Users }
    ]
  },
  'flotas_b2b': {
    title: 'Flotas B2B',
    subtitle: 'Logística de Grado Industrial',
    icon: Globe,
    color: '#5d3cfe',
    description: 'Optimice el tiempo operativo de su flota con nuestro panel de control centralizado y mantenimiento proyectado.',
    points: [
      { title: 'Rastreo Satelital', desc: 'Monitoreo en tiempo real de unidades.', icon: Globe },
      { title: 'Carga Masiva', desc: 'Importación vía Excel para grandes flotas.', icon: FileText },
      { title: 'Auditoría de Combustible', desc: 'Control de consumo y eficiencia térmica.', icon: Zap }
    ]
  },
  'seguridad_mantech_id': {
    title: 'Seguridad Mantech ID',
    subtitle: 'Confianza Validada Biométricamente',
    icon: ShieldCheck,
    color: '#e11d48',
    description: 'El protocolo Mantech ID asegura que cada profesional en su propiedad sea quien dice ser, con antecedentes verificados.',
    points: [
      { title: 'Verificación de Cédula', desc: 'Cruce de datos biométricos en tiempo real.', icon: BadgeCheck },
      { title: 'Récord Policivo', desc: 'Validación de antecedentes de seguridad.', icon: ShieldCheck },
      { title: 'Carnet Digital QR', desc: 'Acceso inmediato al expediente del técnico.', icon: Zap }
    ]
  },
  'sostenibilidad': {
    title: 'Sostenibilidad',
    subtitle: 'Mantenimiento Verde & Eficiente',
    icon: Leaf,
    color: '#52ffac',
    description: 'Creemos en alargar la vida útil de los activos para reducir el impacto ambiental y mejorar el ROI de nuestros clientes.',
    points: [
      { title: 'Cero Papel', desc: 'Gestión 100% digital de facturas y reportes.', icon: FileText },
      { title: 'Eficiencia Energética', desc: 'Optimización de equipos para menor consumo.', icon: Zap },
      { title: 'Economía Circular', desc: 'Promovemos la reparación profesional vs descarte.', icon: Heart }
    ]
  },
  'ecosistema_panama': {
    title: 'Ecosistema Panamá',
    subtitle: 'Crecimiento Económico Local',
    icon: Rocket,
    color: '#5d3cfe',
    description: 'MantechPro impulsa a la pequeña y mediana empresa técnica panameña, dándoles herramientas digitales de nivel corporativo.',
    points: [
      { title: 'Impulso PYME', desc: 'Formalización de talleres y técnicos.', icon: Building2 },
      { title: 'Talento Local', desc: 'Inversión en capacitación continua.', icon: Users },
      { title: 'Hub Tecnológico', desc: 'Posicionando a Panamá como líder en PropTech.', icon: Globe }
    ]
  },
  'centro_ayuda': {
    title: 'Centro de Ayuda',
    subtitle: 'Soporte 24/7 a su disposición',
    icon: Users,
    color: '#5d3cfe',
    description: 'Nuestro equipo de soporte estratégico y nuestro asistente IA están listos para resolver cualquier incidencia.',
    points: [
      { title: 'Chat 24/7', desc: 'Asistencia técnica inmediata vía App.', icon: Zap },
      { title: 'SLA Prioritario', desc: 'Respuesta en menos de 1h para Enterprise.', icon: BadgeCheck },
      { title: 'Guías de Usuario', desc: 'Tutoriales paso a paso del ecosistema.', icon: FileText }
    ]
  },
  'boveda_garantias': {
    title: 'Bóveda de Garantías',
    subtitle: 'Seguridad para sus activos',
    icon: ShieldCheck,
    color: '#f59e0b',
    description: 'Nunca pierda una garantía de nuevo. Almacenamos digitalmente facturas y certificados con alertas de vencimiento.',
    points: [
      { title: 'Alertas de Expiración', desc: 'Notificaciones antes de que venza el plazo.', icon: Zap },
      { title: 'Hash de Integridad', desc: 'Documentos inmutables en la nube.', icon: FileText },
      { title: 'Acceso QR', desc: 'Escanee su activo y vea su garantía.', icon: BadgeCheck }
    ]
  },
  'sala_prensa': {
    title: 'Sala de Prensa',
    subtitle: 'Comunicación Corporativa Oficial',
    icon: FileText,
    color: '#5d3cfe',
    description: 'Manténgase al día con los hitos de MantechPro, desde lanzamientos tecnológicos hasta alianzas estratégicas en la región.',
    points: [
      { title: 'Notas de Prensa', desc: 'Comunicados oficiales del Nodo Central.', icon: Globe },
      { title: 'Media Kit', desc: 'Recursos gráficos para prensa y aliados.', icon: Layout },
      { title: 'Eventos Tech', desc: 'Nuestra participación en cumbres de industria.', icon: Zap }
    ]
  },
  'blog': {
    title: 'Mantech Blog',
    subtitle: 'Cultura Técnica Panameña',
    icon: Globe,
    color: '#52ffac',
    description: 'Descubra artículos sobre mantenimiento predictivo, optimización de equipos y el futuro del PropTech en Panamá.',
    points: [
      { title: 'Consejos Pro', desc: 'Guías para alargar la vida útil de equipos.', icon: Zap },
      { title: 'Casos de Éxito', desc: 'Resultados reales en empresas panameñas.', icon: BadgeCheck },
      { title: 'Tech Trends', desc: 'Lo último en IA aplicada a la industria.', icon: Rocket }
    ]
  },
  'oportunidades_laborales': {
    title: 'Trabaja con Nosotros',
    subtitle: 'Únete a la Revolución Técnica',
    icon: Users,
    color: '#5d3cfe',
    description: 'Buscamos ingenieros, desarrolladores y especialistas en logística apasionados por transformar la industria del servicio técnico.',
    points: [
      { title: 'Cultura Élite', desc: 'Ambiente de alto rendimiento y colaboración.', icon: ShieldCheck },
      { title: 'Crecimiento', desc: 'Planes de carrera en gestión industrial.', icon: Rocket },
      { title: 'Innovación', desc: 'Trabaje con las herramientas más avanzadas.', icon: Zap }
    ]
  },
  'soporte_residencial': {
    title: 'Soporte Residencial',
    subtitle: 'Tu Hogar Bajo Protocolo Master',
    icon: Building2,
    color: '#52ffac',
    description: 'Mantenimiento preventivo y correctivo para aires acondicionados, plomería, electricidad y más, con la seguridad que tu familia merece.',
    points: [
      { title: 'Técnicos Verificados', desc: 'Identidad validada ante cada visita.', icon: ShieldCheck },
      { title: 'Visita Programada', desc: 'Usted elige el día y la hora exacta.', icon: Layout },
      { title: 'Pago Garantizado', desc: 'Escrow que protege su dinero hasta el OK.', icon: BadgeCheck }
    ]
  },
  'mantenimiento_industrial': {
    title: 'Mantenimiento Industrial',
    subtitle: 'Operatividad Crítica Sin Interrupciones',
    icon: Zap,
    color: '#e11d48',
    description: 'Servicios especializados para maquinaria pesada, cuartos fríos, ascensores y sistemas eléctricos de alto voltaje.',
    points: [
      { title: 'Ingeniería MDM-V4', desc: 'Monitoreo de desgaste en tiempo real.', icon: Rocket },
      { title: 'SLA de Emergencia', desc: 'Atención prioritaria para paros técnicos.', icon: Zap },
      { title: 'Reportes NASA', desc: 'Documentación técnica con sello de integridad.', icon: FileText }
    ]
  },
  'sos_hogar_247': {
    title: 'SOS Hogar 24/7',
    subtitle: 'Emergencias Técnicas Inmediatas',
    icon: Zap,
    color: '#e11d48',
    description: 'Protocolo de respuesta ultra-rápido para urgencias que no pueden esperar (Fugas, cortocircuitos, cerrajería).',
    points: [
      { title: 'Lanzamiento SOS', desc: 'Botón de pánico técnico en su App.', icon: Zap },
      { title: 'Rastreo en Vivo', desc: 'Vea al técnico llegar en el mapa.', icon: Globe },
      { title: 'Disponibilidad', desc: 'Operativos 365 días del año.', icon: ShieldCheck }
    ]
  },
  'marketplace': {
    title: 'Marketplace Mantech',
    subtitle: 'Subasta Inversa de Servicios',
    icon: Store,
    color: '#5d3cfe',
    description: 'Publique su necesidad y deje que los mejores talleres de Panamá compitan por su proyecto con precios transparentes.',
    points: [
      { title: 'Transparencia', desc: 'Compare precios y reseñas verificadas.', icon: Layout },
      { title: 'Certificación', desc: 'Solo talleres con Mantech ID activo.', icon: BadgeCheck },
      { title: 'Ahorro Real', desc: 'Optimización de costos por competencia.', icon: PieChart }
    ]
  },
  'guias_tecnicas': {
    title: 'Guías Técnicas',
    subtitle: 'Conocimiento Industrial Compartido',
    icon: FileText,
    color: '#5d3cfe',
    description: 'Manuales interactivos y tutoriales en video para entender mejor el funcionamiento y cuidado de sus activos.',
    points: [
      { title: 'Manuales QR', desc: 'Escanee y vea el manual de su equipo.', icon: Zap },
      { title: 'Video Tutoriales', desc: 'Aprenda a realizar ajustes básicos.', icon: Layout },
      { title: 'Buenas Prácticas', desc: 'Protocolos de ahorro y eficiencia.', icon: ShieldCheck }
    ]
  },
  'roi_dashboard': {
    title: 'ROI Dashboard',
    subtitle: 'Analítica Financiera de Activos',
    icon: PieChart,
    color: '#52ffac',
    description: 'Visualice cuánto está ahorrando gracias al mantenimiento preventivo y analice el retorno de inversión de cada unidad.',
    points: [
      { title: 'Ahorro Proyectado', desc: 'Cálculo de fallos evitados por MTTO.', icon: Zap },
      { title: 'Costos de Vida', desc: 'Rastreo histórico de gasto por equipo.', icon: FileText },
      { title: 'Optimización', desc: 'Sugerencias de recambio de activos.', icon: PieChart }
    ]
  }
};

// Map original footer strings to slugs
const slugMap: Record<string, string> = {
  'Quiénes somos': 'quienes_somos',
  'Lo que ofrecemos': 'lo_que_ofrecemos',
  'Sala de prensa': 'sala_prensa',
  'Blog': 'blog',
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
  if (!isOpen) return null;

  // Si no hay slug mapeado, usar uno por defecto o el que venga
  const actualSlug = slugMap[slug] || slug;
  const content = infoRegistry[actualSlug] || {
    title: slug,
    subtitle: 'MantechPro Information Node',
    icon: Building2,
    color: '#5d3cfe',
    description: 'Estamos trabajando para brindarle el mejor contenido técnico. Muy pronto podrá ver todos los detalles industriales de esta sección.',
    points: [
      { title: 'Innovación Constante', desc: 'Actualizando protocolos semanalmente.', icon: Zap },
      { title: 'Transparencia', desc: 'Información clara para el usuario.', icon: FileText },
      { title: 'Soporte', desc: 'Contáctenos para más información.', icon: Users }
    ]
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0d0e12]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#121317] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative"
      >
        {/* HEADER */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1c1d21]/50">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl" style={{ backgroundColor: `${content.color}20`, color: content.color }}>
                 <content.icon className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">{content.title}</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{content.subtitle}</p>
              </div>
           </div>
           <button onClick={onClose} className="p-3 bg-white/5 hover:bg-rose-600/20 text-white rounded-xl transition-all"><X className="w-5 h-5" /></button>
        </div>

        {/* CONTENT */}
        <div className="p-10 space-y-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
           <p className="text-[#c8c4d9] text-lg font-medium leading-relaxed italic border-l-4 pl-6" style={{ borderColor: content.color }}>
              "{content.description}"
           </p>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.points.map((p, i) => (
                <div key={i} className="p-6 bg-[#0d0e12] rounded-3xl border border-white/5 space-y-4 group hover:border-white/10 transition-all">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#5d3cfe] group-hover:scale-110 transition-transform duration-500">
                      <p.icon className="w-5 h-5" style={{ color: content.color }} />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{p.title}</h4>
                      <p className="text-[9px] text-[#474556] font-bold leading-relaxed">{p.desc}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="pt-8 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-[#52ffac] animate-pulse"></div>
                 <span className="text-[8px] font-black text-[#474556] uppercase tracking-widest italic">Actualizado Panamá 2026</span>
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase hover:bg-white/10 transition-all"
              >
                Volver al Portal
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
