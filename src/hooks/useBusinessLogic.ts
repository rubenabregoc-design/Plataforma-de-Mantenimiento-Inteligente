import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc, getDocs, query, where, arrayUnion, deleteDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { Asset, TechProfile, JobRequest, InventoryItem } from "../types";
import axios from 'axios';

export function useBusinessLogic() {
  const { user, loggedInName, userData, subscription, updateUserSubscription } = useAuth();
  const { assets, requests, technicians } = useData();

  const notifyAdmin = async (title: string, body: string) => {
    try {
      // 1. Notificación en Tiempo Real (Push)
      await axios.post('http://localhost:3000/api/push-notification', {
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
      if (method === 'yappy') {
        await updateDoc(doc(db, "requests", requestId), { status: 'pending_verification', paidAt: serverTimestamp(), paymentMethod: method });
        await addDoc(collection(db, "messages"), { requestId, sender: 'client', text: `He realizado el pago vía YAPPY por $${req.price}. Quedo a la espera de la verificación oficial.`, timestamp: serverTimestamp() });

        await notifyAdmin("💳 PAGO PENDIENTE", `El cliente ${req.clientName} envió un pago de $${req.price} vía YAPPY.`);
        toast.success("Pago enviado. Verificación en curso.");
      } else {
        await updateDoc(doc(db, "requests", requestId), { status: 'accepted', paidAt: serverTimestamp(), paymentMethod: method });
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
          title: "✅ Pago Confirmado",
          body: `El cliente ha pagado el servicio de ${req.assetName}. Tienes una nueva cita agendada.`,
          type: 'billing',
          createdAt: serverTimestamp(),
          read: false
        });

        await addDoc(collection(db, "messages"), { requestId, sender: 'tech', text: `¡Hola! Recibí tu confirmación vía ${method.toUpperCase()}. Cita confirmada.`, timestamp: serverTimestamp() });
        toast.success("¡Cita confirmada!");
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

  const handleApproveSubscription = async (userId: string, planId: string) => {
    try {
      const nextBilling = new Date();
      nextBilling.setDate(nextBilling.getDate() + 30);
      const newSub = { planId, status: 'active', startDate: new Date().toISOString(), nextBillingDate: nextBilling.toISOString() };
      await updateDoc(doc(db, "users", userId), { subscription: newSub });
      const userSnap = await getDoc(doc(db, "users", userId));
      if (userSnap.exists() && userSnap.data().role === 'tech') {
        const techId = userSnap.data().techId || `tech-${userId}`;
        await updateDoc(doc(db, "technicians", techId), { plan: planId.split('-')[1] });
      }
      toast.success("Suscripción aprobada.");
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
      await updateDoc(doc(db, "requests", requestId), {
        status: 'disputed',
        unforeseenReason: reason,
        unforeseenAmount: extraCost,
        unforeseenCategory: category,
        unforeseenAt: serverTimestamp()
      });
      await addDoc(collection(db, "messages"), {
        requestId, sender: 'tech',
        text: `🚨 IMPREVISTO [${category.toUpperCase()}]: ${reason}. Costo: $${extraCost}.`,
        timestamp: serverTimestamp()
      });
      toast.success("Imprevisto reportado.");
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
            ? "¡Felicidades! Tu cuenta ha sido validada por el Nodo Central. Ya puedes recibir contratos de alta ingeniería."
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
    if (!window.confirm("¿Estás seguro de eliminar este activo? Esta acción no se puede deshacer de forma sencilla.")) return;
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
      toast.success("Inspección Pre-Viaje registrada en el Nodo Central.");
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

  const handleSendQuote = async (requestId: string, price: number, commission: number, notes?: string, materials?: any[], checklist?: any[], schedule?: any) => {
    try {
      const techEarnings = price - commission;
      const updateData: any = {
        status: 'quoted',
        price,
        commission,
        technicianEarnings: techEarnings,
        techNotes: notes || null,
        quotedAt: serverTimestamp()
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

  const handleCancelRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp()
      });
      toast.success("Solicitud cancelada.");
    } catch (err) {
      console.error(err);
      toast.error("Error al cancelar la solicitud.");
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
      toast.success("Incidente reportado al Nodo Central. Un asesor le contactará.");
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
        const commission = req.priceAdjustment.newPrice * 0.15;
        await updateDoc(doc(db, "requests", requestId), {
          price: req.priceAdjustment.newPrice,
          commission,
          technicianEarnings: req.priceAdjustment.newPrice - commission,
          'priceAdjustment.status': 'accepted'
        });
        toast.success("Presupuesto actualizado.");
      } else {
        await updateDoc(doc(db, "requests", requestId), {
          'priceAdjustment.status': 'rejected'
        });
        toast.error("Ajuste rechazado.");
      }
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
    handleApproveSubscription,
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
    handleReportNoShow,
    handleProposePriceAdjustment,
    handleRespondToAdjustment,
    handleArbitrateDispute,
    getRecommendedTechs
  };
}
