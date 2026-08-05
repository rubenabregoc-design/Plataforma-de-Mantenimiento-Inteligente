import React, { useState, useEffect } from 'react';
import { ForumTopic, ForumReply } from '../types';
import { MessageSquare, Users, Search, Plus, ChevronRight, MessageCircle, Eye, Clock, User, ArrowLeft, Send, Trash2, Edit2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, increment, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { toast } from 'react-hot-toast';

export default function CommunityModule() {
  const { user, loggedInName, role } = useAuth();
  const { openModal } = useUI();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicCat, setNewTopicCat] = useState('Mecánica');
  const [newReplyText, setNewReplyText] = useState('');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const categories = ['Mecánica', 'Electricidad', 'A/C', 'Industrial', 'PH / Elevadores', 'Sistemas de Incendio', 'General'];

  useEffect(() => {
    const q = query(collection(db, "forum_topics"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setTopics(snap.docs.map(d => ({ id: d.id, ...d.data() } as ForumTopic)));
    });
  }, []);

  useEffect(() => {
    if (!selectedTopicId) {
      setReplies([]);
      return;
    }
    const q = query(
      collection(db, "forum_replies"),
      where("topicId", "==", selectedTopicId),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snap) => {
      setReplies(snap.docs.map(d => ({ id: d.id, ...d.data() } as ForumReply)));
    });
  }, [selectedTopicId]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTopicTitle.trim()) return;

    try {
      await addDoc(collection(db, "forum_topics"), {
        title: newTopicTitle,
        description: newTopicDesc,
        category: newTopicCat,
        authorId: user.uid,
        authorName: loggedInName,
        authorRole: role,
        createdAt: new Date().toISOString(),
        repliesCount: 0,
        viewsCount: 0
      });
      setIsCreatingTopic(false);
      setNewTopicTitle('');
      setNewTopicDesc('');
      toast.success("Tema publicado en el foro técnico.");
    } catch (err) {
      console.error(err);
      toast.error("Error al publicar el tema.");
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTopicId || !newReplyText.trim()) return;

    try {
      await addDoc(collection(db, "forum_replies"), {
        topicId: selectedTopicId,
        text: newReplyText,
        authorId: user.uid,
        authorName: loggedInName,
        authorRole: role,
        createdAt: new Date().toISOString()
      });

      const topicRef = doc(db, "forum_topics", selectedTopicId);
      await updateDoc(topicRef, {
        repliesCount: increment(1),
        lastReplyAt: new Date().toISOString()
      });

      setNewReplyText('');
      toast.success("Respuesta enviada.");
    } catch (err) {
      console.error(err);
      toast.error("Error al enviar la respuesta.");
    }
  };

  const handleDeleteTopic = async (id: string) => {
    openModal('confirmation', {
      confTitle: "Eliminar Tema",
      confMessage: "¿Seguro que deseas eliminar este tema del foro técnico definitivamente?",
      confType: 'danger',
      onConfConfirm: async () => {
        try {
          await deleteDoc(doc(db, "forum_topics", id));
          setSelectedTopicId(null);
          toast.success("Tema eliminado.");
        } catch (err) { console.error(err); }
      }
    });
  };

  const handleDeleteReply = async (id: string, topicId: string) => {
    openModal('confirmation', {
      confTitle: "Eliminar Respuesta",
      confMessage: "¿Seguro que deseas eliminar esta respuesta? Esta acción no se puede deshacer.",
      confType: 'danger',
      onConfConfirm: async () => {
        try {
          await deleteDoc(doc(db, "forum_replies", id));
          await updateDoc(doc(db, "forum_topics", topicId), { repliesCount: increment(-1) });
          toast.success("Respuesta eliminada.");
        } catch (err) { console.error(err); }
      }
    });
  };

  const handleUpdateReply = async (id: string) => {
    if (!editValue.trim()) return;
    try {
      await updateDoc(doc(db, "forum_replies", id), { text: editValue });
      setEditingReplyId(null);
      setEditValue('');
      toast.success("Respuesta actualizada.");
    } catch (err) { console.error(err); }
  };

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  const filteredTopics = topics.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {!selectedTopicId ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Soporte <span className="text-[#5d3cfe]">Comunidad</span></h1>
              <p className="text-[10px] text-[#474556] font-black uppercase tracking-[0.4em] mt-2">Sistema de Inteligencia Colectiva MantechPro</p>
            </div>
            <button
              onClick={() => setIsCreatingTopic(true)}
              className="px-8 py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <Plus className="w-4 h-4" /> Nuevo Tema de Consulta
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#474556]" />
            <input
              type="text"
              placeholder="Buscar fallas, soluciones o manuales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121317] border border-[#2a2b2f] rounded-[2rem] py-6 pl-16 pr-6 text-sm font-bold text-white focus:border-[#5d3cfe] outline-none transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
             {filteredTopics.map(topic => (
               <div
                 key={topic.id}
                 onClick={() => setSelectedTopicId(topic.id)}
                 className="bg-[#121317] border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-[#5d3cfe]/30 transition-all cursor-pointer shadow-2xl"
               >
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 rounded-2xl bg-[#1c1d21] border border-white/5 flex items-center justify-center text-[#5d3cfe] shadow-inner group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6" />
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <span className="px-3 py-1 bg-[#5d3cfe]/10 text-[#c7bfff] rounded-full text-[8px] font-black uppercase tracking-widest">{topic.category}</span>
                           <h4 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-[#5d3cfe] transition-colors">{topic.title}</h4>
                        </div>
                        <div className="flex items-center gap-4 text-[9px] font-bold text-[#474556] uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {topic.authorName}</span>
                           <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(topic.createdAt).toLocaleDateString()}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-8">
                     <div className="text-center">
                        <p className="text-sm font-black text-white leading-none">{topic.repliesCount || 0}</p>
                        <p className="text-[8px] text-[#474556] font-black uppercase mt-1">Respuestas</p>
                     </div>
                     <ChevronRight className="w-5 h-5 text-[#474556] group-hover:translate-x-1 transition-transform" />
                  </div>
               </div>
             ))}
             {filteredTopics.length === 0 && (
               <div className="py-20 text-center opacity-30">
                  <Users className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">No se han encontrado temas en esta frecuencia.</p>
               </div>
             )}
          </div>
        </>
      ) : (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in-up">
           <button
             onClick={() => setSelectedTopicId(null)}
             className="flex items-center gap-3 text-[10px] font-black text-[#5d3cfe] uppercase tracking-widest hover:translate-x-[-5px] transition-transform"
           >
              <ArrowLeft className="w-4 h-4" /> Volver al Tablero Global
           </button>

           <div className="bg-[#121317] border border-white/5 p-10 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><MessageCircle className="w-64 h-64" /></div>
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <span className="px-4 py-1.5 bg-[#5d3cfe] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">{selectedTopic?.category}</span>
                       <span className="text-[9px] font-bold text-[#474556] uppercase tracking-widest italic">{new Date(selectedTopic!.createdAt).toLocaleString()}</span>
                    </div>
                    {(selectedTopic?.authorId === user?.uid || role === 'admin') && (
                       <button onClick={() => handleDeleteTopic(selectedTopic!.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    )}
                 </div>
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{selectedTopic?.title}</h2>
                 <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-[#c7bfff]">{selectedTopic?.authorName[0]}</div>
                    <div>
                       <p className="text-xs font-black text-white uppercase">{selectedTopic?.authorName}</p>
                       <p className="text-[8px] text-[#5d3cfe] font-black uppercase tracking-[0.2em]">{selectedTopic?.authorRole === 'tech' ? 'Especialista Certificado' : 'Soporte Mantech'}</p>
                    </div>
                 </div>
                 <p className="text-sm text-[#c8c4d9] leading-relaxed font-medium">
                    {selectedTopic?.description}
                 </p>
              </div>
           </div>

           <div className="space-y-6 ml-6 border-l-2 border-[#5d3cfe]/10 pl-10 pt-4">
              <h3 className="text-[10px] font-black text-[#474556] uppercase tracking-[0.4em] mb-8">Debate Técnico ({replies.length})</h3>

              {replies.map(reply => (
                <div key={reply.id} className="bg-[#1c1d21]/50 border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl relative group">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-[#5d3cfe]/20 flex items-center justify-center text-[10px] font-black text-[#5d3cfe]">{reply.authorName[0]}</div>
                         <p className="text-[11px] font-black text-white uppercase">{reply.authorName}</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-[8px] font-bold text-[#474556] uppercase">{new Date(reply.createdAt).toLocaleTimeString()}</span>
                         {(reply.authorId === user?.uid || role === 'admin') && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => { setEditingReplyId(reply.id); setEditValue(reply.text); }} className="text-[#474556] hover:text-[#5d3cfe]"><Edit2 className="w-3.5 h-3.5" /></button>
                               <button onClick={() => handleDeleteReply(reply.id, selectedTopicId!)} className="text-[#474556] hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                         )}
                      </div>
                   </div>

                   {editingReplyId === reply.id ? (
                      <div className="space-y-3">
                         <textarea
                           value={editValue}
                           onChange={e => setEditValue(e.target.value)}
                           className="w-full bg-black border border-[#5d3cfe]/30 rounded-xl p-4 text-xs text-white outline-none"
                         />
                         <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingReplyId(null)} className="px-3 py-1 text-[8px] font-black text-[#474556] uppercase">Cancelar</button>
                            <button onClick={() => handleUpdateReply(reply.id)} className="px-4 py-1 bg-[#5d3cfe] text-white rounded-lg text-[8px] font-black uppercase">Guardar</button>
                         </div>
                      </div>
                   ) : (
                      <p className="text-xs text-[#c8c4d9] font-medium leading-relaxed">{reply.text}</p>
                   )}
                </div>
              ))}

              <form onSubmit={handleCreateReply} className="pt-6 space-y-4">
                 <textarea
                   value={newReplyText}
                   onChange={(e) => setNewReplyText(e.target.value)}
                   placeholder="Escriba su aporte técnico o solución..."
                   className="w-full bg-[#0d0e12] border border-white/10 rounded-[2rem] p-6 text-sm text-white focus:border-[#5d3cfe] outline-none transition-all placeholder:text-white/10 resize-none min-h-[120px]"
                 />
                 <button
                   type="submit"
                   disabled={!newReplyText.trim()}
                   className="px-10 py-4 bg-[#5d3cfe] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#5d3cfe]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 ml-auto disabled:opacity-50"
                 >
                    <Send className="w-4 h-4" /> Transmitir Respuesta
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL CREAR TEMA */}
      {isCreatingTopic && (
        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="w-full max-w-2xl bg-[#121317] border border-white/10 rounded-[3.5rem] p-10 md:p-12 space-y-8 animate-fade-in-up shadow-[0_0_100px_rgba(93,60,254,0.1)]">
              <header className="flex justify-between items-start">
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Abrir Canal de <span className="text-[#5d3cfe]">Consulta</span></h3>
                    <p className="text-[10px] text-[#474556] font-black uppercase tracking-widest mt-1">Colaboración de Alto Nivel</p>
                 </div>
                 <button onClick={() => setIsCreatingTopic(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-rose-600 transition-all active:scale-90"><ArrowLeft className="w-6 h-6 text-white" /></button>
              </header>

              <form onSubmit={handleCreateTopic} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-2">Categoría Técnica</label>
                       <select
                         value={newTopicCat}
                         onChange={(e) => setNewTopicCat(e.target.value)}
                         className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]"
                       >
                          {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-2">Título del Problema</label>
                       <input
                         required
                         type="text"
                         value={newTopicTitle}
                         onChange={(e) => setNewTopicTitle(e.target.value)}
                         placeholder="Ej: Falla E3 en VRF Samsung"
                         className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-xs font-bold text-white outline-none focus:border-[#5d3cfe]"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-[#474556] uppercase tracking-widest ml-2">Descripción Detallada (Falla y Pasos Realizados)</label>
                    <textarea
                      required
                      value={newTopicDesc}
                      onChange={(e) => setNewTopicDesc(e.target.value)}
                      placeholder="Describa el comportamiento técnico, códigos de error y lo que ha intentado..."
                      className="w-full bg-black border border-white/10 rounded-[2.5rem] p-8 text-sm text-white outline-none focus:border-[#5d3cfe] min-h-[200px] resize-none"
                    />
                 </div>

                 <button
                   type="submit"
                   className="w-full py-5 bg-[#5d3cfe] text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#5d3cfe]/20 hover:brightness-110 active:scale-95 transition-all"
                 >
                    Publicar Tema en el Sistema Global
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
