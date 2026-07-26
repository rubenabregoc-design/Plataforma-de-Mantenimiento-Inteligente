import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from './AuthContext';
import { Asset, MaintenanceReminder, TechProfile, JobRequest, InventoryItem, ChatMessage, AgendaEvent } from '../types';

interface DataContextType {
  assets: Asset[];
  requests: JobRequest[];
  technicians: TechProfile[];
  reminders: MaintenanceReminder[];
  inventory: InventoryItem[];
  agenda: AgendaEvent[];
  isDataLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, isLoggedIn } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [technicians, setTechnicians] = useState<TechProfile[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [agenda, setAgenda] = useState<AgendaEvent[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user || !role) {
      setIsDataLoading(false);
      return;
    }

    // 1. Técnicos (Público para todos los autenticados)
    const unsubTechs = onSnapshot(collection(db, "technicians"), (snap) =>
      setTechnicians(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TechProfile[]),
      (err) => console.error("Tech Snapshot Error:", err)
    );

    // 2. Solicitudes (Filtradas por Rol)
    const qReq = role === 'admin'
      ? query(collection(db, "requests"), orderBy("createdAt", "desc"))
      : query(collection(db, "requests"), where(role === 'client' ? 'clientId' : 'techUserId', "==", user.uid));

    const unsubReqs = onSnapshot(qReq, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })) as JobRequest[]);
    }, (err) => console.warn("Req Snapshot Error (Check Rules):", err));

    // 3. Activos (Solo Clientes y Admin)
    let unsubAssets = () => {};
    if (role === 'client' || role === 'admin') {
      const qAssets = role === 'admin'
        ? collection(db, "assets")
        : query(collection(db, "assets"), where("clientId", "==", user.uid));

      unsubAssets = onSnapshot(qAssets, (snap) => {
        setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Asset[]);
        setIsDataLoading(false);
      }, (err) => {
        console.warn("Asset Snapshot Error:", err);
        setIsDataLoading(false);
      });
    } else {
      setIsDataLoading(false);
    }

    // 4. Inventario (Público o Admin)
    const unsubInven = onSnapshot(collection(db, "inventory"), (snap) =>
      setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryItem[]),
      (err) => console.warn("Inv Snapshot Error:", err)
    );

    // 5. Recordatorios (Solo Clientes)
    let unsubReminders = () => {};
    if (role === 'client') {
      const qRem = query(collection(db, "reminders"), where("clientId", "==", user.uid));
      unsubReminders = onSnapshot(qRem, (snap) =>
        setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() })) as MaintenanceReminder[]),
        (err) => console.warn("Rem Snapshot Error:", err)
      );
    }

    // 6. Agenda (Filtrada)
    const qAgenda = role === 'tech'
      ? query(collection(db, "agenda"), where("techUserId", "==", user.uid))
      : query(collection(db, "agenda"), where("clientId", "==", user.uid));

    const unsubAgenda = onSnapshot(qAgenda, (snap) => {
      setAgenda(snap.docs.map(d => ({ id: d.id, ...d.data() })) as AgendaEvent[]);
    }, (err) => console.warn("Agenda Snapshot Error:", err));

    return () => {
      unsubTechs();
      unsubReqs();
      unsubAssets();
      unsubInven();
      unsubReminders();
      unsubAgenda();
    };
  }, [isLoggedIn, user, role]);

  return (
    <DataContext.Provider value={{
      assets,
      requests,
      technicians,
      reminders,
      inventory,
      agenda,
      isDataLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
