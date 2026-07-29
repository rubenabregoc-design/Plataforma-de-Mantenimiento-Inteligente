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
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserSubscription } from '../types';
import { logActivity } from '../services/auditService';
import { toast } from 'react-hot-toast';

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
  const [loggedInName, setLoggedInName] = useState('');
  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [selectedTechProfileId, setSelectedTechProfileId] = useState<string | null>(localStorage.getItem('mantech_logged_tech_id'));

  const [subscription, setSubscription] = useState<UserSubscription>({
    planId: 'plan-free',
    status: 'active',
    startDate: new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoggedInEmail(firebaseUser.email || '');

        const userRef = doc(db, "users", firebaseUser.uid);

        // Listener en tiempo real para los datos del usuario
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
    };
  }, []);

  // Expiration Guard
  useEffect(() => {
    if (!isLoggedIn || !userData || role !== 'client') return;

    const checkExpiration = async () => {
      const now = new Date();
      const expiry = new Date(subscription.nextBillingDate);

      if (now > expiry && subscription.planId !== 'plan-free' && subscription.status === 'active') {
        const expiredSub = {
          ...subscription,
          status: 'expired',
          planId: 'plan-free'
        };
        await updateDoc(doc(db, "users", user!.uid), { subscription: expiredSub });
        setSubscription(expiredSub as UserSubscription);
        toast.error("Tu plan MantechPro ha expirado. Has sido retornado al Plan Gratis.", { duration: 6000 });
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
