import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Sparkles, Zap, PieChart, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MantechProLogo from './Logo';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface ChatbotProps {
  isInline?: boolean;
  assets?: any[];
  requests?: any[];
  onScheduleService?: (techId: string, assetId: string) => void;
  initialMode?: 'general' | 'sales';
}

export default function Chatbot247({ isInline = false, assets = [], requests = [], onScheduleService, initialMode = 'general' }: ChatbotProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(isInline);
  const [isMaximized, setIsMaximized] = useState(false);
  const [mode, setMode] = useState<'support' | 'sales'>(initialMode === 'sales' ? 'sales' : 'support');
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: initialMode === 'sales'
        ? t('greetings_sales', '¡Buen día! Es un placer saludarle. Soy su **Asesor MantechPro** 💼. Estoy a su entera disposición para ayudarle a optimizar la gestión y rentabilidad de sus equipos.\n\n¿Le gustaría conocer los beneficios que ofrecemos para **clientes** o prefiere información sobre cómo unirse a nuestra red de **técnicos** especializados?')
        : t('greetings', '¡Hola! Es un placer atenderle. 👋 Soy su **Asesor MantechPro** para Panamá 🇵🇦.\n\nMi objetivo es brindarle el soporte necesario para que sus activos y flota operen siempre en óptimas condiciones. ¿En qué puedo asistirle el día de hoy?'),
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && messages.length > 1) { // Solo auto-scroll si hay más de un mensaje (el saludo inicial no scrollea al fondo)
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isTyping, isOpen]);

  const supportFaqs = [
    { q: t('faq_bid_q', '¿Cómo funcionan las subastas?'), a: t('faq_bid_a', 'Publique su requerimiento y técnicos calificados enviarán sus mejores cotizaciones en tiempo real.') },
    { q: t('faq_requote_q', '¿El precio puede cambiar?'), a: t('faq_requote_a', 'Solo si el técnico encuentra hallazgos adicionales en sitio y usted aprueba la re-cotización digitalmente.') },
    { q: t('faq_warranty_q', '¿Qué es la Bóveda de Garantías?'), a: t('faq_warranty_a', 'Es un espacio seguro donde monitoreamos las fechas de vencimiento de sus equipos para que nunca pierda su cobertura.') },
    { q: t('faq_security_q', '¿Es seguro el servicio?'), a: t('faq_security_a', 'Sí, cada experto cuenta con un Mantech ID validado con Récord Policivo y Cédula. Los pagos están protegidos por Escrow.') }
  ];

  const salesFaqs = [
    { q: t('faq_plans_q', '¿Qué planes corporativos tienen?'), a: t('faq_plans_a', 'Contamos con planes desde $29/mes (Emprendedor) hasta soluciones Enterprise con activos ilimitados.') },
    { q: t('faq_join_tech_q', '¿Cómo ser un Técnico Partner?'), a: t('faq_join_tech_a', 'Regístrese como técnico y suba su documentación en el Mantech ID para empezar a recibir contratos Élite.') },
    { q: t('faq_ph_benefits_q', '¿Beneficios para PH?'), a: t('faq_ph_benefits_a', 'Control de áreas comunes, mantenimiento preventivo de plantas eléctricas y soporte SOS prioritario.') },
    { q: t('faq_demo_q', '¿Solicitar demo personalizada?'), a: t('faq_demo_a', 'Escriba "Solicitar Demo" en el chat y un asesor se pondrá en contacto para una presentación virtual.') }
  ];

  const currentFaqs = mode === 'sales' ? salesFaqs : supportFaqs;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      const lowerInput = input.toLowerCase().trim();
      const isNumeric = /^\d+$/.test(lowerInput);

      const greetings = ['hola', 'buen', 'dia', 'día', 'tarde', 'noche', 'saludo'];
      const farewells = ['gracias', 'ok', 'vale', 'entendido', 'adios', 'adiós', 'listo', 'excelente'];
      const techSupport = ['soporte', 'técnico', 'tecnico', 'ayuda', 'problema', 'falla', 'error', 'asistencia', 'dañado', 'reparación'];
      const salesKeywords = ['plan', 'precio', 'cuanto cuesta', 'costo', 'membresía', 'suscripcion', 'invertir', 'inversión'];
      const complaints = ['no vino', 'no asistió', 'no asistio', 'no llego', 'no llegó', 'tarde', 'esperando', 'incumplimiento', 'malo', 'queja', 'reclamo'];
      const adminPowers = ['cancelar', 'quitar', 'reemplazar', 'cambiar técnico', 'reasignar', 'estado de contrato', 'estatus', 'número de contrato', 'donde esta'];

      const isGreeting = greetings.some(v => lowerInput.includes(v));
      const isFarewell = farewells.some(v => lowerInput.includes(v));
      const isTechQuery = techSupport.some(v => lowerInput.includes(v));
      const isSalesQuery = salesKeywords.some(v => lowerInput.includes(v));
      const isComplaint = complaints.some(v => lowerInput.includes(v));
      const isPowerQuery = adminPowers.some(v => lowerInput.includes(v));

      const isPositive = ['si', 'sí', 'claro', 'por favor', 'proceda', 'afirmativo', 'acepto'].some(v => lowerInput === v || lowerInput.includes(v));
      const isNegative = ['no', 'luego', 'ahora no', 'cancelar', 'negativo', 'rechazar'].some(v => lowerInput === v || lowerInput.includes(v));

      let botResponse = "";

      if (mode === 'sales') {
        if (lastQuestion === 'DEMO_CATEGORY' || lastQuestion === 'QUOTE_CATEGORY') {
          if (lowerInput.includes('ph') || lowerInput.includes('hogar') || lowerInput.includes('edificio')) {
              botResponse = "Excelente elección. Para **PH y Edificios**, nuestro plan Profesional ($89/mes) es el estándar de la industria. Incluye auditoría de áreas comunes y monitoreo de plantas eléctricas.\n\n¿Desea que le envíe el brochure técnico detallado para presentarlo a su Junta Directiva?";
              setLastQuestion('SEND_BROCHURE');
          } else if (lowerInput.includes('flota') || lowerInput.includes('vehiculo') || lowerInput.includes('carro') || lowerInput.includes('camion')) {
              botResponse = "Perfecto. Para **Gestión de Flotas**, nuestro motor IA reduce costos de combustible hasta un 15% mediante telemetría satelital.\n\n¿Cuántas unidades (camiones/carros) gestiona actualmente? (Ej: 10 unidades)";
              setLastQuestion('FLEET_SIZE');
          } else {
              botResponse = "Comprendo. Manejamos requerimientos de alta ingeniería. 🦾\n\n¿Prefiere que agendemos una llamada de 5 minutos con un consultor senior para su caso específico?";
              setLastQuestion('SALES_CALL');
          }
        } else if (lowerInput.includes('demo')) {
          botResponse = "¡Excelente elección! 🚀 He registrado su interés por una **Demo Personalizada**.\n\nUn asesor se pondrá en contacto al correo registrado para coordinar una presentación virtual por Microsoft Teams o Zoom. Verá en detalle el Radar Satelital, los sensores IA y el motor financiero Escrow.\n\n¿Desea que prioricemos la demo para una flota de vehículos o para la gestión de un PH?";
          setLastQuestion('DEMO_CATEGORY');
        } else if (lowerInput.includes('cotizar') || lowerInput.includes('precio') || lowerInput.includes('cuanto')) {
          botResponse = "Para brindarle una cotización exacta, necesito saber el tipo de activo. 🛠️\n\n¿Su requerimiento es para un **Hogar (PH)**, una **Flota de Vehículos** o **Maquinaria Industrial**? Nuestros planes inician desde los $29/mes.";
          setLastQuestion('QUOTE_CATEGORY');
        } else {
          botResponse = "Como su asesor comercial, puedo ayudarle a elegir el mejor plan de mantenimiento. 💼\n\n¿Desea conocer nuestros planes corporativos o prefiere agendar una cita de evaluación gratuita?";
        }
      } else {
        if (lastQuestion && (isPositive || isNegative)) {
          if (lastQuestion === 'REASSIGN_TECH') {
            if (isPositive) {
              botResponse = "Entendido. Como su asesor, he **ANULADO** la asignación previa. He habilitado el acceso al **Market de Especialistas**, sincronizado con nuestro **Radar Satelital**.\n\nPor razones de seguridad y privacidad, nuestro sistema solo muestra en el Radar a los técnicos que han **activado manualmente su posición de servicio**. Esto garantiza que usted elija a un experto que está en línea y ha autorizado compartir su ubicación para atenderle.\n\n¿Desea que le brinde consejos para seleccionar al mejor candidato disponible?";
              setLastQuestion('ASSIST_SELECTION');
            } else {
              botResponse = "Comprendo perfectamente. Mantendremos al técnico actual asignado. He enviado una notificación de 'Prioridad Máxima' a su terminal para agilizar su llegada. ¿Puedo asistirle en algo más?";
              setLastQuestion(null);
            }
          } else if (lastQuestion === 'ASSIST_SELECTION' && isPositive) {
              botResponse = "Con gusto. Al explorar el **Market**, le sugiero priorizar a los técnicos con el sello de **'Ingeniería Verificada'**. \n\nNuestro **Radar** ya los ha ordenado por cercanía, pero usted puede comparar sus calificaciones y elegir al que le brinde mayor confianza. ¿Desea que verifique el estatus de algún otro activo?";
              setLastQuestion(null);
          } else if (lastQuestion === 'GUIDE_CERTIFICATION') {
            if (isPositive) {
              botResponse = "Excelente. Los requisitos para la certificación **Partner Élite** son:\n\n1️⃣ Cédula o RUC.\n2️⃣ Récord Policivo.\n3️⃣ Idoneidad técnica.\n\nHe habilitado un módulo de carga en su perfil. ¿Desea ayuda para localizarlo?";
              setLastQuestion('EXPLAIN_UPLOAD');
            } else {
              botResponse = "Entendido. Quedo atento por si decide escalar su nivel en el futuro. ¿Alguna otra consulta?";
              setLastQuestion(null);
            }
          } else {
              botResponse = "Entendido. Quedo a su disposición para cualquier otra consulta que surja. ¿Desea ver información de **Planes** o requiere **Soporte Técnico**?";
              setLastQuestion(null);
          }
        } else if (lowerInput.includes('qué es el número de contrato') || lowerInput.includes('que es el numero de contrato') || (lowerInput.includes('contrato') && (lowerInput.includes('que') || lowerInput.includes('qué')) && lowerInput.includes('número'))) {
          botResponse = "Con gusto le explico. El **Número de Contrato** es el identificador único de su servicio (ej: #101). Lo puede encontrar fácilmente en su pestaña de **Contratos**.\n\nRespecto a su duda sobre el equipo, nuestro sistema central vincula cada activo con su hoja de ruta técnica. Si usted me indica el nombre del equipo (ej: *Planta Eléctrica 02*), yo puedo rastrear quién es el especialista asignado para proceder con el cambio.\n\n¿Desea indicarme el nombre de su equipo ahora?";
        } else if (isNumeric || isPowerQuery || (isComplaint && lowerInput.length > 3)) {
          const foundRequest = requests.find(r =>
            r.id.includes(lowerInput) ||
            lowerInput.includes(r.id.replace('req-', '')) ||
            r.assetName.toLowerCase().includes(lowerInput) ||
            lowerInput.includes(r.assetName.toLowerCase())
          );
          if (foundRequest) {
            botResponse = `He verificado el estado de su contrato activo. 🔍\n\n**ESTATUS ADMINISTRATIVO:**\n• **Número de Contrato**: #${foundRequest.id}\n• **Activo**: ${foundRequest.assetName}\n• **Técnico**: ${foundRequest.techName}\n• **Estado**: ${foundRequest.status.toUpperCase()}\n\nComo su asesor, tengo la potestad de anular esta asignación. Si lo desea, puedo reabrir el radar para que **usted elija personalmente** a un nuevo especialista de entre los candidatos disponibles.\n\n¿Desea que proceda a liberar el radar para su elección ahora mismo?`;
            setLastQuestion('REASSIGN_TECH');
          } else if (isNumeric) {
            botResponse = `He consultado el número de contrato **#${lowerInput}** en nuestra base central, pero no logré localizar una coincidencia. 🙇‍♂️\n\nPor favor, verifique el número en su pestaña de **Contratos** o indíqueme simplemente el nombre de su activo para que pueda asistirlo.`;
          } else if (isPowerQuery && !foundRequest) {
            botResponse = "Para ejercer mis facultades de cancelación o cambio, necesito identificar su contrato. 📝\n\n¿Podría facilitarme el **nombre de su equipo** o el **número de contrato**? Con esa información tomaré el control de la situación de inmediato.";
          } else {
            botResponse = "Le ofrezco una disculpa. Como su asesor, necesito el nombre de su equipo o el número de contrato para ver el estado de sus servicios y tomar acciones correctivas. ¿Podría proporcionármelo?";
          }
        } else if (isSalesQuery || lowerInput.includes('partner') || lowerInput.includes('master') || lowerInput.includes('enterprise')) {
          if (lowerInput.includes('partner')) {
              botResponse = "El nivel **Partner Élite** es nuestra categoría más prestigiosa para especialistas. 🛠️\n\nBeneficios: Comisión 5%, prioridad satelital y sello de ingeniería. ¿Desea que le asista con los requisitos?";
              setLastQuestion('GUIDE_CERTIFICATION');
          } else if (lowerInput.includes('master')) {
              botResponse = "El plan **Profesional** permite gestionar hasta **25 unidades** con auditoría de combustible e IA Predictiva. 🚚\n\n¿Le interesa coordinar una demostración de estas analíticas?";
              setLastQuestion('DEMO_ANALYTICS');
          } else {
              botResponse = "Con gusto le presento nuestras opciones de inversión comercial:\n\n🏢 **EMPRESAS:**\n• **Emprendedor**: $29/mes (Hasta 5 activos)\n• **Profesional**: $89/mes (Hasta 25 activos + Auditoría)\n• **Enterprise**: $199/mes (Ilimitado + API)\n\n🛠 **TÉCNICOS:**\n• **Pro**: $45/mes\n• **Partner**: $99/mes\n\n¿Cuál de estos niveles se ajusta mejor a sus objetivos?";
          }
        } else if (isGreeting) {
          botResponse = "¡Hola! Es un placer saludarle. 👋 Soy su **Asesor MantechPro** para Panamá.\n\nComo su gestor central, tengo potestad para verificar sus **contratos**, realizar **cambios de técnicos** o brindarle información sobre nuestros **planes**. ¿En qué puedo asistirle hoy?";
        } else if (isFarewell) {
          botResponse = "Ha sido un verdadero placer asistirle. 😊 Recuerde que estoy monitoreando su operación 24/7. ¡Que tenga un excelente día!";
          setLastQuestion(null);
        } else {
          botResponse = "Comprendo su mensaje. Como su **Asesor MantechPro**, mi prioridad es resolver cualquier incidencia operativa. 👋\n\n¿Desea ver el **estado de un contrato**, requiere un **cambio de técnico** o prefiere consultar nuestros **planes** corporativos?";
        }
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsBotTyping(false);
    }, 1500);
  };

  const formatMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-[#52ffac]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderContent = () => (
    <div className={`bg-[#0d0e12] border border-white/5 flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${
      isInline
        ? "w-full h-full rounded-[2.5rem]"
        : isMaximized
          ? "fixed inset-8 md:inset-20 z-[600] w-auto h-auto rounded-[3.5rem] shadow-[0_0_150px_rgba(93,60,254,0.3)]"
          : "w-[360px] md:w-[450px] h-[600px] md:h-[750px] max-h-[calc(100vh-140px)] rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] mb-4"
    }`}>
      {/* HEADER COMPACTO */}
      <div className="bg-[#1c1d21]/80 backdrop-blur-xl p-3 md:p-4 text-white flex items-center justify-between shrink-0 border-b border-white/10 z-20 flex-none">
        <div className="flex items-center gap-3">
          <MantechProLogo size="sm" showText={false} className="w-8 h-8" />
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] leading-none text-white">Asesor MantechPro</h4>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 bg-[#52ffac] rounded-full animate-pulse shadow-[0_0_8px_#52ffac]"></span>
              <span className="text-[7px] font-black text-[#52ffac] uppercase tracking-widest">Protocolo Activo</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isInline && (
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/40"
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
          {!isInline && (
            <button onClick={() => { setIsOpen(false); setIsMaximized(false); }} className="p-2 hover:bg-rose-500/20 text-white/40">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SELECTOR DE MODO COMPRIMIDO */}
      <div className="px-4 py-2 bg-[#121317]/50 border-b border-white/5 flex flex-none">
         <div className="flex p-0.5 bg-[#0d0e12] rounded-xl border border-white/5 w-full">
            <button
              onClick={() => setMode('support')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${mode === 'support' ? 'bg-[#1c1d21] text-white shadow-lg' : 'bg-transparent text-white/20'}`}
            >
              <Zap className={`w-2.5 h-2.5 ${mode === 'support' ? 'text-[#5d3cfe] fill-current' : 'opacity-20'}`} /> Soporte
            </button>
            <button
              onClick={() => setMode('sales')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${mode === 'sales' ? 'bg-[#52ffac] text-black shadow-lg' : 'bg-transparent text-white/20'}`}
            >
              <PieChart className={`w-2.5 h-2.5 ${mode === 'sales' ? 'text-black' : 'opacity-20'}`} /> Ventas
            </button>
         </div>
      </div>

      {/* CHAT BODY - ESPACIO MAXIMIZADO */}
      <div className="flex-1 overflow-y-auto relative p-6 space-y-6 custom-scrollbar bg-[#0d0e12] grid-bg min-h-0 pt-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[#5d3cfe]/5 to-transparent pointer-events-none"></div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex relative z-10 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-[88%] p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-2xl transition-all whitespace-pre-line border ${
                msg.sender === 'user'
                  ? "bg-[#5d3cfe] text-white rounded-tr-none border-white/20"
                  : "bg-[#1c1d21]/90 backdrop-blur-md border-white/10 text-white rounded-tl-none"
              }`}
            >
              {formatMessageText(msg.text)}
              <div className={`text-[6px] mt-2.5 font-black uppercase tracking-[0.2em] opacity-30 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.sender === 'user' ? 'Enviado' : 'MantechPro Core'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
            </motion.div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1c1d21] border border-white/10 p-3 rounded-xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-[#5d3cfe] rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-[#5d3cfe] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-[#5d3cfe] rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* SUGERENCIAS Y PANEL DE ENTRADA UNIFICADOS */}
      <div className="flex-none bg-[#1c1d21] border-t border-white/10 p-4 space-y-4">
         <div className="flex gap-2 overflow-x-auto no-scrollbar mask-fade-right">
            {currentFaqs.map((faq, i) => (
               <button
                 key={i}
                 onClick={() => {
                   setMessages(prev => [...prev, { id: Date.now().toString(), text: faq.q, sender: 'user', timestamp: new Date() }]);
                   setTimeout(() => {
                     setMessages(prev => [...prev, { id: (Date.now()+1).toString(), text: faq.a, sender: 'bot', timestamp: new Date() }]);
                   }, 500);
                 }}
                 className="px-3 py-1.5 bg-[#0d0e12] border border-white/5 rounded-full whitespace-nowrap hover:bg-[#5d3cfe] transition-all"
               >
                  <p className="text-[7px] font-black text-[#c8c4d9] uppercase">{faq.q}</p>
               </button>
            ))}
         </div>

         <div className="flex gap-2 bg-[#0d0e12] p-1.5 rounded-xl border border-white/10 focus-within:border-[#5d3cfe]/50 transition-all shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Consultar..."
              className="flex-1 bg-transparent px-3 py-1 text-xs text-white outline-none placeholder:text-[#474556] font-bold"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-2.5 rounded-lg transition-all ${input.trim() ? 'bg-[#5d3cfe] text-white' : 'bg-white/5 text-[#474556]'}`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
         </div>
      </div>
    </div>
  );

  return (
    <div className={isInline ? "w-full h-full flex flex-col" : "fixed bottom-20 right-4 md:bottom-8 md:right-8 z-[100] font-sans flex flex-col items-end"}>
      {isInline ? (
        renderContent()
      ) : (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
            >
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {!isInline && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 md:w-16 md:h-16 bg-[#5d3cfe] rounded-full flex items-center justify-center text-white shadow-2xl shadow-[#5d3cfe]/40 relative group overflow-hidden border-2 border-white/10"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-8 h-8" />}
        </motion.button>
      )}
    </div>
  );
}
