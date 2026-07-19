import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { Asset } from '../types';

const ASSETS_COLLECTION = 'assets';

export const AssetService = {
  // Suscribirse a activos activos (No borrados)
  subscribeToAssets: (userId: string, callback: (assets: Asset[]) => void) => {
    const q = query(
      collection(db, ASSETS_COLLECTION),
      where('clientId', '==', userId),
      where('status', '!=', 'deleted')
    );

    return onSnapshot(q, (snapshot) => {
      const assets = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Asset));
      callback(assets);
    });
  },

  // Registro con timestamps
  createAsset: async (data: Partial<Asset>) => {
    return await addDoc(collection(db, ASSETS_COLLECTION), {
      ...data,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  // Actualización
  updateAsset: async (id: string, data: Partial<Asset>) => {
    const assetRef = doc(db, ASSETS_COLLECTION, id);
    return await updateDoc(assetRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  // SOFT DELETE (Estándar Profesional)
  softDeleteAsset: async (id: string) => {
    const assetRef = doc(db, ASSETS_COLLECTION, id);
    return await updateDoc(assetRef, {
      status: 'deleted',
      deletedAt: serverTimestamp()
    });
  }
};
