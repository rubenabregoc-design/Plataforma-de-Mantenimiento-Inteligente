import { useState, useEffect, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import { Asset } from '../types';

export function useGpsTracking() {
  const [trackingAssetId, setTrackingAssetId] = useState<string | null>(localStorage.getItem('mantech_tracking_id'));
  const [tripStatus, setTripStatus] = useState<'idle' | 'active' | 'paused'>((localStorage.getItem('mantech_trip_status') as any) || 'idle');
  const watchIdRef = useRef<string | null>(null);
  const lastPosRef = useRef<any>(null);

  useEffect(() => {
    if (trackingAssetId) localStorage.setItem('mantech_tracking_id', trackingAssetId);
    else localStorage.removeItem('mantech_tracking_id');
  }, [trackingAssetId]);

  useEffect(() => {
    localStorage.setItem('mantech_trip_status', tripStatus);
  }, [tripStatus]);

  const toggleGpsPause = () => {
    if (tripStatus === 'active') {
      setTripStatus('paused');
      toast("Ruta Pausada.", { icon: '⏸️' });
    } else if (tripStatus === 'paused') {
      setTripStatus('active');
      lastPosRef.current = null;
      toast.success("Ruta Reanudada.");
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current) Geolocation.clearWatch({ id: watchIdRef.current });
    setTrackingAssetId(null);
    setTripStatus('idle');
    lastPosRef.current = null;
    toast.success("Viaje Finalizado.");
  };

  return {
    trackingAssetId,
    setTrackingAssetId,
    tripStatus,
    setTripStatus,
    toggleGpsPause,
    stopTracking
  };
}
