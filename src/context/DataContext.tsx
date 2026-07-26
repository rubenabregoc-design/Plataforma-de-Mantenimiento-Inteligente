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
    if (!isLoggedIn || !user) {
      setIsDataLoading(false);
      return;
    }

    const unsubTechs = onSnapshot(collection(db, "technicians"), (snap) =>
      setTechnicians(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TechProfile[])
    );

    const qReq = role === 'admin'
      ? query(collection(db, "requests"), orderBy("createdAt", "desc"))
      : query(collection(db, "requests"), where(role === 'client' ? 'clientId' : 'techUserId', "==", user.uid));

    const unsubReqs = onSnapshot(qReq, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })) as JobRequest[]);
    });

    const qAssets = role === 'admin'
      ? query(collection(db, "assets"), where("status", "!=", "deleted"))
      : query(collection(db, "assets"), where("clientId", "==", user.uid), where("status", "!=", "deleted"));

    const unsubAssets = onSnapshot(qAssets, (snap) => {
      setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Asset[]);
      setIsDataLoading(false);
    });

    const unsubInven = onSnapshot(collection(db, "inventory"), (snap) =>
      setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryItem[])
    );

    const qAgenda = role === 'tech'
      ? query(collection(db, "agenda"), where("techUserId", "==", user.uid))
      : query(collection(db, "agenda"), where("clientId", "==", user.uid));

    const unsubAgenda = onSnapshot(qAgenda, (snap) => {
      setAgenda(snap.docs.map(d => ({ id: d.id, ...d.data() })) as AgendaEvent[]);
    });

    return () => {
      unsubTechs();
      unsubReqs();
      unsubAssets();
      unsubInven();
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
