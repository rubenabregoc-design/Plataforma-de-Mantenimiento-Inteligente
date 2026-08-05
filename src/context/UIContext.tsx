import React, { createContext, useState, useContext } from 'react';
import { Asset, JobRequest } from '../types';

interface UIContextType {
  // Modal States
  modals: {
    asset: boolean;
    fuel: boolean;
    preTrip: boolean;
    tech: boolean;
    editTech: boolean;
    report: boolean;
    signature: boolean;
    support: boolean;
    corpSupport: boolean;
    scanner: boolean;
    videoCall: boolean;
    credential: boolean;
    auth: boolean;
    demo: boolean;
    payment: boolean;
    unforeseen: boolean;
    material: boolean;
    checkpoint: boolean;
    routeStart: boolean;
    engineeringReport: boolean;
    quote: boolean;
    priceAdjustment: boolean;
    reason: boolean;
    confirmation: boolean;
  };

  // Active Data for Modals
  activeData: {
    asset: Asset | null;
    tech: any | null;
    request: JobRequest | null;
    requestId: string | null;
    videoRoom: string;
    isVoiceOnly: boolean;
    plan: any | null;
    reasonTitle: string;
    reasonPlaceholder: string;
    onReasonConfirm: (val: string) => void;
    confTitle: string;
    confMessage: string;
    onConfConfirm: () => void;
    confType: 'danger' | 'info' | 'success';
  };

  // Actions
  openModal: (modalName: keyof UIContextType['modals'], data?: any) => void;
  closeModal: (modalName: keyof UIContextType['modals']) => void;
  closeAllModals: () => void;

  // Tabs
  tabs: {
    client: string;
    tech: string;
    admin: string;
  };
  setTab: (role: 'client' | 'tech' | 'admin', tab: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<UIContextType['modals']>({
    asset: false, fuel: false, preTrip: false, tech: false, editTech: false,
    report: false, signature: false, support: false, corpSupport: false,
    scanner: false, videoCall: false, credential: false, auth: false,
    demo: false, payment: false, unforeseen: false, material: false,
    checkpoint: false, routeStart: false, engineeringReport: false, quote: false, priceAdjustment: false, reason: false, confirmation: false
  });

  const [activeData, setActiveData] = useState<UIContextType['activeData']>({
    asset: null, tech: null, request: null, requestId: null,
    videoRoom: '', isVoiceOnly: false, plan: null,
    reasonTitle: '', reasonPlaceholder: '', onReasonConfirm: () => {},
    confTitle: '', confMessage: '', onConfConfirm: () => {}, confType: 'info'
  });

  const [tabs, setTabs] = useState<UIContextType['tabs']>({
    client: 'dashboard',
    tech: 'received',
    admin: 'finance'
  });

  const openModal = (name: keyof UIContextType['modals'], data?: any) => {
    if (data) {
      setActiveData(prev => ({
        ...prev,
        ...data
      }));
    }
    setModals(prev => ({ ...prev, [name]: true }));
  };

  const closeModal = (name: keyof UIContextType['modals']) => {
    setModals(prev => ({ ...prev, [name]: false }));
  };

  const closeAllModals = () => {
    const closed = Object.keys(modals).reduce((acc, key) => ({
      ...acc, [key]: false
    }), {} as UIContextType['modals']);
    setModals(closed);
  };

  const setTab = (role: 'client' | 'tech' | 'admin', tab: string) => {
    setTabs(prev => ({ ...prev, [role]: tab }));
  };

  return (
    <UIContext.Provider value={{ modals, activeData, openModal, closeModal, closeAllModals, tabs, setTab }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
