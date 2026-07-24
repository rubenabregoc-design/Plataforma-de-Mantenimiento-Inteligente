import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Clock,
  Trash2,
  Inbox
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      setNotifications(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, "notifications", n.id), { read: true });
    });
    await batch.commit();
  };

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, "notifications", id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0d0e12] border-l border-white/10 z-[100] shadow-2xl flex flex-col"
    >
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5d3cfe]/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#5d3cfe]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tighter uppercase">Centro de Alertas</h2>
            <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Historial del Nodo</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <X className="w-5 h-5 text-white/60" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-[#5d3cfe] border-t-transparent rounded-full" />
          </div>
        ) : notifications.length > 0 ? (
          <>
            <div className="flex justify-between items-center px-2 mb-2">
              <span className="text-[10px] font-bold text-white/40 uppercase">{notifications.length} Mensajes</span>
              <button onClick={markAllAsRead} className="text-[10px] font-black text-[#5d3cfe] uppercase hover:text-[#52ffac] transition-colors">Marcar todo como leído</button>
            </div>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-white/[0.05] border-white/10 shadow-lg'}`}
              >
                <div className="flex gap-4">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.type === 'maintenance' ? 'bg-[#5d3cfe]' : 'bg-[#52ffac]'}`} />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white leading-tight">{n.title}</h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">{n.body}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-white/30 uppercase">
                        <Clock className="w-3 h-3" />
                        {n.createdAt?.toDate().toLocaleString()}
                      </div>
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="ml-auto text-white/20 hover:text-rose-500 transition-colors"
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
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider">Nodo en Silencio</h3>
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
