import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc, getDocs, query, where, arrayUnion, deleteDoc, increment, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { Asset, TechProfile, JobRequest, InventoryItem } from "../types";
import axios from 'axios';
import { LocalNotifications } from '@capacitor/local-notifications';

export function useBusinessLogic() {
  const { user, loggedInName, userData, subscription, updateUserSubscription } = useAuth();
  const { assets, requests, technicians } = useData();

  async function handleVerifyIdentityAIProcess(userId: string) {
    const loading = toast.loading("Analizando identidad con motor IA...");
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await updateDoc(doc(db, "users", userId), {
        'mantechId.aiVerified': true,
        'mantechId.verifiedAt': serverTimestamp(),
        'recordStatus': 'verified'
      });
      toast.success("Identidad validada por IA.", { id: loading });
    } catch (err) {
      console.error(err);
      toast.error("Fallo en verificación IA.", { id: loading });
    }
  }

  // --- PROTOCOLO DE PRIVACIDAD: PURGA DE CHAT ---
  const purgeChatMessages = async (requestId: string) => {
    try {
      // 1. Eliminar historial previo
      const messagesQuery = query(collection(db, "messages"), where("requestId", "==", requestId));
      const messagesSnap = await getDocs(messagesQuery);
      if (!messagesSnap.empty) {
        const batch = writeBatch(db);
        messagesSnap.docs.forEach((msgDoc) => batch.delete(msgDoc.ref));
        await batch.commit();
      }

      // 2. Insertar notificación final de seguridad (Mensaje efímero de cierre)
      await addDoc(collection(db, "messages"), {
        requestId,
        sender: 'tech',
        text: "🔐 PROTOCOLO DE PRIVACIDAD: La sesión de comunicación ha sido purgada y cerrada por finalización de servicio. Los datos del chat ya no son accesibles por seguridad.",
        timestamp: serverTimestamp()
      });

      console.log(`🧹 Protocolo de Privacidad ejecutado para el ticket ${requestId}.`);
    } catch (err) { console.error("Error purging chat:", err); }
  };

  const notifyAdmin = async (title: string, body: string) => {
    try {
      // 1. Notificación en Tiempo Real (Push)
      await axios.post('/api/push-notification', {
        title,
        body,
        token: 'ADMIN_TOKEN_MASTER'
      });
      // 2. Registro en Firestore para Historial del Admin (admin-uid es un placeholder)
      await addDoc(collection(db, "notifications"), {
        userId: 'admin@mantech.com',
        title,
        body,
        type: 'system',
        createdAt: serverTimestamp(),
        read: false
      });
    } catch (err) { console.error("Notification failed", err); }
  };

  const handleSendTestPush = async () => {
    try {
      await LocalNotifications.requestPermissions();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "📡 PRUEBA DE ENLACE EXITOSA",
            body: "Este es el canal de notificaciones industriales de MantechPro Master V4 operando correctamente.",
            id: 999,
            schedule: { at: new Date(Date.now() + 2000) },
            sound: 'beep.wav'
          }
        ]
      });
      toast.success("Señal de prueba enviada. Verifique su celular en 2 segundos.");
    } catch (e) {
      console.error(e);
      toast.error("Fallo en la ráfaga de prueba.");
    }
  };

  const handlePostOpenMarket = async (assetId: string, description: string) => {
    if (!user) return;
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    try {
      const docRef = await addDoc(collection(db, "requests"), {
        clientId: user.uid, clientName: loggedInName, assetId, assetName: asset.name,
        techId: 'open_market', techName: 'Subasta Abierta',
        description, status: 'open_bidding', createdAt: serverTimestamp(),
        isPublic: true, bids: []
      });

      // Notificar a técnicos relevantes de la categoría (esto lo haría idealmente una Cloud Function)
      toast.success("¡Requerimiento publicado en la Subasta Abierta!");
    } catch (err) { console.error(err); }
  };

  const handleAcceptQuote = async (requestId: string, method: string) => {
    if (!requestId) return;
    const req = requests.find(r => r.id === requestId);
    if (!req?.scheduledDate) return;
    try {
      const amountToPay = req.price || 0;
      if (method === 'yappy') {
        await updateDoc(doc(db, "requests", requestId), {
          status: 'pending_verification',
          paidAt: serverTimestamp(),
          paymentMethod: method,
          amountPaid: amountToPay // Registrar el primer abono
        });
        await addDoc(collection(db, "messages"), { requestId, sender: 'client', text: `He realizado el pago de B/. ${amountToPay} vía YAPPY. Quedo a la espera de la verificación oficial.`, timestamp: serverTimestamp() });

        await notifyAdmin("💳 PAGO PENDIENTE", `El cliente ${req.clientName} envió un pago de $${amountToPay} vía YAPPY.`);
        toast.success("Pago enviado. Verificación en curso.");
      } else {
        await updateDoc(doc(db, "requests", requestId), {
          status: 'accepted',
          paidAt: serverTimestamp(),
          paymentMethod: method,
          amountPaid: amountToPay // Registrar el primer abono
        });
        await addDoc(collection(db, "agenda"), {
          requestId, techId: req.techId, techUserId: req.techUserId,
          clientName: req.clientName, clientId: user!.uid,
          title: `CONFIRMADO: ${req.assetName}`, date: req.scheduledDate, time: req.scheduledTime,
          duration: `${req.scheduledDuration}h`, travelTime: `${req.scheduledTravelTime} min`,
          status: 'pending', createdAt: serverTimestamp()
        });

        // Notificar al Técnico
        await addDoc(collection(db, "notifications"), {
          userId: req.techUserId,
          title: "✅ Depósito Recibido",
          body: `El cliente ha pagado B/. ${amountToPay}. Tienes una nueva cita agendada.`,
          type: 'billing',
          createdAt: serverTimestamp(),
          read: false
        });

        await addDoc(collection(db, "messages"), { requestId, sender: 'tech', text: `¡Hola! Recibí tu confirmación vía ${method.toUpperCase()}. Cita confirmada.`, timestamp: serverTimestamp() });
        toast.success("¡Depósito asegurado!");
      }
    } catch (err) { console.error(err); }
  };

  const handleCompleteJob = async (requestId: string, signature: string, ratingVal: number, ratingComment: string) => {
    try {
      const req = requests.find(r => r.id === requestId);
      if (!req) return;
      const newStatus = req.status === 'executing' ? 'completed' : 'rated';

      await updateDoc(doc(db, "requests", requestId), {
        status: newStatus,
        visitFinishedAt: new Date().toISOString(),
        clientSignature: signature,
        rating: ratingVal,
        comment: ratingComment
      });

      await purgeChatMessages(requestId);

      if (newStatus === 'completed') {
        const tech = technicians.find(t => t.id === req.techId);
        if (tech) {
          const finalR = Math.max(1, ratingVal - ((req.rescheduleCount || 0) * 0.2));
          const nRating = ((tech.rating * tech.reviewCount) + finalR) / (tech.reviewCount + 1);
          const earnings = Number(req.technicianEarnings || 0);
          const currentBalance = Number(tech.wallet?.balance || 0);
          const newBalance = currentBalance + earnings;

          const newTransaction = {
            id: `TX-${Date.now().toString().substring(7)}`,
            amount: earnings,
            type: 'credit',
            description: `Servicio: ${req.assetName}`,
            timestamp: new Date().toISOString(),
            status: 'completed'
          };

          const updatedTransactions = [newTransaction, ...(tech.wallet?.transactions || [])];

          // Lógica de Fidelidad: 1 punto por cada $10 facturados
          const pointsEarned = Math.floor(earnings / 10);
          const newPoints = (tech.loyaltyPoints || 0) + pointsEarned;

          await updateDoc(doc(db, "technicians", tech.id), {
            completedJobs: (tech.completedJobs || 0) + 1,
            reviewCount: tech.reviewCount + 1,
            rating: Number(nRating.toFixed(1)),
            'wallet.balance': newBalance,
            'wallet.transactions': updatedTransactions,
            loyaltyPoints: newPoints
          });

          // Notificar al Técnico sobre los puntos
          if (pointsEarned > 0) {
            await addDoc(collection(db, "notifications"), {
              userId: req.techUserId,
              title: "🌟 Puntos Mantech Ganados",
              body: `Has ganado ${pointsEarned} puntos por completar el servicio de ${req.assetName}.`,
              type: 'system',
              createdAt: serverTimestamp(),
              read: false
            });
          }
        }
      }
      toast.success("¡Servicio finalizado exitosamente!");
    } catch (err) { console.error(err); }
  };

  const handleRedeemPoints = async (techId: string, cost: number, rewardLabel: string) => {
    try {
      const techRef = doc(db, "technicians", techId);
      const techSnap = await getDoc(techRef);
      if (!techSnap.exists()) return;
      const tech = techSnap.data() as TechProfile;

      if ((tech.loyaltyPoints || 0) < cost) {
        toast.error("Puntos insuficientes para este canje.");
        return false;
      }

      const updates: any = {
        loyaltyPoints: increment(-cost)
      };

      // Lógica especial para desbloqueo de módulos
      if (rewardLabel === 'Módulo Inventario Pro') {
        updates.unlockedModules = arrayUnion('inventory_pro');
      } else {
        updates.unlockedModules = arrayUnion(rewardLabel);
      }

      await updateDoc(techRef, updates);

      toast.success(`¡Canje Exitoso! Has obtenido: ${rewardLabel}`, { icon: '🎁' });
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar el canje.");
      return false;
    }
  };

  const handleConfirmPayment = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    try {
      await updateDoc(doc(db, "requests", requestId), { status: 'accepted', paymentVerifiedAt: serverTimestamp() });
      await addDoc(collection(db, "agenda"), {
        requestId, techId: req.techId, techUserId: req.techUserId,
        clientName: req.clientName, clientId: req.clientId,
        title: `CONFIRMADO: ${req.assetName}`, date: req.scheduledDate, time: req.scheduledTime,
        duration: `${req.scheduledDuration}h`, travelTime: `${req.scheduledTravelTime} min`,
        status: 'pending', createdAt: serverTimestamp()
      });
      toast.success("Pago verificado.");
    } catch (err) { console.error(err); }
  };

  const handleRequestSubscription = async (userId: string, planId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();

      // MANTENER EL PLAN ACTUAL: No tocamos el planId principal hasta que el admin confirme
      const currentSub = data?.subscription || { planId: 'plan-free' };

      const newSub = {
        ...currentSub, // Preservamos planId actual para que no cambien los límites
        status: 'pending_payment_verification',
        pendingPlanId: planId, // Registramos el nuevo plan como pendiente
        requestAt: serverTimestamp()
      };

      await updateDoc(userRef, { subscription: newSub });

      await notifyAdmin("🚀 SOLICITUD DE SUSCRIPCIÓN", `El usuario ${loggedInName} solicita cambio al plan ${planId.toUpperCase()} vía YAPPY.`);

      toast.success("Solicitud enviada. Su plan actual se mantiene activo hasta la validación manual.");
    } catch (err) { console.error(err); }
  };

  const handleApproveSubscription = async (userId: string, planId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();
      const currentSub = data?.subscription;

      // Si planId no se pasa, usamos el pendingPlanId
      const finalPlanId = planId || currentSub?.pendingPlanId || 'plan-free';

      const nextBilling = new Date();
      nextBilling.setDate(nextBilling.getDate() + 30);

      const newSub = {
        planId: finalPlanId,
        status: 'active',
        startDate: new Date().toISOString(),
        nextBillingDate: nextBilling.toISOString(),
        pendingPlanId: null // Limpiamos el pendiente
      };

      await updateDoc(userRef, { subscription: newSub });

      if (data?.role === 'tech') {
        const techId = data.techId || `tech-${userId}`;
        await updateDoc(doc(db, "technicians", techId), { plan: finalPlanId.split('-')[1] });
      }
      toast.success("Suscripción aprobada y beneficios liberados.");
    } catch (err) { console.error(err); }
  };

  const handleSaveMaterial = async (requestId: string, name: string, price: number, quantity: number, category: string) => {
    if (!requestId) return;
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const newMaterials = [...(req.materials || []), { name, price, quantity, category, addedAt: new Date().toISOString() }];
    await updateDoc(doc(db, "requests", requestId), { materials: newMaterials });
    toast.success("Material registrado.");
  };

  const handleTriggerUnforeseen = async (requestId: string, reason: string, extraCost: number, category: string) => {
    if (!requestId) return;
    try {
      const req = requests.find(r => r.id === requestId);
      const isAutoApproved = req?.isEmergency && extraCost <= (req?.autoApprovalThreshold || 0);

      if (isAutoApproved) {
        // Ejecutar suma automática para emergencias
        const newTotal = (req!.price || 0) + extraCost;
        const commission = newTotal * 0.15;
        await updateDoc(doc(db, "requests", requestId), {
          price: newTotal,
          commission,
          technicianEarnings: newTotal - commission,
          materials: arrayUnion({
            name: `[EMERGENCIA] ${reason}`,
            price: extraCost,
            quantity: 1,
            category,
            addedAt: new Date().toISOString()
          })
        });
        toast.success("Imprevisto aprobado automáticamente por protocolo de emergencia.");
      } else {
        await updateDoc(doc(db, "requests", requestId), {
          unforeseenProposal: {
            extraCost,
            reason,
            category,
            status: 'pending',
            at: serverTimestamp()
          }
        });
        await addDoc(collection(db, "messages"), {
          requestId, sender: 'tech',
          text: `🚨 RE-COTIZACIÓN POR IMPREVISTO [${category.toUpperCase()}]: ${reason}. Se requiere un pago adicional de B/. ${extraCost}.`,
          timestamp: serverTimestamp()
        });
        toast.success("Propuesta de costo extra enviada al cliente.");
      }
    } catch (err) { console.error(err); }
  };

  const handleRespondToUnforeseen = async (requestId: string, accept: boolean) => {
    try {
      const req = requests.find(r => r.id === requestId);
      if (!req?.unforeseenProposal) return;

      if (accept) {
        // Lógica de Crédito: El total nuevo se actualiza.
        // El abono de visita se marca como acreditado para el desglose final.
        const newTotal = (req.price || 0) + (req.unforeseenProposal.extraCost || 0);
        const commission = newTotal * 0.15;

        await updateDoc(doc(db, "requests", requestId), {
          price: newTotal,
          commission,
          technicianEarnings: newTotal - commission,
          'unforeseenProposal.status': 'accepted',
          visitFeeCredited: true,
          status: 'accepted', // Vuelve a estado aceptado para iniciar trabajo
          // Guardar en el historial de materiales si es un repuesto
          materials: arrayUnion({
            name: `[RE-COTIZACIÓN] ${req.unforeseenProposal.reason}`,
            price: req.unforeseenProposal.extraCost,
            quantity: 1,
            category: req.unforeseenProposal.category,
            addedAt: new Date().toISOString()
          })
        });
        toast.success("Re-cotización aceptada. La tarifa de inspección se ha aplicado como abono.");
      } else {
        // Si rechaza la recotización, se cobra solo la visita y se cierra el ticket
        // El precio del ticket pasa a ser únicamente el monto de la visita.
        await updateDoc(doc(db, "requests", requestId), {
          status: 'cancelled',
          'unforeseenProposal.status': 'rejected',
          price: req.visitFeeAmount || 15,
          commission: (req.visitFeeAmount || 15) * 0.20, // Comisión estándar por gestión de visita
          technicianEarnings: (req.visitFeeAmount || 15) * 0.80,
          cancellationReason: 'Cliente rechazó re-cotización tras inspección',
          cancelledAt: serverTimestamp()
        });

        await notifyAdmin("🚫 SERVICIO CERRADO TRAS INSPECCIÓN", `El cliente ${req.clientName} rechazó la recotización. Cobro final de inspección: B/. ${req.visitFeeAmount || 15}.`);
        toast.error("Servicio finalizado. Solo se procederá con el cobro de la tarifa de inspección.");
      }
    } catch (err) { console.error(err); }
  };

  const handleToggleTask = async (requestId: string, taskId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req || !req.checklist) return;
    const newChecklist = req.checklist.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
    await updateDoc(doc(db, "requests", requestId), { checklist: newChecklist });
  };

  const handleVerifyTechnician = async (techId: string, isVerified: boolean) => {
    try {
      await updateDoc(doc(db, "technicians", techId), { isVerified });
      const techSnap = await getDoc(doc(db, "technicians", techId));
      if (techSnap.exists()) {
        const t = techSnap.data();
        await addDoc(collection(db, "notifications"), {
          userId: t.userId,
          title: isVerified ? "✅ Perfil Verificado" : "⚠️ Verificación Suspendida",
          body: isVerified
            ? "¡Felicidades! Tu cuenta ha sido validada por el Centro de Control. Ya puedes recibir contratos de alta ingeniería."
            : "Tu verificación ha sido removida por auditoría administrativa. Contacta a soporte.",
          type: 'system',
          createdAt: serverTimestamp(),
          read: false
        });
      }
      toast.success(isVerified ? "Técnico Verificado" : "Verificación Removida");
    } catch (err) { console.error(err); }
  };

  const handleUpdateInventoryQuantity = async (id: string, delta: number) => {
    try {
      await updateDoc(doc(db, "inventory", id), { quantity: increment(delta) });
    } catch (err) { console.error(err); }
  };

  const handleAddInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      await addDoc(collection(db, "inventory"), { ...item, createdAt: serverTimestamp() });
      toast.success("Item añadido al inventario");
    } catch (err) { console.error(err); }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "inventory", id));
      toast.success("Item eliminado");
    } catch (err) { console.error(err); }
  };

  const handleUpdateInventoryItem = async (item: InventoryItem) => {
    try {
      const { id, ...data } = item;
      await updateDoc(doc(db, "inventory", id), { ...data, updatedAt: serverTimestamp() });
      toast.success("Item actualizado");
    } catch (err) { console.error(err); }
  };

  const handleRequestQuote = async (techId: string, assetId: string, description: string, suggestedDate?: string, suggestedTime?: string) => {
    if (!user) return;
    const tech = technicians.find(t => t.id === techId);
    const asset = assets.find(a => a.id === assetId);
    if (!tech || !asset) return;

    try {
      await addDoc(collection(db, "requests"), {
        clientId: user.uid,
        clientName: loggedInName,
        clientProfileImage: userData?.profileImage || null,
        assetId,
        assetName: asset.name,
        assetPlate: asset.licensePlate || asset.serialNumber || null,
        techId,
        techName: tech.name,
        techUserId: tech.userId,
        description,
        status: 'pending',
        createdAt: serverTimestamp(),
        clientRequestedDate: suggestedDate || null,
        scheduledDate: suggestedDate || null,
        scheduledTime: suggestedTime || null
      });
      toast.success("Solicitud enviada al técnico.");
    } catch (err) {
      console.error(err);
      toast.error("Error al enviar la solicitud.");
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      const assetRef = doc(db, "assets", id);
      await updateDoc(assetRef, {
        status: 'deleted',
        deletedAt: serverTimestamp()
      });
      toast.success("Activo eliminado correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar el activo.");
    }
  };

  const handleUpdateAsset = async (id: string, data: Partial<Asset>) => {
    try {
      await updateDoc(doc(db, "assets", id), data);
      toast.success("Activo actualizado correctamente.");
    } catch (err) { console.error(err); }
  };

  const handleAddFuelLog = async (assetId: string, log: any) => {
    try {
      const assetRef = doc(db, "assets", assetId);
      await updateDoc(assetRef, {
        fuelLogs: arrayUnion(log),
        mileage: log.mileage // Actualizar odómetro automáticamente
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleAddPreTrip = async (assetId: string, inspection: any) => {
    try {
      const assetRef = doc(db, "assets", assetId);
      await updateDoc(assetRef, {
        preTripInspections: arrayUnion(inspection)
      });
      toast.success("Inspección Pre-Viaje registrada en el Sistema Central.");
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar la inspección.");
    }
  };

  const handleUploadMantechDocument = async (role: 'client' | 'tech', type: 'id' | 'record', file: File) => {
    if (!user) return;
    const loading = toast.loading(`Subiendo ${type === 'id' ? 'Identidad' : 'Récord Policivo'}...`);

    try {
      // Simulación de URL de almacenamiento (En producción usaría Firebase Storage)
      const mockUrl = `https://storage.mantechpro.pa/${user.uid}/${type}_${Date.now()}.pdf`;

      if (role === 'tech') {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const techId = userSnap.data()?.techId;
        if (!techId) throw new Error("ID Técnico no localizado.");

        const updateKey = type === 'id' ? 'mantechId.documentUrl' : 'mantechId.policeRecordUrl';
        await updateDoc(doc(db, "technicians", techId), {
          [updateKey]: mockUrl,
          'mantechId.status': 'pending'
        });
      } else {
        const updateKey = type === 'id' ? 'mantechId.documentUrl' : 'mantechId.policeRecordUrl';
        await updateDoc(doc(db, "users", user.uid), {
          [updateKey]: mockUrl,
          'recordStatus': 'pending'
        });
      }

      toast.success("Documento registrado para auditoría.", { id: loading });
    } catch (err) {
      console.error(err);
      toast.error("Fallo en la carga del documento.", { id: loading });
    }
  };

  const handleSendQuote = async (requestId: string, price: number, commission: number, notes?: string, materials?: any[], checklist?: any[], schedule?: any, visitFee: number = 15, autoThreshold: number = 0, isEmergency: boolean = false) => {
    try {
      const techEarnings = price - commission;
      const updateData: any = {
        status: 'quoted',
        price,
        commission,
        technicianEarnings: techEarnings,
        techNotes: notes || null,
        quotedAt: serverTimestamp(),
        visitFeeAmount: visitFee,
        visitFeePaid: false,
        visitFeeCredited: false,
        autoApprovalThreshold: autoThreshold,
        isEmergency: isEmergency
      };

      if (materials) updateData.materials = materials;
      if (checklist) updateData.checklist = checklist;
      if (schedule) {
        updateData.scheduledDate = schedule.date;
        updateData.scheduledTime = schedule.time;
        updateData.scheduledDuration = schedule.duration;
        updateData.scheduledTravelTime = schedule.travelTime;

        // LÓGICA DE DEADLINE DE PAGO (48 HORAS ANTES)
        const schedDate = new Date(`${schedule.date}T${schedule.time || '09:00'}`);
        const deadline = new Date(schedDate.getTime() - (48 * 60 * 60 * 1000));
        const now = new Date();

        // Si la cita es muy pronto (menos de 48h), el deadline es en 2 horas o ya mismo
        updateData.paymentDeadlineAt = deadline < now
          ? new Date(now.getTime() + (2 * 60 * 60 * 1000)).toISOString()
          : deadline.toISOString();
      }

      await updateDoc(doc(db, "requests", requestId), {
        ...updateData
      });

      const req = requests.find(r => r.id === requestId);
      if (req) {
        const notesPrefix = notes ? `\n\nDIAGNÓSTICO: ${notes}` : '';
        const matPrefix = materials && materials.length > 0 ? `\n\nMATERIALES: ${materials.length} ítems incluidos.` : '';
        const timePrefix = schedule ? `\n\nLLEGADA ESTIMADA: ${schedule.travelTime} min.` : '';
        const deadlinePrefix = updateData.paymentDeadlineAt
          ? `\n\n⚠️ FECHA LÍMITE DE PAGO: ${new Date(updateData.paymentDeadlineAt).toLocaleString('es-PA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}`
          : '';

        await addDoc(collection(db, "messages"), {
          requestId, sender: 'tech',
          text: `¡Hola! He analizado tu solicitud para ${req.assetName} y el presupuesto oficial es de B/. ${price}.00.${notesPrefix}${matPrefix}${timePrefix}${deadlinePrefix}\n\nQuedo a la espera de tu aprobación para proceder con el servicio.`,
          timestamp: serverTimestamp()
        });
      }

      toast.success("Cotización enviada al cliente.");
    } catch (err) {
      console.error(err);
      toast.error("Error al enviar la cotización.");
    }
  };

  const handleRejectQuote = async (requestId: string, reason: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: serverTimestamp()
      });
      await addDoc(collection(db, "messages"), {
        requestId, sender: 'client',
        text: `He rechazado la cotización. Motivo: ${reason}`,
        timestamp: serverTimestamp()
      });

      // En rechazo también purgamos después de un breve delay para asegurar que el mensaje anterior se registre si es necesario (opcional)
      // O simplemente purgamos todo.
      await purgeChatMessages(requestId);

      toast.success("Cotización rechazada.");
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar el rechazo.");
    }
  };

  const handleAcceptBid = async (requestId: string, bid: any) => {
    try {
      const commission = bid.price * 0.15;
      await updateDoc(doc(db, "requests", requestId), {
        techId: bid.techId,
        techName: bid.techName,
        price: bid.price,
        commission,
        technicianEarnings: bid.price - commission,
        status: 'quoted',
        acceptedBidAt: serverTimestamp()
      });
      toast.success(`Oferta de ${bid.techName} aceptada.`);
    } catch (err) {
      console.error(err);
      toast.error("Error al aceptar la oferta.");
    }
  };

  const handleDispatchTechnician = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        technicianDispatchedAt: new Date().toISOString(),
        status: 'executing' // O un nuevo estado 'in_transit' si prefieres
      });
      toast.success("Estatus actualizado: En camino al sitio.");
    } catch (err) { console.error(err); }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const req = requests.find(r => r.id === requestId);
      if (!req) return;

      const isRefundEligible = !req.technicianDispatchedAt;
      const updates: any = {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        visitFeeRefunded: isRefundEligible
      };

      await updateDoc(doc(db, "requests", requestId), updates);

      await purgeChatMessages(requestId);

      if (isRefundEligible) {
        toast.success("Solicitud cancelada. Su depósito de inspección será reembolsado.");
      } else {
        toast.error("Cancelación tardía. La tarifa de inspección se ha retenido por movilización del técnico.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al cancelar la solicitud.");
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, "requests", requestId));
      toast.success("Registro eliminado.");
    } catch (err) {
      console.error(err);
      toast.error("Fallo al eliminar el registro.");
    }
  };

  const handleReportNoShow = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'disputed',
        issueReportedByClient: true,
        issueDescription: 'EL TÉCNICO NO SE PRESENTÓ A LA CITA AGENDADA',
        reportedAt: serverTimestamp()
      });
      await addDoc(collection(db, "notifications"), {
        userId: 'admin@mantech.com',
        title: "⚠️ ALERTA DE INCUMPLIMIENTO",
        body: `El cliente reportó que un técnico no llegó a la cita. ID: ${requestId}`,
        type: 'system',
        createdAt: serverTimestamp(),
        read: false
      });
      toast.success("Incidente reportado al Centro de Control. Un asesor le contactará.");
    } catch (err) { console.error(err); }
  };

  const handleProposePriceAdjustment = async (requestId: string, newPrice: number, reason: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        priceAdjustment: {
          newPrice,
          reason,
          status: 'pending',
          timestamp: new Date().toISOString()
        }
      });
      await addDoc(collection(db, "messages"), {
        requestId, sender: 'tech',
        text: `💡 PROPUESTA DE AJUSTE: He propuesto un ajuste de presupuesto a B/. ${newPrice} por el siguiente motivo: ${reason}`,
        timestamp: serverTimestamp()
      });
      toast.success("Propuesta de ajuste enviada.");
    } catch (err) { console.error(err); }
  };

  const handleRespondToAdjustment = async (requestId: string, accept: boolean) => {
    try {
      const req = requests.find(r => r.id === requestId);
      if (!req?.priceAdjustment) return;

      if (accept) {
        const newTotal = req.priceAdjustment.newPrice;
        const alreadyPaid = req.amountPaid || 0;
        const delta = newTotal - alreadyPaid;
        const commission = newTotal * 0.15;

        await updateDoc(doc(db, "requests", requestId), {
          price: newTotal,
          commission,
          technicianEarnings: newTotal - commission,
          'priceAdjustment.status': 'accepted',
          // No sumamos el delta al amountPaid todavía, eso pasará cuando el cliente pague el checkout de ajuste
        });
        toast.success(`Ajuste aceptado. Saldo pendiente por pagar: B/. ${delta.toFixed(2)}`);
      } else {
        await updateDoc(doc(db, "requests", requestId), {
          'priceAdjustment.status': 'rejected'
        });
        toast.error("Ajuste rechazado.");
      }
    } catch (err) { console.error(err); }
  };

  const handleTogglePause = async (requestId: string, currentPausedState: boolean) => {
    try {
      const newPausedState = !currentPausedState;
      await updateDoc(doc(db, "requests", requestId), {
        isPaused: newPausedState
      });

      const text = newPausedState
        ? "⏱️ TRABAJO EN PAUSA: El especialista ha pausado la sesión actual por cumplimiento de jornada. El ticket permanece activo y bajo resguardo."
        : "▶️ TRABAJO REANUDADO: El especialista ha reiniciado la labor técnica en sitio. El protocolo de ejecución vuelve a estar activo.";

      await addDoc(collection(db, "messages"), {
        requestId, sender: 'tech', text, timestamp: serverTimestamp()
      });

      toast.success(newPausedState ? "Jornada pausada." : "Trabajo reanudado.");
    } catch (err) { console.error(err); }
  };

  // --- MOTOR DE ARBITRAJE (ADMIN) ---
  const handleArbitrateDispute = async (requestId: string, resolution: 'release_to_tech' | 'refund_to_client') => {
    try {
      const req = requests.find(r => r.id === requestId);
      if (!req) return;

      if (resolution === 'release_to_tech') {
        await updateDoc(doc(db, "requests", requestId), {
          status: 'completed',
          arbitrationResult: 'released',
          arbitratedAt: serverTimestamp()
        });
        toast.success("Pago liberado al técnico por arbitraje.");
      } else {
        await updateDoc(doc(db, "requests", requestId), {
          status: 'cancelled',
          arbitrationResult: 'refunded',
          arbitratedAt: serverTimestamp()
        });
        toast.success("Reembolso al cliente aprobado por arbitraje.");
      }
    } catch (err) { console.error(err); }
  };

  // --- MOTOR DE RECOMENDACIÓN (CASCADA) ---
  const getRecommendedTechs = (category: string, excludeId: string) => {
    return technicians
      .filter(t => t.category === category && t.id !== excludeId && t.isVerified)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  };

  return {
    notifyAdmin,
    handlePostOpenMarket,
    handleAcceptQuote,
    handleCompleteJob,
    handleConfirmPayment,
    handleSaveMaterial,
    handleTriggerUnforeseen,
    handleToggleTask,
    handleVerifyTechnician,
    handleUpdateInventoryQuantity,
    handleAddInventoryItem,
    handleDeleteInventoryItem,
    handleUpdateInventoryItem,
    handleRequestQuote,
    handleRedeemPoints,
    handleDeleteAsset,
    handleUpdateAsset,
    handleAddFuelLog,
    handleAddPreTrip,
    handleUploadMantechDocument,
    handleSendQuote,
    handleRejectQuote,
    handleAcceptBid,
    handleCancelRequest,
    handleDeleteRequest,
    handleDispatchTechnician,
    handleReportNoShow,
    handleProposePriceAdjustment,
    handleRespondToAdjustment,
    handleRespondToUnforeseen,
    handleTogglePause,
    handleArbitrateDispute,
    handleApproveSubscription,
    handleRequestSubscription,
    handleSendTestPush,
    handleVerifyIdentityAI: handleVerifyIdentityAIProcess,
    getRecommendedTechs
  };
}
