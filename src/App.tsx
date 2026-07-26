import { Toaster } from 'react-hot-toast';
import React, { useState } from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { useGpsTracking } from './hooks/useGpsTracking';

// Router & Layout
import AppRouter from './routes/AppRouter';

// Modals
import NotificationCenter from './components/NotificationCenter';
import AssetRegisterModal from './components/AssetRegisterModal';
// ... other modal imports

export default function App() {
  const { user, isLoggedIn, subscription } = useAuth();
  const { isDataLoading } = useData();
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Tab States (Managed at App level to persist during session)
  const [clientTab, setClientTab] = useState('dashboard');
  const [techTab, setTechTab] = useState('received');
  const [adminTab, setAdminTab] = useState('finance');

  return (
    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb", currency: "USD", intent: "capture" }}>
      <Toaster position="top-center" />

      <AppRouter
        unreadCount={unreadCount}
        onShowNotifications={() => setShowNotificationCenter(true)}
        clientTab={clientTab}
        setClientTab={setClientTab}
        techTab={techTab}
        setTechTab={setTechTab}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
      />

      <AnimatePresence>
        {showNotificationCenter && user && (
          <NotificationCenter userId={user.uid} onClose={() => setShowNotificationCenter(false)} />
        )}
      </AnimatePresence>

      {/* Global Modals would be triggered by an Event Bus or a ModalContext in a full senior refactor */}
    </PayPalScriptProvider>
  );
}
