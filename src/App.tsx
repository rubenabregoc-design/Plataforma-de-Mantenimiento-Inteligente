import { Toaster } from 'react-hot-toast';
import React, { useState } from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { useGpsTracking } from './hooks/useGpsTracking';
import { useBusinessLogic } from './hooks/useBusinessLogic';

// Router & Layout
import AppRouter from './routes/AppRouter';

// Global Components
import NotificationCenter from './components/NotificationCenter';
import SupportModal from './components/SupportModal';

export default function App() {
  const { user, isLoggedIn } = useAuth();
  const { isDataLoading } = useData();
  const business = useBusinessLogic();
  const gps = useGpsTracking();

  // Global UI State
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Tab States (Managed at App level to persist navigation during session)
  const [clientTab, setClientTab] = useState('dashboard');
  const [techTab, setTechTab] = useState('received');
  const [adminTab, setAdminTab] = useState('finance');

  return (
    <PayPalScriptProvider options={{
      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
      currency: "USD",
      intent: "capture"
    }}>
      <Toaster position="top-center" />

      <AppRouter
        // Tab Management
        clientTab={clientTab}
        setClientTab={setClientTab}
        techTab={techTab}
        setTechTab={setTechTab}
        adminTab={adminTab}
        setAdminTab={setAdminTab}

        // UI Controls
        onShowNotifications={() => setShowNotificationCenter(true)}
        onShowSupport={() => setIsSupportModalOpen(true)}

        // Business Logic & GPS (passed down as props or accessed via hooks in children)
        {...business}
        {...gps}
      />

      {/* Global Overlays */}
      <AnimatePresence>
        {showNotificationCenter && user && (
          <NotificationCenter
            userId={user.uid}
            onClose={() => setShowNotificationCenter(false)}
          />
        )}
      </AnimatePresence>

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </PayPalScriptProvider>
  );
}
