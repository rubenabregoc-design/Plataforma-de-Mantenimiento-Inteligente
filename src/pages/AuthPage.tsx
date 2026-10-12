import React, { useState } from 'react';
import LandingPage from '../components/LandingPage';
import Logo from '../components/Logo';
import { X, Lock, ShieldCheck } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logActivity } from '../services/auditService';
import { toast } from 'react-hot-toast';

export default function AuthPage() {
  const { modals, openModal, closeModal } = useUI();
  const { assets, requests } = useData();

  // Local Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'pin_recovery'>('login');
  const [authRole, setAuthRole] = useState<'client' | 'tech' | 'driver'>('client');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginCedula, setLoginCedula] = useState('');
  const [recoveryPinOrAnswer, setRecoveryPinOrAnswer] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handlePinRecovery = async (e: any) => {
    if (e) e.preventDefault();
    setAuthError('');
    const cleanEmail = loginEmail.toLowerCase().trim();
    const docId = cleanEmail.replace(/[^a-z0-9]/g, '_');

    if (recoveryNewPassword.length < 6) {
      setAuthError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const memberSnap = await getDoc(doc(db, 'company_members', docId));
      if (!memberSnap.exists()) {
        setAuthError('No se encontró un perfil empresarial asociado a este correo.');
        return;
      }
      const member = memberSnap.data();
      const inputVal = recoveryPinOrAnswer.trim().toLowerCase();
      const matchesAnswer = member.securityAnswer && member.securityAnswer.toLowerCase() === inputVal;
      const matchesCedula = member.cedula && member.cedula.trim().toLowerCase() === inputVal;

      if (!matchesAnswer && !matchesCedula && inputVal.length !== 4) {
        setAuthError('PIN de 4 dígitos, respuesta de seguridad o cédula no coinciden.');
        return;
      }

      // Intentar iniciar sesión con la contraseña anterior conocida para actualizarla en Firebase Auth
      const oldPass = member.customPassword || member.defaultPassword;
      if (oldPass) {
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, oldPass);
          await updatePassword(cred.user, recoveryNewPassword);
          await updateDoc(doc(db, 'users', cred.user.uid), {
            mustChangePassword: false
          });
        } catch {
          // Si aún no existía en Auth, crearlo con la nueva clave
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, recoveryNewPassword);
          await setDoc(doc(db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            email: cleanEmail,
            name: member.name,
            role: member.role || 'driver',
            subRole: member.subRole || null,
            companyId: member.companyId,
            cedula: member.cedula,
            techId: member.techId || null,
            mustChangePassword: false,
            subscription: {
              planId: member.subRole ? 'plan-enterprise' : 'plan-basic',
              status: 'active',
              startDate: new Date().toISOString(),
              nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            createdAt: serverTimestamp()
          }, { merge: true });
        }
      }

      await updateDoc(doc(db, 'company_members', docId), {
        customPassword: recoveryNewPassword,
        mustChangePassword: false,
        status: 'active'
      });

      toast.success('¡Contraseña actualizada con tu PIN / Seguridad!');
    } catch (err: any) {
      setAuthError('No se pudo recuperar la cuenta. Pide al coordinador restablecer tu clave temporal.');
    }
  };

  const handleLogin = async (e: any) => {
    if (e) e.preventDefault();
    setAuthError('');
    const cleanEmail = loginEmail.toLowerCase().trim();
    const docId = cleanEmail.replace(/[^a-z0-9]/g, '_');

    try {
      if (authMode === 'register') {
        // Verificar si ya fue pre-creado en lote por un Coordinador
        const memberSnap = await getDoc(doc(db, 'company_members', docId));
        const memberData = memberSnap.exists() ? memberSnap.data() : null;

        const res = await createUserWithEmailAndPassword(auth, cleanEmail, loginPassword);
        const u = res.user;
        const resolvedRole = memberData?.role || authRole;
        const resolvedSubRole = memberData?.subRole || null;
        const tId = memberData?.techId || (resolvedRole === 'tech' ? `tech-${Date.now()}` : null);
        const defaultSub = {
          planId: resolvedSubRole ? 'plan-enterprise' : (resolvedRole === 'tech' ? 'plan-basic' : 'plan-free'),
          status: 'active',
          startDate: new Date().toISOString(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        const userData = {
          uid: u.uid,
          email: cleanEmail,
          name: loginName || memberData?.name || 'Usuario',
          role: resolvedRole,
          subRole: resolvedSubRole,
          companyId: memberData?.companyId || null,
          cedula: loginCedula || memberData?.cedula || '',
          techId: tId,
          mustChangePassword: false,
          subscription: defaultSub,
          createdAt: serverTimestamp()
        };

        await setDoc(doc(db, "users", u.uid), userData);

        if (resolvedRole === 'tech' && tId && !memberData?.techId) {
          await setDoc(doc(db, "technicians", tId), {
            id: tId,
            userId: u.uid,
            name: loginName,
            cedula: loginCedula,
            category: 'mecanico',
            isVerified: false,
            isOnline: false,
            rating: 5,
            reviewCount: 0,
            completedJobs: 0,
            verificationLevel: 1,
            hasLiabilityInsurance: false,
            plan: 'basic',
            wallet: { balance: 0, pendingBalance: 0, transactions: [] }
          });
        }

      } else {
        try {
          const res = await signInWithEmailAndPassword(auth, cleanEmail, loginPassword);
          // Sincronizar estado si el coordinador restableció su clave temporal
          const memberSnap = await getDoc(doc(db, 'company_members', docId));
          if (memberSnap.exists()) {
            const m = memberSnap.data();
            if (m.mustChangePassword) {
              await updateDoc(doc(db, 'users', res.user.uid), {
                mustChangePassword: true,
                companyId: m.companyId,
                subRole: m.subRole || null
              });
            }
          }
          await logActivity(res.user.uid, res.user.email || 'user', 'LOGIN', `Acceso desde AuthPage`);
        } catch (loginErr: any) {
          // Si el usuario fue creado en lote por un Coordinador con contraseña por defecto, materializar su cuenta en el primer ingreso
          const memberSnap = await getDoc(doc(db, 'company_members', docId));
          if (memberSnap.exists()) {
            const m = memberSnap.data();
            if (loginPassword.trim() === m.defaultPassword || loginPassword.trim() === m.customPassword) {
              try {
                const res = await createUserWithEmailAndPassword(auth, cleanEmail, loginPassword.trim());
                const u = res.user;
                const defaultSub = {
                  planId: m.subRole ? 'plan-enterprise' : (m.role === 'tech' ? 'plan-basic' : 'plan-free'),
                  status: 'active',
                  startDate: new Date().toISOString(),
                  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                };
                await setDoc(doc(db, 'users', u.uid), {
                  uid: u.uid,
                  email: cleanEmail,
                  name: m.name,
                  role: m.role || 'driver',
                  subRole: m.subRole || null,
                  companyId: m.companyId,
                  cedula: m.cedula || '',
                  techId: m.techId || null,
                  mustChangePassword: m.mustChangePassword ?? true,
                  subscription: defaultSub,
                  createdAt: serverTimestamp()
                });
                if (m.techId) {
                  await updateDoc(doc(db, 'technicians', m.techId), { userId: u.uid }).catch(() => {});
                }
                toast.success(`¡Bienvenido ${m.name}! Configura tu clave y PIN personal.`);
                return;
              } catch (createErr: any) {
                if (createErr.code === 'auth/email-already-in-use' && m.customPassword) {
                  // El coordinador restableció su clave a defaultPassword pero en Auth sigue customPassword
                  const res = await signInWithEmailAndPassword(auth, cleanEmail, m.customPassword);
                  await updateDoc(doc(db, 'users', res.user.uid), {
                    mustChangePassword: true
                  });
                  return;
                }
              }
            }
          }
          throw loginErr;
        }
      }
    } catch (err: any) {
      let friendlyMsg = "Error al procesar la solicitud.";
      if (err.code === 'auth/email-already-in-use') friendlyMsg = "Este correo ya está registrado en el sistema.";
      if (err.code === 'auth/invalid-credential') friendlyMsg = "Credenciales incorrectas. Verifique su correo o clave temporal.";
      if (err.code === 'auth/weak-password') friendlyMsg = "La clave debe tener al menos 6 caracteres.";
      if (err.code === 'auth/invalid-email') friendlyMsg = "El formato del correo no es válido.";

      setAuthError(friendlyMsg);
    }
  };

  return (
    <>
      <LandingPage
        onStart={() => openModal('auth')}
        onWatchDemo={() => openModal('demo')}
        assets={assets}
        requests={requests}
      />
      {modals.auth && (
        <div className="fixed inset-0 z-[200] bg-[#0d0e12] sm:bg-black/85 sm:backdrop-blur-md flex flex-col justify-between sm:justify-center sm:items-center p-0 sm:p-4">
          <div className="w-full h-full sm:h-auto sm:max-w-md sm:max-h-[92vh] bg-[#0d0e12] sm:bg-[#121317] sm:border border-white/10 p-6 sm:p-8 sm:rounded-3xl flex flex-col justify-between shadow-2xl relative animate-fade-in overflow-y-auto pt-[max(env(safe-area-inset-top),1.25rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
            
            {/* Top Bar with Safe-Area Header & Close Button */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#52ffac] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8a879d]">MantechPro Security V4</span>
              </div>
              <button
                onClick={() => closeModal('auth')}
                className="p-2.5 text-white hover:bg-rose-600 bg-white/5 border border-white/10 rounded-xl transition-all active:scale-90"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Central Form & Branding Section */}
            <div className="my-auto py-4 space-y-6">
              <div className="text-center space-y-2 flex flex-col items-center">
                <Logo size="md" />
                <p className="text-[#8a879d] text-[10px] font-black uppercase tracking-[0.3em]">Central Logística Panamá</p>
              </div>

              {/* Segmented Switcher */}
              <div className="flex bg-[#16171d] p-1.5 rounded-xl border border-white/10">
                 <button
                   type="button"
                   onClick={() => setAuthMode('login')}
                   className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                     authMode === 'login'
                       ? 'bg-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/30'
                       : 'text-[#8a879d] hover:text-white'
                   }`}
                 >
                   Ingresar
                 </button>
                 <button
                   type="button"
                   onClick={() => setAuthMode('register')}
                   className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                     authMode === 'register'
                       ? 'bg-[#5d3cfe] text-white shadow-lg shadow-[#5d3cfe]/30'
                       : 'text-[#8a879d] hover:text-white'
                   }`}
                 >
                   Registrarse
                 </button>
              </div>

              {authMode === 'pin_recovery' ? (
                <form onSubmit={handlePinRecovery} className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#52ffac]/10 border border-[#52ffac]/30 text-[10px] text-[#52ffac] font-bold">
                    Ingresa tu correo empresarial, tu PIN de 4 dígitos (o respuesta de seguridad / cédula) y tu nueva contraseña.
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-[#8a879d] uppercase ml-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full bg-[#16171d] border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white outline-none focus:border-[#52ffac]"
                      placeholder="conductor@empresa.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-[#52ffac] uppercase ml-1">PIN (4 dígitos), Respuesta Secreta o Cédula</label>
                    <input
                      type="text"
                      value={recoveryPinOrAnswer}
                      onChange={e => setRecoveryPinOrAnswer(e.target.value)}
                      className="w-full bg-[#16171d] border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white outline-none focus:border-[#52ffac]"
                      placeholder="Ej: 4829 o respuesta de seguridad"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-[#8a879d] uppercase ml-1">Nueva Contraseña Personal</label>
                    <input
                      type="password"
                      value={recoveryNewPassword}
                      onChange={e => setRecoveryNewPassword(e.target.value)}
                      className="w-full bg-[#16171d] border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white outline-none focus:border-[#52ffac]"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </div>
                  {authError && (
                    <p className="text-rose-400 text-[10px] font-bold uppercase text-center bg-rose-500/10 border border-rose-500/20 py-2.5 px-3 rounded-xl">
                      {authError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError(''); }}
                      className="flex-1 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-3.5 bg-gradient-to-r from-[#52ffac] to-[#10b981] text-black rounded-xl text-xs font-black uppercase tracking-wider"
                    >
                      Actualizar Clave y Entrar
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  {authMode === 'register' && (
                    <>
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-[#8a879d] uppercase ml-1">Nombre Completo</label>
                        <input
                          type="text"
                          value={loginName}
                          onChange={e => setLoginName(e.target.value)}
                          className="w-full bg-[#16171d] border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white outline-none focus:border-[#5d3cfe] transition-colors"
                          placeholder="Ej: Juan Pérez"
                          required
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-[#8a879d] uppercase ml-1">Cédula de Identidad</label>
                        <input
                          type="text"
                          value={loginCedula}
                          onChange={e => setLoginCedula(e.target.value)}
                          className="w-full bg-[#16171d] border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white outline-none focus:border-[#5d3cfe] transition-colors"
                          placeholder="Ej: 8-888-8888"
                          required
                        />
                        <p className="text-[9px] text-[#8a879d] font-bold uppercase ml-1 mt-0.5">* Inmutable para verificación oficial.</p>
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-[#8a879d] uppercase ml-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full bg-[#16171d] border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white outline-none focus:border-[#5d3cfe] transition-colors"
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-[#8a879d] uppercase ml-1">Contraseña (o Clave Temporal)</label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setAuthMode('pin_recovery'); setAuthError(''); }}
                          className="text-[9px] font-black text-[#52ffac] uppercase hover:underline"
                        >
                          ¿Usar PIN / Pregunta Secreta?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full bg-[#16171d] border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white outline-none focus:border-[#5d3cfe] transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {authMode === 'register' && (
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black text-[#8a879d] uppercase ml-1">Tipo de Perfil</label>
                      <div className="grid grid-cols-3 gap-2 p-1 bg-[#16171d] border border-white/10 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setAuthRole('client')}
                          className={`py-2.5 px-1 text-[11px] font-black uppercase rounded-lg transition-all ${
                            authRole === 'client' ? 'bg-[#5d3cfe] text-white shadow-md' : 'text-[#8a879d] hover:text-white'
                          }`}
                        >
                          Cliente
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthRole('tech')}
                          className={`py-2.5 px-1 text-[11px] font-black uppercase rounded-lg transition-all ${
                            authRole === 'tech' ? 'bg-[#5d3cfe] text-white shadow-md' : 'text-[#8a879d] hover:text-white'
                          }`}
                        >
                          Técnico
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthRole('driver')}
                          className={`py-2.5 px-1 text-[11px] font-black uppercase rounded-lg transition-all ${
                            authRole === 'driver' ? 'bg-[#5d3cfe] text-white shadow-md' : 'text-[#8a879d] hover:text-white'
                          }`}
                        >
                          Conductor
                        </button>
                      </div>
                    </div>
                  )}

                  {authError && (
                    <p className="text-rose-400 text-[10px] font-bold uppercase text-center bg-rose-500/10 border border-rose-500/20 py-2.5 px-3 rounded-xl">
                      {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#5d3cfe] to-[#4c2bd6] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xl shadow-[#5d3cfe]/30 hover:brightness-110 active:scale-[0.98] transition-all mt-3"
                  >
                    {authMode === 'login' ? 'Entrar a MantechPro ➔' : 'Crear Cuenta Segura ➔'}
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Security Footer */}
            <div className="pt-3.5 border-t border-white/5 flex items-center justify-center shrink-0">
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10">
                <Lock className="w-3.5 h-3.5 text-[#52ffac] shrink-0" />
                <span className="text-[9px] text-[#c8c4d9] font-black uppercase tracking-wider whitespace-nowrap">
                  Conexión Cifrada SSL • Ley 81 Protección de Datos
                </span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
