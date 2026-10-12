import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, HelpCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { toast } from 'react-hot-toast';
import { encryptField } from '../utils/cryptoVault';

interface FirstLoginSecurityModalProps {
  userUid: string;
  userName: string;
  userEmail: string;
  companyMemberId?: string;
  isMandatory?: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

const SECURITY_QUESTIONS = [
  '¿Nombre de tu primera mascota?',
  '¿Ciudad o barrio donde naciste?',
  '¿Placa o marca de tu primer vehículo?',
  '¿Segundo nombre de tu madre?',
  '¿Nombre de tu primera escuela?'
];

export default function FirstLoginSecurityModal({
  userUid,
  userName,
  userEmail,
  companyMemberId,
  isMandatory = true,
  onComplete,
  onClose
}: FirstLoginSecurityModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [securityPin, setSecurityPin] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    if (!/^\d{4}$/.test(securityPin)) {
      toast.error('El PIN de seguridad debe ser exactamente de 4 números.');
      return;
    }
    if (securityAnswer.trim().length < 2) {
      toast.error('Escribe una respuesta para tu pregunta de seguridad.');
      return;
    }

    setSaving(true);
    try {
      // 1. Actualizar contraseña en Firebase Auth si hay sesión activa
      if (auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, newPassword);
        } catch (authErr: any) {
          console.warn('Info al actualizar password en Firebase Auth:', authErr?.code);
        }
      }

      // 2. Actualizar documento del usuario en Firestore (PIN encriptado)
      await updateDoc(doc(db, 'users', userUid), {
        mustChangePassword: false,
        securityPin: encryptField(securityPin.trim()),
        securityQuestion,
        securityAnswer: securityAnswer.trim().toLowerCase(),
        securityConfiguredAt: serverTimestamp()
      });

      // 3. Si viene de un registro en lote empresarial, actualizar estado a activo
      const memberDocId = companyMemberId || userEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
      try {
        await updateDoc(doc(db, 'company_members', memberDocId), {
          status: 'active',
          mustChangePassword: false,
          securityPinConfigured: true,
          securityQuestion,
          securityAnswer: securityAnswer.trim().toLowerCase(),
          customPassword: newPassword,
          activatedAt: new Date().toISOString()
        });
      } catch {
        // Ignorar si no fue creado por lote
      }

      toast.success('¡Contraseña, PIN y Pregunta de Seguridad activados!');
      onComplete();
    } catch (error) {
      console.error('Error guardando seguridad:', error);
      toast.error('No se pudo actualizar la configuración de seguridad.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#121317] border border-[#52ffac]/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 my-auto animate-fade-in">
        <div className="flex items-center gap-3 border-b border-white/10 pb-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#52ffac]/15 border border-[#52ffac]/40 flex items-center justify-center text-[#52ffac] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-wider">
              {isMandatory ? 'Primer Ingreso • Activación' : 'Seguridad de Cuenta'}
            </span>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight mt-0.5 truncate">
              Protege tu Acceso, {userName.split(' ')[0]}
            </h3>
            <p className="text-[10px] text-[#8a879d] font-bold leading-snug">
              Personaliza tu clave y crea tu PIN de 4 dígitos.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSecurity} className="space-y-3.5">
          {/* Nueva Contraseña */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#c7bfff] uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#5d3cfe]" /> 1. Nueva Contraseña Personal
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#16171d] border border-white/10 rounded-xl py-2.5 px-3.5 pr-10 text-xs text-white outline-none focus:border-[#5d3cfe]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a879d] hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
              className="w-full bg-[#16171d] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-[#5d3cfe]"
              required
            />
          </div>

          {/* PIN de 4 dígitos */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#52ffac] uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#52ffac]" /> 2. PIN Rápido (4 dígitos)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={securityPin}
              onChange={e => setSecurityPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Ej: 4829"
              className="w-full bg-[#16171d] border border-white/10 rounded-xl py-2.5 px-4 text-sm font-black tracking-[0.35em] text-center text-[#52ffac] outline-none focus:border-[#52ffac]"
              required
            />
          </div>

          {/* Pregunta de Seguridad */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> 3. Pregunta de Seguridad
            </label>
            <select
              value={securityQuestion}
              onChange={e => setSecurityQuestion(e.target.value)}
              className="w-full bg-[#16171d] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-amber-400"
            >
              {SECURITY_QUESTIONS.map((q, idx) => (
                <option key={idx} value={q} className="bg-[#121317] text-white">
                  {q}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={securityAnswer}
              onChange={e => setSecurityAnswer(e.target.value)}
              placeholder="Escribe tu respuesta secreta..."
              className="w-full bg-[#16171d] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            {!isMandatory && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#52ffac] to-[#10b981] text-black rounded-xl text-[11px] font-black uppercase tracking-wider shadow-lg shadow-[#52ffac]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate">{saving ? 'Guardando...' : 'Guardar Clave y PIN'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
