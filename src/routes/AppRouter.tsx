import React, { Suspense, lazy } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthPage from '../pages/AuthPage';
import DashboardLayout from '../layouts/DashboardLayout';

const ClientDashboard = lazy(() => import('../pages/client/ClientDashboard'));
const TechDashboard = lazy(() => import('../pages/tech/TechDashboard'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));

export default function AppRouter(props: any) {
  const { isLoggedIn, role, isAuthResolving } = useAuth();

  if (isAuthResolving) {
    return (
      <div className="h-screen w-full bg-[#0d0e12] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#5d3cfe]"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthPage />;
  }

  return (
    <DashboardLayout {...props}>
      <Suspense fallback={<div className="p-20 text-center text-[#474556] font-black uppercase tracking-[0.3em] animate-pulse">Iniciando Nodo...</div>}>
        {role === 'client' && <ClientDashboard />}
        {role === 'tech' && <TechDashboard />}
        {role === 'admin' && <AdminDashboard />}
      </Suspense>
    </DashboardLayout>
  );
}
