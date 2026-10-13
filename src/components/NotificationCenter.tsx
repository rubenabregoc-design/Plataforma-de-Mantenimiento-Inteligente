import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  X,
  Clock,
  Trash2,
  Inbox,
  CheckCheck
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'maintenance' | 'system' | 'billing';
  createdAt: any;
  read: boolean;
}

interface NotificationCenterProps {
  userId: string;
  onClose: () => void;
}

export default function NotificationCenter({ userId, onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const targetUserIds = Array.from(new Set([userId, user?.email].filter(Boolean) as string[]));

    const q = query(
      collection(db, "notifications"),
      where("userId", "in", targetUserIds),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
        setNotifications(docs);
        setLoading(false);
      },
      (err) => {
        console.warn("NotificationCenter snapshot error, falling back to simple query:", err);
        // Fallback si la consulta 'in' o el índice aún no están listos
        const fallbackQ = query(
          collection(db, "notifications"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const subFallback = onSnapshot(fallbackQ, (snapshot) => {
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
          setNotifications(docs);
          setLoading(false);
        }, (fallbackErr) => {
          console.error("NotificationCenter fallback snapshot error:", fallbackErr);
          setLoading(false);
        });
        return () => subFallback();
      }
    );

    return () => unsubscribe();
  }, [userId, user?.email]);

  const markAsRead = async (id: string) => {
    // Actualización optimista de la UI
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (err) {
      console.error("Error al marcar notificación como leída:", err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    // Actualización optimista instantánea en la UI
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        batch.update(doc(db, "notifications", n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn("Error en batch al marcar todo como leído, intentando actualización individual:", err);
      // Fallback individual si falla la escritura en lote por reglas de seguridad
      for (const n of unread) {
        try {
          await updateDoc(doc(db, "notifications", n.id), { read: true });
        } catch (e) {
          console.error(`Error al marcar notificación ${n.id}:`, e);
        }
      }
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Eliminar optimistamente de la lista
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (err) {
      console.error("Error al eliminar notificación:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0d0e12] border-l border-white/10 z-[100] shadow-2xl flex flex-col"
    >
      {/* CABECERA */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5d3cfe]/20 flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-[#5d3cfe]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#52ffac] rounded-full animate-ping" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tighter uppercase">Centro de Alertas</h2>
            <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
              {unreadCount > 0 ? `${unreadCount} Sin leer` : 'Historial de Alertas'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <X className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* LISTA DE NOTIFICACIONES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-[#5d3cfe] border-t-transparent rounded-full" />
          </div>
        ) : notifications.length > 0 ? (
          <>
            <div className="flex justify-between items-center px-2 mb-2">
              <span className="text-[10px] font-bold text-white/40 uppercase">{notifications.length} Mensajes</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[10px] font-black text-[#5d3cfe] uppercase hover:text-[#52ffac] transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todo como leído
                </button>
              )}
            </div>

            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => !n.read && markAsRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white/[0.02] border-white/5 opacity-60 hover:opacity-100'
                    : 'bg-white/[0.07] border-[#5d3cfe]/40 shadow-lg shadow-[#5d3cfe]/5 hover:border-[#5d3cfe]'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 ${
                    n.read
                      ? 'bg-transparent border border-white/20'
                      : n.type === 'maintenance' ? 'bg-[#5d3cfe] shadow-[0_0_8px_#5d3cfe]' : 'bg-[#52ffac] shadow-[0_0_8px_#52ffac]'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm font-bold ${n.read ? 'text-white/70' : 'text-white'}`}>{n.title}</h3>
                      {!n.read && (
                        <span className="text-[9px] font-black text-[#52ffac] bg-[#52ffac]/10 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">{n.body}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-white/30 uppercase">
                        <Clock className="w-3 h-3" />
                        {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : new Date().toLocaleString()}
                      </div>
                      <button
                        onClick={(e) => deleteNotification(e, n.id)}
                        className="ml-auto p-1 text-white/20 hover:text-rose-500 transition-colors rounded"
                        title="Eliminar notificación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-10">
            <Inbox className="w-12 h-12 text-white/5 mb-4" />
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider">Centro en Silencio</h3>
            <p className="text-xs text-white/20 mt-2">No tienes alertas pendientes en este momento.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/[0.02] border-t border-white/5">
        <p className="text-[9px] text-center text-white/20 uppercase font-bold tracking-widest">
          Sistema Operativo MantechPro Industries
        </p>
      </div>
    </motion.div>
  );
}
