import React, { useState, useEffect } from 'react';
import {
  Users, Truck, Building2, Plus, Trash2, Copy, CheckCircle2,
  KeyRound, ShieldCheck, FileSpreadsheet, RefreshCw, UserPlus, Lock, Mail, Eye
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  getFirestore, collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { db, firebaseConfig } from '../firebase';
import { Asset } from '../types';
import { toast } from 'react-hot-toast';
import VehicleSearchSelect from './VehicleSearchSelect';

interface EnterpriseTeamManagerProps {
  companyId: string;
  companyName: string;
  currentSubRole?: 'fleet_coordinator' | 'building_coordinator' | null;
  assets: Asset[];
  onSwitchSubRole: (subRole: 'fleet_coordinator' | 'building_coordinator' | null) => void;
}

interface BulkRow {
  name: string;
  email: string;
  cedula: string;
  extra: string; // assetId/plate for driver, specialty for tech
}

// Instancia secundaria de Firebase para crear cuentas reales de Coordinadores, Conductores y Técnicos sin cerrar la sesión del Dueño
function getSecondaryFirebase() {
  const appName = 'MantechStaffCreatorApp';
  const secondaryApp = getApps().some(a => a.name === appName)
    ? getApp(appName)
    : initializeApp(firebaseConfig, appName);
  return {
    secondaryAuth: getAuth(secondaryApp),
    secondaryDb: getFirestore(secondaryApp)
  };
}

export default function EnterpriseTeamManager({
  companyId,
  companyName,
  currentSubRole,
  assets,
  onSwitchSubRole
}: EnterpriseTeamManagerProps) {
  const [members, setMembers] = useState<any[]>([]);

  // --- Estado para Crear Cuenta de Coordinador de Flota (con su propio correo y clave) ---
  const [fleetCoordName, setFleetCoordName] = useState('');
  const [fleetCoordEmail, setFleetCoordEmail] = useState('');
  const [fleetCoordPassword, setFleetCoordPassword] = useState('Flota2026!');
  const [fleetCoordCedula, setFleetCoordCedula] = useState('');
  const [isCreatingFleetCoord, setIsCreatingFleetCoord] = useState(false);

  // --- Estado para Crear Cuenta de Coordinador de Edificio (con su propio correo y clave) ---
  const [bldgCoordName, setBldgCoordName] = useState('');
  const [bldgCoordEmail, setBldgCoordEmail] = useState('');
  const [bldgCoordPassword, setBldgCoordPassword] = useState('Edificio2026!');
  const [bldgCoordCedula, setBldgCoordCedula] = useState('');
  const [isCreatingBldgCoord, setIsCreatingBldgCoord] = useState(false);

  // --- Estado para Creación en Lote de Conductores y Técnicos de Edificio ---
  const [targetType, setTargetType] = useState<'driver' | 'tech'>(
    currentSubRole === 'building_coordinator' ? 'tech' : 'driver'
  );
  const [inputMode, setInputMode] = useState<'rows' | 'paste'>('rows');
  const [defaultPassword, setDefaultPassword] = useState('Mantech2026!');
  const [rows, setRows] = useState<BulkRow[]>([
    { name: '', email: '', cedula: '', extra: '' },
    { name: '', email: '', cedula: '', extra: '' }
  ]);
  const [pasteText, setPasteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fleetVehicles = assets.filter(a => a.type === 'car' || a.type === 'moto');

  useEffect(() => {
    if (!companyId) return;
    // Cargar respaldo local inmediato mientras sincroniza Firestore
    try {
      const cached = localStorage.getItem(`mantech_members_${companyId}`);
      if (cached) setMembers(JSON.parse(cached));
    } catch (_) {}

    const q = query(collection(db, 'company_members'), where('companyId', '==', companyId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMembers(list);
        try {
          localStorage.setItem(`mantech_members_${companyId}`, JSON.stringify(list));
        } catch (_) {}
      },
      (err) => console.warn('Error loading company_members:', err)
    );
    return () => unsub();
  }, [companyId]);

  /**
   * Crea la cuenta real en Firebase Authentication + perfil en 'users/{uid}' sin cerrar la sesión actual del dueño/coordinador
   */
  const provisionRealUserAccount = async (params: {
    name: string;
    email: string;
    password: string;
    cedula: string;
    role: 'client' | 'driver' | 'tech';
    subRole: 'fleet_coordinator' | 'building_coordinator' | null;
    techId: string | null;
    mustChangePassword: boolean;
  }): Promise<string | null> => {
    const { secondaryAuth, secondaryDb } = getSecondaryFirebase();
    try {
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        params.email.toLowerCase().trim(),
        params.password.trim()
      );
      const newUid = cred.user.uid;

      // Escribir su documento en users/{newUid} autenticado como el nuevo usuario
      await setDoc(doc(secondaryDb, 'users', newUid), {
        uid: newUid,
        email: params.email.toLowerCase().trim(),
        name: params.name.trim(),
        role: params.role,
        subRole: params.subRole,
        companyId,
        cedula: params.cedula.trim() || '8-000-0000',
        techId: params.techId || null,
        mustChangePassword: params.mustChangePassword,
        subscription: {
          planId: params.role === 'tech' ? 'plan-basic' : 'plan-free',
          status: 'active',
          startDate: new Date().toISOString(),
          nextBillingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        createdAt: serverTimestamp()
      });

      await signOut(secondaryAuth);
      return newUid;
    } catch (err: any) {
      await signOut(secondaryAuth).catch(() => {});
      if (err?.code === 'auth/email-already-in-use') {
        // El correo ya existe en Firebase Auth; se mantiene vinculado por company_members
        return null;
      }
      throw err;
    }
  };

  // --- Crear Coordinador Individual (Flota o Edificio) ---
  const handleCreateCoordinator = async (coordType: 'fleet_coordinator' | 'building_coordinator') => {
    const isFleet = coordType === 'fleet_coordinator';
    const name = (isFleet ? fleetCoordName : bldgCoordName).trim();
    const email = (isFleet ? fleetCoordEmail : bldgCoordEmail).toLowerCase().trim();
    const password = (isFleet ? fleetCoordPassword : bldgCoordPassword).trim();
    const cedula = (isFleet ? fleetCoordCedula : bldgCoordCedula).trim() || '8-000-0000';

    if (!name || !email) {
      toast.error('Ingresa el nombre y el correo electrónico del Coordinador.');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña del Coordinador debe tener al menos 6 caracteres.');
      return;
    }

    if (isFleet) setIsCreatingFleetCoord(true);
    else setIsCreatingBldgCoord(true);

    try {
      const createdUid = await provisionRealUserAccount({
        name,
        email,
        password,
        cedula,
        role: 'client',
        subRole: coordType,
        techId: null,
        mustChangePassword: false
      });

      const docId = email.replace(/[^a-z0-9]/g, '_');
      const memberDoc = {
        id: docId,
        userUid: createdUid,
        companyId,
        companyName,
        name,
        email,
        cedula,
        role: 'client',
        subRole: coordType,
        targetType: coordType,
        defaultPassword: password,
        customPassword: password,
        mustChangePassword: false,
        securityPinConfigured: true,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'company_members', docId), memberDoc, { merge: true }).catch(() => {});

      setMembers(prev => {
        const updated = [memberDoc, ...prev.filter(m => m.id !== docId)];
        try {
          localStorage.setItem(`mantech_members_${companyId}`, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });

      toast.success(
        `¡Cuenta de ${isFleet ? 'Coordinador de Flota' : 'Coordinador de Edificio'} creada! Ya puede iniciar sesión con ${email}`
      );

      if (isFleet) {
        setFleetCoordName('');
        setFleetCoordEmail('');
        setFleetCoordCedula('');
      } else {
        setBldgCoordName('');
        setBldgCoordEmail('');
        setBldgCoordCedula('');
      }
    } catch (err: any) {
      console.error('Error creando coordinador:', err);
      toast.error(err?.message || 'No se pudo crear la cuenta del coordinador.');
    } finally {
      if (isFleet) setIsCreatingFleetCoord(false);
      else setIsCreatingBldgCoord(false);
    }
  };

  const handleRowChange = (index: number, field: keyof BulkRow, value: string) => {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addEmptyRow = () => {
    setRows(prev => [...prev, { name: '', email: '', cedula: '', extra: '' }]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const loadSampleBatch = () => {
    if (targetType === 'driver') {
      const samplePlate1 = fleetVehicles[0]?.id || '';
      const samplePlate2 = fleetVehicles[1]?.id || '';
      if (inputMode === 'rows') {
        setRows([
          { name: 'Carlos Mendoza', email: 'carlos.conductor@flota.pa', cedula: '8-712-9901', extra: samplePlate1 },
          { name: 'Roberto Gómez', email: 'roberto.conductor@flota.pa', cedula: '8-815-3321', extra: samplePlate2 },
          { name: 'Luis Herrera', email: 'luis.conductor@flota.pa', cedula: '4-701-1182', extra: '' }
        ]);
      } else {
        setPasteText(
          `Carlos Mendoza, carlos.conductor@flota.pa, 8-712-9901, ${fleetVehicles[0]?.name || 'Camión Hino #01'}\n` +
          `Roberto Gómez, roberto.conductor@flota.pa, 8-815-3321, ${fleetVehicles[1]?.name || 'Panel Ruta Norte'}\n` +
          `Luis Herrera, luis.conductor@flota.pa, 4-701-1182, Reserva`
        );
      }
      toast.success('Ejemplo de lote de conductores cargado.');
    } else {
      if (inputMode === 'rows') {
        setRows([
          { name: 'Ing. Marcos Vega', email: 'marcos.hvac@edificio.pa', cedula: '8-900-1122', extra: 'refrigeracion' },
          { name: 'Pedro Castillo', email: 'pedro.elec@edificio.pa', cedula: '8-744-5566', extra: 'electricidad' },
          { name: 'Javier Solís', email: 'javier.plomeria@edificio.pa', cedula: '2-711-8899', extra: 'plomeria' }
        ]);
      } else {
        setPasteText(
          `Ing. Marcos Vega, marcos.hvac@edificio.pa, 8-900-1122, refrigeracion\n` +
          `Pedro Castillo, pedro.elec@edificio.pa, 8-744-5566, electricidad\n` +
          `Javier Solís, javier.plomeria@edificio.pa, 2-711-8899, plomeria`
        );
      }
      toast.success('Ejemplo de cuadrilla de técnicos del edificio cargado.');
    }
  };

  const handleCreateBatch = async () => {
    if (defaultPassword.trim().length < 6) {
      toast.error('La contraseña por defecto debe tener al menos 6 caracteres.');
      return;
    }

    let parsedItems: BulkRow[] = [];
    if (inputMode === 'rows') {
      parsedItems = rows.filter(r => r.name.trim() && r.email.trim());
    } else {
      parsedItems = pasteText
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
          const parts = line.split(',').map(p => p.trim());
          return {
            name: parts[0] || '',
            email: parts[1] || '',
            cedula: parts[2] || '8-000-0000',
            extra: parts[3] || ''
          };
        })
        .filter(r => r.name && r.email);
    }

    if (parsedItems.length === 0) {
      toast.error('Completa al menos un nombre y correo electrónico.');
      return;
    }

    setIsSaving(true);
    try {
      let createdCount = 0;
      const newLocalMembers: any[] = [];

      for (const item of parsedItems) {
        const cleanEmail = item.email.toLowerCase().trim();
        const docId = cleanEmail.replace(/[^a-z0-9]/g, '_');
        const baseRole = targetType === 'driver' ? 'driver' : 'tech';
        const techId = targetType === 'tech' ? `tech-bldg-${docId}` : null;

        // 1. Crear cuenta real en Firebase Auth + users/{uid}
        const createdUid = await provisionRealUserAccount({
          name: item.name.trim(),
          email: cleanEmail,
          password: defaultPassword.trim(),
          cedula: item.cedula.trim() || '8-000-0000',
          role: baseRole,
          subRole: null,
          techId,
          mustChangePassword: true
        });

        // 2. Resolver vehículo si es conductor
        let assignedAssetId = '';
        let assignedAssetName = '';
        if (targetType === 'driver' && item.extra) {
          const matchedAsset = fleetVehicles.find(
            v =>
              v.id === item.extra ||
              v.name.toLowerCase().includes(item.extra.toLowerCase()) ||
              (v.licensePlate && v.licensePlate.toLowerCase() === item.extra.toLowerCase())
          );
          if (matchedAsset) {
            assignedAssetId = matchedAsset.id;
            assignedAssetName = matchedAsset.name;
            await updateDoc(doc(db, 'assets', matchedAsset.id), {
              driverName: item.name.trim(),
              ...(createdUid ? { assignedDriverId: createdUid } : {})
            }).catch(() => {});
          } else {
            assignedAssetName = item.extra;
          }
        }

        const memberData = {
          id: docId,
          userUid: createdUid,
          companyId,
          companyName,
          name: item.name.trim(),
          email: cleanEmail,
          cedula: item.cedula.trim() || '8-000-0000',
          role: baseRole,
          subRole: null,
          targetType,
          techId,
          specialty: targetType === 'tech' ? item.extra || 'refrigeracion' : null,
          assignedAssetId: assignedAssetId || null,
          assignedAssetName: assignedAssetName || null,
          defaultPassword: defaultPassword.trim(),
          mustChangePassword: true,
          securityPinConfigured: false,
          status: 'pending_activation',
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'company_members', docId), memberData, { merge: true }).catch(() => {});
        newLocalMembers.push(memberData);
        createdCount++;
      }

      setMembers(prev => {
        const map = new Map(prev.map(m => [m.id, m]));
        newLocalMembers.forEach(m => map.set(m.id, m));
        const updated = Array.from(map.values());
        try {
          localStorage.setItem(`mantech_members_${companyId}`, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });

      toast.success(
        `¡${createdCount} ${
          targetType === 'driver' ? 'conductor(es)' : 'técnico(s) de edificio'
        } registrados con usuario y contraseña temporal!`
      );
      setRows([{ name: '', email: '', cedula: '', extra: '' }]);
      setPasteText('');
    } catch (err) {
      console.error('Error creando lote:', err);
      toast.error('Hubo un error al crear las cuentas del lote.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignVehicleToMember = async (member: any, assetId: string) => {
    const vehicle = fleetVehicles.find(v => v.id === assetId);
    try {
      await updateDoc(doc(db, 'company_members', member.id), {
        assignedAssetId: vehicle ? vehicle.id : null,
        assignedAssetName: vehicle ? vehicle.name : null
      }).catch(() => {});
      if (vehicle) {
        await updateDoc(doc(db, 'assets', vehicle.id), {
          driverName: member.name,
          ...(member.userUid ? { assignedDriverId: member.userUid } : {})
        });
        toast.success(`${member.name} asignado a ${vehicle.name}`);
      }
    } catch (e) {
      toast.error('No se pudo asignar el vehículo.');
    }
  };

  const handleResetPassword = async (member: any) => {
    try {
      await updateDoc(doc(db, 'company_members', member.id), {
        mustChangePassword: true,
        status: 'pending_activation',
        defaultPassword: defaultPassword.trim()
      }).catch(() => {});
      toast.success(`Clave restablecida a "${defaultPassword.trim()}" para ${member.name}`);
    } catch {
      toast.error('No se pudo restablecer la clave.');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteDoc(doc(db, 'company_members', memberId)).catch(() => {});
      setMembers(prev => {
        const updated = prev.filter(m => m.id !== memberId);
        try {
          localStorage.setItem(`mantech_members_${companyId}`, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
      toast.success('Miembro eliminado del directorio.');
    } catch {
      toast.error('Error al eliminar.');
    }
  };

  const copyCredentials = (member: any) => {
    const isCoord = member.targetType === 'fleet_coordinator' || member.targetType === 'building_coordinator';
    const roleName =
      member.targetType === 'driver'
        ? 'Conductor de Flota'
        : member.targetType === 'tech'
        ? 'Técnico de Edificio'
        : member.targetType === 'fleet_coordinator'
        ? 'Coordinador de Flota (Espacio Exclusivo Flota)'
        : 'Coordinador de Edificio (Espacio Exclusivo Edificio)';
    const text = isCoord
      ? `🔐 Acceso Coordinador MantechPro (${companyName})\n👤 Cargo: ${roleName}\n📧 Usuario (Correo): ${member.email}\n🔑 Contraseña: ${member.customPassword || member.defaultPassword}\n🌐 Ingresa desde tu celular o PC en la pantalla de Iniciar Sesión para abrir tu panel exclusivo.`
      : `🔐 Acceso MantechPro (${companyName})\n👤 Perfil: ${roleName}\n📧 Usuario (Correo): ${member.email}\n🔑 Clave Temporal: ${member.defaultPassword}\n⚠️ Al ingresar por primera vez, la app te pedirá cambiar tu clave y crear tu PIN de 4 dígitos + pregunta de seguridad.`;
    navigator.clipboard.writeText(text);
    toast.success('Usuario y contraseña copiados para enviar por WhatsApp o correo.');
  };

  const fleetCoordinators = members.filter(m => m.targetType === 'fleet_coordinator');
  const buildingCoordinators = members.filter(m => m.targetType === 'building_coordinator');

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-20">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121317] border border-white/10 p-5 sm:p-6 rounded-3xl">
        <div>
          <span className="inline-block px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-widest">
            Cuentas Independientes por Rol Empresarial
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight mt-2">
            Coordinadores y <span className="text-[#52ffac]">Personal en Lote</span>
          </h1>
          <p className="text-xs text-[#c8c4d9] font-medium mt-1">
            Crea el usuario y contraseña propios para tu <b>Coordinador de Flota</b> y tu <b>Coordinador de Edificio</b> (ellos nunca usan tu correo de dueño), y registra Conductores o Técnicos en lote.
          </p>
        </div>

        {/* Vista previa opcional para el dueño */}
        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 bg-[#16171d] p-3 rounded-2xl border border-white/10">
          <span className="text-[9px] font-black uppercase tracking-wider text-[#8a879d] flex items-center gap-1">
            <Eye className="w-3 h-3 text-[#52ffac]" /> Vista actual en tu pantalla:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSwitchSubRole(null)}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                !currentSubRole ? 'bg-[#5d3cfe] text-white' : 'bg-white/5 text-[#8a879d] hover:text-white'
              }`}
            >
              👑 Dueño
            </button>
            <button
              type="button"
              onClick={() => onSwitchSubRole('fleet_coordinator')}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                currentSubRole === 'fleet_coordinator' ? 'bg-amber-500 text-black' : 'bg-white/5 text-[#8a879d] hover:text-white'
              }`}
            >
              🚛 Flota
            </button>
            <button
              type="button"
              onClick={() => onSwitchSubRole('building_coordinator')}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                currentSubRole === 'building_coordinator' ? 'bg-[#52ffac] text-black' : 'bg-white/5 text-[#8a879d] hover:text-white'
              }`}
            >
              🏢 Edificio
            </button>
          </div>
        </div>
      </header>

      {/* 1. CREAR USUARIO Y CONTRASEÑA PROPIOS PARA COORDINADORES (SOLO VISIBLE PARA EL DUEÑO) */}
      {!currentSubRole && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* TARJETA A: COORDINADOR DE FLOTA */}
          <div className="bg-[#121317] border border-amber-500/30 p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Sesión Independiente</span>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                    Crear Coordinador de Flota
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#c8c4d9] leading-relaxed">
              Asígnale su propio correo y contraseña. Al iniciar sesión en la app, entrará directo a su <b>Espacio de Flota</b> (Vehículos, GPS, Combustible y Conductores).
            </p>

            <div className="space-y-2.5 pt-1">
              <input
                type="text"
                value={fleetCoordName}
                onChange={e => setFleetCoordName(e.target.value)}
                placeholder="Nombre del Coordinador (Ej: Lic. Andrés Ríos)"
                className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-amber-400"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#8a879d] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={fleetCoordEmail}
                    onChange={e => setFleetCoordEmail(e.target.value)}
                    placeholder="flota@tuempresa.com"
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fleetCoordPassword}
                    onChange={e => setFleetCoordPassword(e.target.value)}
                    placeholder="Contraseña (mín. 6)"
                    className="w-full bg-[#0d0e12] border border-amber-500/30 rounded-xl py-2.5 pl-9 pr-3 text-xs font-black text-amber-400 outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <input
                type="text"
                value={fleetCoordCedula}
                onChange={e => setFleetCoordCedula(e.target.value)}
                placeholder="Cédula (Opcional, ej: 8-888-1020)"
                className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-amber-400"
              />
              <button
                type="button"
                disabled={isCreatingFleetCoord}
                onClick={() => handleCreateCoordinator('fleet_coordinator')}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isCreatingFleetCoord ? 'Creando Usuario en Firebase...' : '+ Crear Usuario Coordinador de Flota'}
              </button>
            </div>

            {fleetCoordinators.length > 0 && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">
                  Coordinadores de Flota Activos ({fleetCoordinators.length}):
                </span>
                {fleetCoordinators.map(fc => (
                  <div key={fc.id} className="p-3 rounded-xl bg-[#16171d] border border-amber-500/20 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">{fc.name}</div>
                      <div className="text-[10px] font-mono text-[#c8c4d9] truncate">
                        📧 {fc.email} • 🔑 <span className="text-amber-400 font-bold">{fc.customPassword || fc.defaultPassword}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCredentials(fc)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 text-[9px] font-black uppercase flex items-center gap-1 shrink-0"
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TARJETA B: COORDINADOR DE EDIFICIO / PH */}
          <div className="bg-[#121317] border border-[#52ffac]/30 p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#52ffac]/15 border border-[#52ffac]/30 flex items-center justify-center text-[#52ffac] shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#52ffac]">Sesión Independiente</span>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                    Crear Coordinador de Edificio
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#c8c4d9] leading-relaxed">
              Asígnale su propio correo y contraseña. Al iniciar sesión en la app, entrará directo a su <b>Espacio de Edificio</b> (Aires, Elevadores, Plantas y Técnicos).
            </p>

            <div className="space-y-2.5 pt-1">
              <input
                type="text"
                value={bldgCoordName}
                onChange={e => setBldgCoordName(e.target.value)}
                placeholder="Nombre del Coordinador (Ej: Ing. Elena Paz)"
                className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-[#52ffac]"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#8a879d] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={bldgCoordEmail}
                    onChange={e => setBldgCoordEmail(e.target.value)}
                    placeholder="edificio@tuempresa.com"
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-[#52ffac]"
                  />
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#52ffac] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bldgCoordPassword}
                    onChange={e => setBldgCoordPassword(e.target.value)}
                    placeholder="Contraseña (mín. 6)"
                    className="w-full bg-[#0d0e12] border border-[#52ffac]/30 rounded-xl py-2.5 pl-9 pr-3 text-xs font-black text-[#52ffac] outline-none focus:border-[#52ffac]"
                  />
                </div>
              </div>
              <input
                type="text"
                value={bldgCoordCedula}
                onChange={e => setBldgCoordCedula(e.target.value)}
                placeholder="Cédula (Opcional, ej: 8-900-4455)"
                className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-[#52ffac]"
              />
              <button
                type="button"
                disabled={isCreatingBldgCoord}
                onClick={() => handleCreateCoordinator('building_coordinator')}
                className="w-full py-3 rounded-xl bg-[#52ffac] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#52ffac]/20 disabled:opacity-50"
              >
                {isCreatingBldgCoord ? 'Creando Usuario en Firebase...' : '+ Crear Usuario Coordinador de Edificio'}
              </button>
            </div>

            {buildingCoordinators.length > 0 && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#52ffac]">
                  Coordinadores de Edificio Activos ({buildingCoordinators.length}):
                </span>
                {buildingCoordinators.map(bc => (
                  <div key={bc.id} className="p-3 rounded-xl bg-[#16171d] border border-[#52ffac]/20 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">{bc.name}</div>
                      <div className="text-[10px] font-mono text-[#c8c4d9] truncate">
                        📧 {bc.email} • 🔑 <span className="text-[#52ffac] font-bold">{bc.customPassword || bc.defaultPassword}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCredentials(bc)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#52ffac]/15 text-[#52ffac] hover:bg-[#52ffac]/25 text-[9px] font-black uppercase flex items-center gap-1 shrink-0"
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CREADOR EN LOTE DE CONDUCTORES Y TÉCNICOS CON CONTRASEÑA POR DEFECTO */}
      <div className="bg-[#121317] border border-white/10 p-4 sm:p-6 rounded-3xl space-y-5 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#5d3cfe] shrink-0" /> Creación en Lote: Conductores y Técnicos de Edificio
            </h3>
            <p className="text-[11px] text-[#8a879d] mt-0.5">
              Crea múltiples cuentas de una sola vez con clave por defecto. Al entrar, la app les pedirá cambiar su clave y configurar su PIN de 4 dígitos.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSampleBatch}
            className="px-3.5 py-2 rounded-xl bg-[#52ffac]/10 border border-[#52ffac]/30 text-[#52ffac] text-[10px] font-black uppercase tracking-wider hover:bg-[#52ffac]/20 transition-all self-start shrink-0"
          >
            ⚡ Cargar Lote de Ejemplo
          </button>
        </div>

        {/* Selector de Tipo de Personal en Lote */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(!currentSubRole || currentSubRole === 'fleet_coordinator') && (
            <button
              type="button"
              onClick={() => setTargetType('driver')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                targetType === 'driver'
                  ? 'bg-amber-500/20 border-amber-500 text-white'
                  : 'bg-[#16171d] border-white/10 text-[#8a879d]'
              }`}
            >
              <Truck className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-black uppercase">Lote de Conductores de Flota</div>
                <div className="text-[10px] opacity-80">Crea sus usuarios, asigna camión y clave temporal</div>
              </div>
            </button>
          )}

          {(!currentSubRole || currentSubRole === 'building_coordinator') && (
            <button
              type="button"
              onClick={() => setTargetType('tech')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                targetType === 'tech'
                  ? 'bg-[#52ffac]/20 border-[#52ffac] text-white'
                  : 'bg-[#16171d] border-white/10 text-[#8a879d]'
              }`}
            >
              <Building2 className="w-6 h-6 text-[#52ffac] shrink-0" />
              <div>
                <div className="text-xs font-black uppercase">Lote de Técnicos del Edificio</div>
                <div className="text-[10px] opacity-80">Crea sus usuarios por especialidad (HVAC, Planta, Plomería)</div>
              </div>
            </button>
          )}
        </div>

        {/* Contraseña por Defecto + Selector de Modo (Filas vs Pegar Lista) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4 bg-[#16171d] p-4 rounded-2xl border border-white/5">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Contraseña por Defecto para este Lote
            </label>
            <input
              type="text"
              value={defaultPassword}
              onChange={e => setDefaultPassword(e.target.value)}
              className="w-full sm:max-w-xs bg-[#0d0e12] border border-white/15 rounded-xl py-2.5 px-3.5 text-xs font-black text-[#52ffac] outline-none focus:border-[#52ffac]"
              placeholder="Ej: Mantech2026!"
            />
            <p className="text-[9px] text-[#8a879d]">
              Al iniciar sesión con esta clave, la app obligará al Conductor o Técnico a crear su contraseña nueva + PIN de 4 dígitos y Pregunta de Seguridad.
            </p>
          </div>

          <div className="flex bg-[#0d0e12] p-1 rounded-xl border border-white/10 shrink-0 self-start sm:self-end">
            <button
              type="button"
              onClick={() => setInputMode('rows')}
              className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                inputMode === 'rows' ? 'bg-[#5d3cfe] text-white' : 'text-[#8a879d]'
              }`}
            >
              Tabla Sencilla
            </button>
            <button
              type="button"
              onClick={() => setInputMode('paste')}
              className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 ${
                inputMode === 'paste' ? 'bg-[#5d3cfe] text-white' : 'text-[#8a879d]'
              }`}
            >
              <FileSpreadsheet className="w-3 h-3" /> Pegar Lista / Excel
            </button>
          </div>
        </div>

        {/* MODO 1: TABLA SENCILLA FILA POR FILA */}
        {inputMode === 'rows' ? (
          <div className="space-y-3">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-[#16171d] p-3 rounded-2xl border border-white/5 items-center"
              >
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={row.name}
                    onChange={e => handleRowChange(idx, 'name', e.target.value)}
                    placeholder="Nombre Completo"
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-[#5d3cfe]"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="email"
                    value={row.email}
                    onChange={e => handleRowChange(idx, 'email', e.target.value)}
                    placeholder="correo@empresa.com"
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-[#5d3cfe]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={row.cedula}
                    onChange={e => handleRowChange(idx, 'cedula', e.target.value)}
                    placeholder="Cédula (8-888-888)"
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-[#5d3cfe]"
                  />
                </div>
                <div className="sm:col-span-3">
                  {targetType === 'driver' ? (
                    <VehicleSearchSelect
                      vehicles={fleetVehicles}
                      selectedId={row.extra}
                      onSelect={assetId => handleRowChange(idx, 'extra', assetId)}
                      placeholder="Elegir camión o placa..."
                      emptyLabel="Sin camión (En Reserva)"
                      compact
                    />
                  ) : (
                    <select
                      value={row.extra}
                      onChange={e => handleRowChange(idx, 'extra', e.target.value)}
                      className="w-full bg-[#0d0e12] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-[#52ffac]"
                    >
                      <option value="refrigeracion">❄️ HVAC / Aire Acondicionado</option>
                      <option value="electricidad">⚡ Electricidad / Planta</option>
                      <option value="plomeria">💧 Plomería / Bombas</option>
                      <option value="mecanico">🛗 Elevadores / Electromecánica</option>
                    </select>
                  )}
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    title="Quitar fila"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
              <button
                type="button"
                onClick={addEmptyRow}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider hover:bg-white/10 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Añadir Otra Fila al Lote
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleCreateBatch}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#5d3cfe] to-[#4c2bd6] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#5d3cfe]/30 hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Creando Cuentas en Firebase...' : 'Guardar y Crear Cuentas del Lote ➔'}
              </button>
            </div>
          </div>
        ) : (
          /* MODO 2: PEGAR LISTA EN LOTE (TEXTO / CSV / EXCEL) */
          <div className="space-y-3">
            <p className="text-[10px] text-[#8a879d] font-bold">
              Pega una persona por línea con el formato: <code className="text-[#52ffac]">Nombre Completo, correo@empresa.com, Cédula, Camión o Especialidad</code>
            </p>
            <textarea
              rows={5}
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder={
                targetType === 'driver'
                  ? 'Carlos Mendoza, carlos@flota.pa, 8-712-9901, Camión Hino\nRoberto Gómez, roberto@flota.pa, 8-815-3321, Panel Ruta Norte'
                  : 'Ing. Marcos Vega, marcos@edificio.pa, 8-900-1122, refrigeracion\nPedro Castillo, pedro@edificio.pa, 8-744-5566, electricidad'
              }
              className="w-full bg-[#0d0e12] border border-white/10 rounded-2xl p-4 text-xs font-mono text-white outline-none focus:border-[#5d3cfe]"
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCreateBatch}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#5d3cfe] to-[#4c2bd6] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#5d3cfe]/30"
              >
                {isSaving ? 'Creando Cuentas...' : 'Procesar y Crear Cuentas del Lote ➔'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. DIRECTORIO DE COORDINADORES, CONDUCTORES Y TÉCNICOS DEL EDIFICIO */}
      <div className="bg-[#121317] border border-white/10 p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Directorio de Cuentas de la Empresa ({members.length})
            </h3>
            <p className="text-[10px] text-[#8a879d]">
              Copia el usuario y contraseña de cualquier miembro con 1 clic o asígnale vehículo de flota.
            </p>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-[#8a879d] text-xs">
            Aún no has registrado personal. Crea arriba tu Coordinador de Flota o Edificio, o usa <b>"⚡ Cargar Lote de Ejemplo"</b>.
          </div>
        ) : (
          <div className="space-y-2.5">
            {members
              .filter(m => {
                if (currentSubRole === 'fleet_coordinator') return m.targetType === 'driver' || m.targetType === 'fleet_coordinator';
                if (currentSubRole === 'building_coordinator') return m.targetType === 'tech' || m.targetType === 'building_coordinator';
                return true;
              })
              .map(m => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-[#16171d] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-white uppercase">{m.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          m.targetType === 'driver'
                            ? 'bg-amber-500/20 text-amber-400'
                            : m.targetType === 'tech'
                            ? 'bg-[#52ffac]/20 text-[#52ffac]'
                            : 'bg-[#5d3cfe]/20 text-[#c7bfff]'
                        }`}
                      >
                        {m.targetType === 'driver'
                          ? '🚛 Conductor'
                          : m.targetType === 'tech'
                          ? `🏢 Técnico (${m.specialty || 'Planta'})`
                          : m.targetType === 'fleet_coordinator'
                          ? '🧭 Coord. Flota (Cuenta Propia)'
                          : '🏗️ Coord. Edificio (Cuenta Propia)'}
                      </span>
                      {m.mustChangePassword ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[9px] font-black uppercase">
                          Clave Temporal: {m.defaultPassword}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#52ffac]/15 text-[#52ffac] text-[9px] font-black uppercase">
                          ✓ Clave Activa: {m.customPassword || m.defaultPassword || 'Configurada'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#c8c4d9] font-mono">
                      📧 Usuario: <b>{m.email}</b> • 🪪 Cédula: {m.cedula}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {m.targetType === 'driver' && (
                      <div className="w-full sm:w-56">
                        <VehicleSearchSelect
                          vehicles={fleetVehicles}
                          selectedId={m.assignedAssetId || ''}
                          onSelect={assetId => handleAssignVehicleToMember(m, assetId)}
                          placeholder="Asignar Camión"
                          emptyLabel="Sin camión (En Reserva)"
                          compact
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => copyCredentials(m)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase flex items-center gap-1"
                      title="Copiar usuario y contraseña para enviar al trabajador"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#52ffac]" /> Copiar Usuario y Clave
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResetPassword(m)}
                      className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                      title="Restablecer a contraseña temporal"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMember(m.id)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
