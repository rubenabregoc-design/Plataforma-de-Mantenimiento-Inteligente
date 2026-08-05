import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  addDoc
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserSubscription } from '../types';
import { logActivity } from '../services/auditService';
import { toast } from 'react-hot-toast';
import { LocalNotifications } from '@capacitor/local-notifications';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: any | null;
  role: 'client' | 'tech' | 'admin' | null;
  isLoggedIn: boolean;
  isAuthResolving: boolean;
  subscription: UserSubscription;
  loggedInName: string;
  loggedInEmail: string;
  profileImage: string;
  selectedTechProfileId: string | null;
  daysUntilExpiration: number | null;
  logout: () => Promise<void>;
  updateUserSubscription: (newSub: UserSubscription) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [role, setRole] = useState<'client' | 'tech' | 'admin' | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loggedInName, setLoggedInName] = useState('');
  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [selectedTechProfileId, setSelectedTechProfileId] = useState<string | null>(localStorage.getItem('mantech_logged_tech_id'));
  const [daysUntilExpiration, setDaysUntilExpiration] = useState<number | null>(null);

  const [subscription, setSubscription] = useState<UserSubscription>({
    planId: 'plan-free',
    status: 'active',
    startDate: new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Enlace restablecido con la Central.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Señal perdida. Verifique su conexión DNS / Internet.", { duration: 10000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoggedInEmail(firebaseUser.email || '');

        const userRef = doc(db, "users", firebaseUser.uid);

        // Listener en tiempo real para los datos del usuario con manejo de error de red
        unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);

            // Lógica de Rol
            if (firebaseUser.email === 'admin@mantech.com') {
              setRole('admin');
            } else {
              setRole(data.role || 'client');
            }

            setLoggedInName(data.name || firebaseUser.displayName || 'Usuario');
            setProfileImage(data.profileImage || '');

            if (data.role === 'tech') {
              const tId = data.techId || `tech-${firebaseUser.uid}`;
              setSelectedTechProfileId(tId);
              localStorage.setItem('mantech_logged_tech_id', tId);
            }

            if (data.subscription) {
              setSubscription(data.subscription);
            } else {
              // Si el usuario existe pero no tiene el campo subscription, lo inicializamos
              const defaultSub: UserSubscription = {
                planId: data.role === 'tech' ? 'plan-basic' : 'plan-free',
                status: 'active',
                startDate: new Date().toISOString(),
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              };
              updateDoc(userRef, { subscription: defaultSub });
              setSubscription(defaultSub);
            }
          } else {
            // Manejo de usuario nuevo sin documento
            if (firebaseUser.email === 'admin@mantech.com') {
              const adminData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: 'Administrador Central',
                role: 'admin',
                createdAt: serverTimestamp()
              };
              setDoc(userRef, adminData);
            } else {
              const defaultSub: UserSubscription = {
                planId: 'plan-free',
                status: 'active',
                startDate: new Date().toISOString(),
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              };
              const newUserData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || 'Usuario',
                role: 'client',
                subscription: defaultSub,
                createdAt: serverTimestamp()
              };
              setDoc(userRef, newUserData);
              setRole('client');
              setLoggedInName(newUserData.name);
              setSubscription(defaultSub);
            }
          }
          setIsLoggedIn(true);
          setIsAuthResolving(false);
        }, (err) => {
          console.error("Firebase Snapshot Error:", err);
          if (err.code === 'permission-denied') {
            toast.error("Sesión expirada o permisos insuficientes.");
          } else {
            toast.error("Error de enlace con Firebase. Verifique su DNS.");
          }
        });

      } else {
        setIsLoggedIn(false);
        setUser(null);
        setUserData(null);
        setRole(null);
        setIsAuthResolving(false);
        if (unsubscribeDoc) unsubscribeDoc();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Expiration Guard: Protocolo de Retorno a Plan Gratis tras impago
  useEffect(() => {
    if (!isLoggedIn || !userData) return;

    const checkExpiration = async () => {
      const now = new Date();
      const expiry = new Date(subscription.nextBillingDate);

      // Calcular días restantes
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilExpiration(diffDays);

      // --- PROTOCOLO DE NOTIFICACIÓN PUSH (24 HORAS ANTES) ---
      if (diffDays === 1 && subscription.status === 'active' && subscription.planId !== 'plan-free') {
        try {
          const hasNotified = localStorage.getItem(`mantech_notif_expiry_${subscription.nextBillingDate}`);
          if (!hasNotified) {
            // 1. Notificación Local (Push Nativa en Celular)
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: "⚠️ ACCESO POR EXPIRAR",
                  body: "Tu suscripción MantechPro vence en 24 horas. Renueva ahora para mantener tus beneficios premium.",
                  id: 101,
                  schedule: { at: new Date(Date.now() + 1000) },
                  sound: 'beep.wav'
                }
              ]
            });

            // 2. Registro en Firestore para Centro de Notificaciones (UI)
            await addDoc(collection(db, "notifications"), {
              userId: user!.uid,
              title: "🚀 Renovación Urgente",
              body: "Tu acceso premium expira en 24 horas. Haz clic para renovar vía Yappy.",
              type: 'billing',
              createdAt: serverTimestamp(),
              read: false
            });

            localStorage.setItem(`mantech_notif_expiry_${subscription.nextBillingDate}`, 'true');
          }
        } catch (e) { console.error("Push Error:", e); }
      }

      // Si la fecha actual superó la de facturación y el plan no es el gratuito
      if (now > expiry && subscription.planId !== 'plan-free' && subscription.planId !== 'plan-basic' && subscription.status === 'active') {
        const defaultPlanId = role === 'tech' ? 'plan-basic' : 'plan-free';

        const expiredSub = {
          ...subscription,
          status: 'expired',
          planId: defaultPlanId
        };

        await updateDoc(doc(db, "users", user!.uid), { subscription: expiredSub });
        setSubscription(expiredSub as UserSubscription);

        toast.error("Tu suscripción MantechPro ha expirado. Tus beneficios premium han sido suspendidos y has retornado al Plan Base.", {
          duration: 8000,
          icon: '⚠️'
        });
      }
    };

    checkExpiration();
  }, [userData, isLoggedIn, subscription.nextBillingDate, role, subscription.planId, user]);

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserSubscription = async (newSub: UserSubscription) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { subscription: newSub });
    setSubscription(newSub);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      role,
      isLoggedIn,
      isAuthResolving,
      subscription,
      loggedInName,
      loggedInEmail,
      profileImage,
      selectedTechProfileId,
      daysUntilExpiration,
      logout,
      updateUserSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
