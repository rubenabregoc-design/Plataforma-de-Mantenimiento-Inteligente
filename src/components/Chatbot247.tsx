import React, { useState, useEffect, useRef } from 'react';
import { MessageCircleMore, MessageSquare, Send, X, Sparkles, User, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

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
  onScheduleService?: (category: string) => void;
  initialMode?: 'general' | 'sales';
}

export default function Chatbot247({ isInline = false, assets = [], requests = [], onScheduleService, initialMode = 'general' }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(isInline);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: initialMode === 'sales'
        ? '¡Buen día! Es un placer saludarle. Soy su **Asesor MantechPro** 💼. Estoy a su entera disposición para ayudarle a optimizar la gestión y rentabilidad de sus equipos.\n\n¿Le gustaría conocer los beneficios que ofrecemos para **clientes** o prefiere información sobre cómo unirse a nuestra red de **técnicos** especializados?'
        : '¡Hola! Es un placer atenderle. 👋 Soy su **Asesor MantechPro** para Panamá 🇵🇦.\n\nMi objetivo es brindarle el soporte necesario para que sus activos y flota operen siempre en óptimas condiciones. ¿En qué puedo asistirle el día de hoy?',
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
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isTyping, isOpen]);

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

    // Lógica Avanzada del Asesor MantechPro con Potestad Administrativa
    setTimeout(() => {
      const lowerInput = input.toLowerCase().trim();
      const isNumeric = /^\d+$/.test(lowerInput);

      // Categorías de Palabras Clave Ampliadas y Potestades
      const greetings = ['hola', 'buen', 'dia', 'día', 'tarde', 'noche', 'saludo'];
      const farewells = ['gracias', 'ok', 'vale', 'entendido', 'adios', 'adiós', 'listo', 'excelente'];
      const techSupport = ['soporte', 'técnico', 'tecnico', 'ayuda', 'problema', 'falla', 'error', 'asistencia', 'dañado', 'reparación'];
      const salesKeywords = ['plan', 'precio', 'cuanto cuesta', 'costo', 'membresía', 'suscripcion', 'invertir', 'inversión'];
      const complaints = ['no vino', 'no asistió', 'no asistio', 'no llego', 'no llegó', 'tarde', 'esperando', 'incumplimiento', 'malo', 'queja'];

      // Palabras Clave de Potestad Administrativa (Poder de Resolución)
      const adminPowers = ['cancelar', 'quitar', 'reemplazar', 'cambiar técnico', 'reasignar', 'estado de contrato', 'estatus', 'folio', 'donde esta'];

      const isGreeting = greetings.some(v => lowerInput.includes(v));
      const isFarewell = farewells.some(v => lowerInput.includes(v));
      const isTechQuery = techSupport.some(v => lowerInput.includes(v));
      const isSalesQuery = salesKeywords.some(v => lowerInput.includes(v));
      const isComplaint = complaints.some(v => lowerInput.includes(v));
      const isPowerQuery = adminPowers.some(v => lowerInput.includes(v));

      const isPositive = ['si', 'sí', 'claro', 'por favor', 'proceda', 'afirmativo', 'acepto'].some(v => lowerInput === v || lowerInput.includes(v));
      const isNegative = ['no', 'luego', 'ahora no', 'cancelar', 'negativo', 'rechazar'].some(v => lowerInput === v || lowerInput.includes(v));

      let botResponse = "";

      // 1. FASE: EJECUCIÓN DE POTESTADES (Contextual)
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
      }
      // 2. FASE: GESTIÓN DE CONTRATOS Y TÉCNICOS (Búsqueda Real)
      else if (isNumeric || isPowerQuery || (isComplaint && lowerInput.length > 3)) {
        const foundRequest = requests.find(r =>
          r.id.includes(lowerInput) ||
          lowerInput.includes(r.id.replace('req-', '')) ||
          r.assetName.toLowerCase().includes(lowerInput) ||
          lowerInput.includes(r.assetName.toLowerCase())
        );

        if (foundRequest) {
          botResponse = `He verificado el estado de su contrato activo. 🔍\n\n**ESTATUS ADMINISTRATIVO:**\n• **Folio**: #${foundRequest.id}\n• **Activo**: ${foundRequest.assetName}\n• **Técnico**: ${foundRequest.techName}\n• **Estado**: ${foundRequest.status.toUpperCase()}\n\nComo su asesor, tengo la potestad de anular esta asignación. Si lo desea, puedo reabrir el radar para que **usted elija personalmente** a un nuevo especialista de entre los candidatos disponibles.\n\n¿Desea que proceda a liberar el radar para su elección ahora mismo?`;
          setLastQuestion('REASSIGN_TECH');
        } else if (isNumeric) {
          botResponse = `He consultado el folio **#${lowerInput}** en nuestra base central, pero no logré localizar una coincidencia. 🙇‍♂️\n\nPor favor, verifique el número en su pestaña de **Contratos** o indíqueme simplemente el nombre de su equipo para que pueda asistirlo.`;
        } else if (isPowerQuery && !foundRequest) {
          botResponse = "Para ejercer mis facultades de cancelación o cambio, necesito identificar su contrato. 📝\n\n¿Podría facilitarme el **nombre de su equipo** o el **numero de folio**? Con esa información tomaré el control de la situación de inmediato.";
        } else {
          botResponse = "Le ofrezco una disculpa. Como su asesor, necesito el nombre de su equipo o el número de folio para ver el estado de sus servicios y tomar acciones correctivas. ¿Podría proporcionármelo?";
        }
      }
      // 3. FASE: CONSULTA COMERCIAL (Ventas)
      else if (isSalesQuery || lowerInput.includes('partner') || lowerInput.includes('master') || lowerInput.includes('enterprise')) {
        if (lowerInput.includes('partner')) {
            botResponse = "El nivel **Partner Élite** es nuestra categoría más prestigiosa para especialistas. 🛠️\n\nBeneficios: Comisión 5%, prioridad satelital y sello de ingeniería. ¿Desea que le asista con los requisitos?";
            setLastQuestion('GUIDE_CERTIFICATION');
        } else if (lowerInput.includes('master')) {
            botResponse = "El plan **Flota Master** permite gestionar hasta **25 unidades** con auditoría de combustible e IA Predictiva. 🚚\n\n¿Le interesa coordinar una demostración de estas analíticas?";
            setLastQuestion('DEMO_ANALYTICS');
        } else {
            botResponse = "Con gusto le presento nuestras opciones de inversión comercial:\n\n🏢 **EMPRESAS:**\n• **Emprendedor**: $29/mes\n• **Flota Master**: $89/mes\n• **Enterprise**: Plan a medida\n\n🛠 **TÉCNICOS:**\n• **Pro**: $45/mes\n• **Partner**: $99/mes\n\n¿Cuál de estos niveles se ajusta mejor a sus objetivos?";
        }
      }
      // 4. FASE: SALUDO / SOPORTE GENERAL
      else if (isGreeting) {
        botResponse = "¡Hola! Es un placer saludarle. 👋 Soy su **Asesor MantechPro** para Panamá.\n\nComo su gestor central, tengo potestad para verificar sus **contratos**, realizar **cambios de técnicos** o brindarle información sobre nuestros **planes**. ¿En qué puedo asistirle hoy?";
      }
      else if (isFarewell) {
        botResponse = "Ha sido un verdadero placer asistirle. 😊 Recuerde que estoy monitoreando su operación 24/7. ¡Que tenga un excelente día!";
        setLastQuestion(null);
      }
      else {
        botResponse = "Comprendo su mensaje. Como su **Asesor MantechPro**, mi prioridad es resolver cualquier incidencia operativa. 👋\n\n¿Desea ver el **estado de un contrato**, requiere un **cambio de técnico** o prefiere consultar nuestros **planes** corporativos?";
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
    <div className={`bg-[#0d0e12] border border-white/5 flex flex-col overflow-hidden ${
      isInline
        ? "w-full h-full rounded-[2.5rem]"
        : "w-[340px] md:w-[420px] h-[500px] md:h-[600px] max-h-[calc(100vh-140px)] rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] mb-4"
    }`}>
      {/* Header */}
      <div className="bg-[#1c1d21] p-5 md:p-6 text-white flex items-center justify-between shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Logo size="sm" showText={false} />
          <div>
            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] leading-none text-white">Asesor MantechPro</h4>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 bg-[#52ffac] rounded-full animate-pulse shadow-[0_0_8px_#52ffac]"></span>
              <span className="text-[9px] font-black text-[#52ffac] uppercase tracking-widest">En línea ahora</span>
            </div>
          </div>
        </div>
        {!isInline && (
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all shrink-0">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#0d0e12]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#5d3cfe05,transparent_70%)] pointer-events-none"></div>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex relative z-10 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[2rem] text-xs leading-relaxed shadow-2xl transition-all whitespace-pre-line ${
              msg.sender === 'user'
                ? "bg-[#5d3cfe] text-white rounded-tr-none border border-white/10 shadow-[0_10px_30px_-10px_rgba(93,60,254,0.5)]"
                : "bg-[#1c1d21]/80 backdrop-blur-md border border-white/5 text-[#e3e2e8] rounded-tl-none shadow-xl"
            }`}>
              {formatMessageText(msg.text)}
              <div className={`text-[7px] mt-2.5 font-black uppercase tracking-widest opacity-40 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1c1d21] border border-[#2a2b2f] p-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-[#474556] rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-[#474556] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-[#474556] rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-[#1c1d21] border-t border-white/5 shrink-0">
        <div className="flex gap-3 bg-[#0d0e12] p-2 rounded-2xl border border-white/5 focus-within:border-[#5d3cfe] transition-all shadow-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje aquí..."
            className="flex-1 bg-transparent px-4 py-2 text-xs text-white outline-none placeholder:text-[#474556] font-bold"
          />
          <button
            onClick={handleSend}
            className="bg-[#5d3cfe] p-3 rounded-xl text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#5d3cfe]/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-[8px] text-[#474556] font-black uppercase tracking-[0.2em] flex items-center gap-1">
            Mantech Pro Support
          </p>
          <div className="flex gap-2">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Protocolo de Conexión Segura</span>
          </div>
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
