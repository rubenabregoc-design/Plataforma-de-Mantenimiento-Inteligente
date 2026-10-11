import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from './AuthContext';
import { Asset, MaintenanceReminder, TechProfile, JobRequest, InventoryItem, AgendaEvent } from '../types';

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
  const { user, role, isLoggedIn, loggedInName, userData, selectedTechProfileId } = useAuth();
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

    // 1. Especialistas (Limitado a 150 para proteger lecturas de Firebase)
    const unsubTechs = onSnapshot(
      query(collection(db, "technicians"), limit(150)),
      (snap) => {
        const techs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as TechProfile[];
        setTechnicians(techs);
      },
      (err) => console.error("Tech Snapshot Error:", err)
    );

    // 2. Solicitudes / Órdenes de Trabajo por Rol
    let unsubReqs = () => {};
    let unsubOpenMarket = () => {};
    let unsubTechIdReqs = () => {};

    const effectiveClientId = userData?.companyId || user.uid;
    const subRole = userData?.subRole || null;

    if (role === 'admin') {
      const qAdminReq = query(collection(db, "requests"), orderBy("createdAt", "desc"), limit(200));
      unsubReqs = onSnapshot(qAdminReq, (snap) => {
        setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })) as JobRequest[]);
      }, (err) => console.warn("Admin Req Snapshot Error:", err));
    } else if (role === 'client') {
      const qClientReq = query(collection(db, "requests"), where("clientId", "==", effectiveClientId), limit(100));
      unsubReqs = onSnapshot(qClientReq, (snap) => {
        setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })) as JobRequest[]);
      }, (err) => console.warn("Client Req Snapshot Error:", err));
    } else if (role === 'tech') {
      // Un técnico necesita ver:
      // A) Órdenes asignadas por techUserId
      // B) Órdenes asignadas por techId (perfil del marketplace)
      // C) Licitaciones abiertas en la Bolsa (status == 'open_bidding')
      let byUserMap: Record<string, JobRequest> = {};
      let byTechIdMap: Record<string, JobRequest> = {};
      let openBiddingMap: Record<string, JobRequest> = {};

      const mergeTechRequests = () => {
        const merged = { ...openBiddingMap, ...byTechIdMap, ...byUserMap };
        const sorted = Object.values(merged).sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dbTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dbTime - da;
        });
        setRequests(sorted);
      };

      const qByUser = query(collection(db, "requests"), where("techUserId", "==", user.uid), limit(100));
      unsubReqs = onSnapshot(qByUser, (snap) => {
        byUserMap = {};
        snap.docs.forEach(d => { byUserMap[d.id] = { id: d.id, ...d.data() } as JobRequest; });
        mergeTechRequests();
      }, (err) => console.warn("Tech user req error:", err));

      const resolvedTechId = userData?.techId || selectedTechProfileId;
      if (resolvedTechId) {
        const qByTechId = query(collection(db, "requests"), where("techId", "==", resolvedTechId), limit(100));
        unsubTechIdReqs = onSnapshot(qByTechId, (snap) => {
          byTechIdMap = {};
          snap.docs.forEach(d => { byTechIdMap[d.id] = { id: d.id, ...d.data() } as JobRequest; });
          mergeTechRequests();
        }, (err) => console.warn("Tech id req error:", err));
      }

      const qOpenMarket = query(collection(db, "requests"), where("status", "==", "open_bidding"), limit(50));
      unsubOpenMarket = onSnapshot(qOpenMarket, (snap) => {
        openBiddingMap = {};
        snap.docs.forEach(d => { openBiddingMap[d.id] = { id: d.id, ...d.data() } as JobRequest; });
        mergeTechRequests();
      }, (err) => console.warn("Open bidding req error:", err));
    }

    // 3. Activos / Equipos aislados por Rol y Sub-Rol (Coordinador de Flota vs Coordinador de Edificio)
    let unsubAssets = () => {};
    let qAssets;
    if (role === 'admin') {
      qAssets = query(collection(db, "assets"), limit(300));
    } else if (role === 'driver') {
      // BLINDAJE DE PRIVACIDAD: El conductor solo ve unidades de su empresa o asignadas a su nombre
      const nameVariants = Array.from(new Set([
        loggedInName?.trim(),
        user.displayName?.trim(),
        user.email?.trim()
      ].filter(Boolean) as string[]));

      if (userData?.companyId) {
        qAssets = query(collection(db, "assets"), where("clientId", "==", userData.companyId), limit(100));
      } else if (nameVariants.length > 0) {
        qAssets = query(collection(db, "assets"), where("driverName", "in", nameVariants.slice(0, 10)), limit(50));
      } else {
        qAssets = query(collection(db, "assets"), where("assignedDriverId", "==", user.uid), limit(50));
      }
    } else if (role === 'tech') {
      // El técnico solo carga activos si pertenece a una empresa/edificio o tiene unidad asignada
      if (userData?.companyId) {
        qAssets = query(collection(db, "assets"), where("clientId", "==", userData.companyId), limit(100));
      } else {
        qAssets = query(collection(db, "assets"), where("assignedTechId", "==", user.uid), limit(50));
      }
    } else {
      // Clientes regulares y Coordinadores (Flota / Edificio)
      qAssets = query(collection(db, "assets"), where("clientId", "==", effectiveClientId), limit(100));
    }

    unsubAssets = onSnapshot(qAssets, (snap) => {
      let loadedAssets = (snap.docs.map(d => ({ id: d.id, ...d.data() })) as Asset[])
        .filter(a => a.status !== 'deleted');

      if (role === 'client' && subRole === 'fleet_coordinator') {
        loadedAssets = loadedAssets.filter(a => a.type === 'car' || a.type === 'moto');
      } else if (role === 'client' && subRole === 'building_coordinator') {
        loadedAssets = loadedAssets.filter(a => a.type !== 'car' && a.type !== 'moto');
      }

      setAssets(loadedAssets);
      setIsDataLoading(false);
    }, (err) => {
      console.warn("Asset Snapshot Error:", err);
      setIsDataLoading(false);
    });

    // 4. Inventario (Filtrado o limitado para eficiencia)
    const unsubInven = onSnapshot(
      query(collection(db, "inventory"), limit(150)),
      (snap) => setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })) as InventoryItem[]),
      (err) => console.warn("Inv Snapshot Error:", err)
    );

    // 5. Recordatorios de Mantenimiento
    let unsubReminders = () => {};
    if (role === 'client' || role === 'admin') {
      const qRem = role === 'admin'
        ? query(collection(db, "reminders"), limit(200))
        : query(collection(db, "reminders"), where("clientId", "==", effectiveClientId), limit(100));
      unsubReminders = onSnapshot(qRem, (snap) =>
        setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() })) as MaintenanceReminder[]),
        (err) => console.warn("Rem Snapshot Error:", err)
      );
    }

    // 6. Agenda por Rol
    let unsubAgenda = () => {};
    try {
      const qAgenda = role === 'admin'
        ? query(collection(db, "agenda"), limit(200))
        : (role === 'tech'
          ? query(collection(db, "agenda"), where("techUserId", "==", user.uid), limit(100))
          : query(collection(db, "agenda"), where("clientId", "==", effectiveClientId), limit(100)));

      unsubAgenda = onSnapshot(qAgenda, (snap) => {
        setAgenda(snap.docs.map(d => ({ id: d.id, ...d.data() })) as AgendaEvent[]);
      }, (err) => {
        console.warn("Agenda Snapshot Error:", err);
      });
    } catch (e) {
      console.error("Critical Agenda Error:", e);
    }

    return () => {
      unsubTechs();
      unsubReqs();
      unsubOpenMarket();
      unsubTechIdReqs();
      unsubAssets();
      unsubInven();
      unsubReminders();
      unsubAgenda();
    };
  }, [isLoggedIn, user, role, loggedInName, userData?.companyId, userData?.subRole, userData?.techId, selectedTechProfileId]);

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
