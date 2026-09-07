import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from './AuthContext';
import { Asset, MaintenanceReminder, TechProfile, JobRequest, InventoryItem, AgendaEvent } from '../types';
import { initialTechnicians } from '../mockData';

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
  const { user, role, isLoggedIn, loggedInName, userData } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [technicians, setTechnicians] = useState<TechProfile[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [agenda, setAgenda] = useState<AgendaEvent[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user || !role) {
      if (!isLoggedIn) setIsDataLoading(false);
      return;
    }

    const unsubTechs = onSnapshot(collection(db, "technicians"), (snap) => {
      const techs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as TechProfile[];
      // Fallback a mock si la base de datos está vacía para pruebas
      if (techs.length === 0) {
        setTechnicians(initialTechnicians);
      } else {
        setTechnicians(techs);
      }
    },
    (err) => console.error("Tech Snapshot Error:", err)
    );

    const qReq = role === 'admin'
      ? query(collection(db, "requests"), orderBy("createdAt", "desc"))
      : query(collection(db, "requests"), where(role === 'client' ? 'clientId' : 'techUserId', "==", user.uid));

    const unsubReqs = onSnapshot(qReq, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })) as JobRequest[]);
    }, (err) => console.warn("Req Snapshot Error:", err));

    let unsubAssets = () => {};
    if (role === 'client' || role === 'admin' || role === 'driver') {
      let qAssets;
      if (role === 'admin') {
        qAssets = collection(db, "assets");
      } else if (role === 'driver') {
        // BLINDAJE DE PRIVACIDAD: El conductor NUNCA ve activos privados de clientes.
        // Solo ve camiones de su empresa o donde fue asignado por su coordinador.
        const nameVariants = Array.from(new Set([
          loggedInName?.trim(),
          user.displayName?.trim(),
          user.email?.trim()
        ].filter(Boolean) as string[]));

        if (userData?.companyId) {
          qAssets = query(collection(db, "assets"), where("companyId", "==", userData.companyId));
        } else if (nameVariants.length > 0) {
          qAssets = query(collection(db, "assets"), where("driverName", "in", nameVariants.slice(0, 10)));
        } else {
          qAssets = query(collection(db, "assets"), where("assignedDriverId", "==", user.uid));
        }
      } else {
        // Clientes regulares: blindaje estricto, solo sus propios equipos
        qAssets = query(collection(db, "assets"), where("clientId", "==", user.uid));
      }

      unsubAssets = onSnapshot(qAssets, (snap) => {
        setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Asset[]);
        setIsDataLoading(false);
      }, (err) => {
        console.warn("Asset Snapshot Error:", err);
        setIsDataLoading(false);
      });
    }

    const unsubInven = onSnapshot(collection(db, "inventory"), (snap) =>
      setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryItem[]),
      (err) => console.warn("Inv Snapshot Error:", err)
    );

    let unsubReminders = () => {};
    if (role === 'client') {
      const qRem = query(collection(db, "reminders"), where("clientId", "==", user.uid));
      unsubReminders = onSnapshot(qRem, (snap) =>
        setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() })) as MaintenanceReminder[]),
        (err) => console.warn("Rem Snapshot Error:", err)
      );
    }

    // --- AGENDA LISTENER BLINDADO ---
    let unsubAgenda = () => {};
    try {
      const qAgenda = role === 'tech'
        ? query(collection(db, "agenda"), where("techUserId", "==", user.uid))
        : query(collection(db, "agenda"), where("clientId", "==", user.uid));

      unsubAgenda = onSnapshot(qAgenda, (snap) => {
        setAgenda(snap.docs.map(d => ({ id: d.id, ...d.data() })) as AgendaEvent[]);
      }, (err) => {
        console.warn("Agenda Snapshot Error (Permission Denied):", err);
      });
    } catch (e) {
      console.error("Critical Agenda Error:", e);
    }

    return () => {
      unsubTechs();
      unsubReqs();
      unsubAssets();
      unsubInven();
      unsubReminders();
      unsubAgenda();
    };
  }, [isLoggedIn, user, role, loggedInName, userData?.companyId]);

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
