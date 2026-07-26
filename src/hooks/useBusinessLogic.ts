import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc, getDocs, query, where, arrayUnion, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { Asset, TechProfile, JobRequest } from "../types";
import axios from 'axios';

export function useBusinessLogic() {
  const { user, loggedInName, userData, subscription, updateUserSubscription } = useAuth();
  const { assets, requests, technicians } = useData();

  const notifyAdmin = async (title: string, body: string) => {
    try {
      await axios.post('http://localhost:3000/api/push-notification', {
        title,
        body,
        token: 'ADMIN_TOKEN_MASTER'
      });
    } catch (err) { console.error("Notification failed", err); }
  };

  const handlePostOpenMarket = async (assetId: string, description: string) => {
    if (!user) return;
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    try {
      await addDoc(collection(db, "requests"), {
        clientId: user.uid, clientName: loggedInName, assetId, assetName: asset.name,
        techId: 'open_market', techName: 'Subasta Abierta',
        description, status: 'open_bidding', createdAt: serverTimestamp(),
        isPublic: true, bids: []
      });
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
        notifyAdmin("💳 PAGO PENDIENTE", `El cliente ${req.clientName} envió un pago de $${req.price} vía YAPPY.`);
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

          await updateDoc(doc(db, "technicians", tech.id), {
            completedJobs: (tech.completedJobs || 0) + 1,
            reviewCount: tech.reviewCount + 1,
            rating: Number(nRating.toFixed(1)),
            'wallet.balance': newBalance,
            'wallet.transactions': updatedTransactions
          });
        }
      }
      toast.success("¡Servicio finalizado exitosamente!");
    } catch (err) { console.error(err); }
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

  return {
    notifyAdmin,
    handlePostOpenMarket,
    handleAcceptQuote,
    handleCompleteJob,
    handleConfirmPayment,
    handleApproveSubscription
  };
}
