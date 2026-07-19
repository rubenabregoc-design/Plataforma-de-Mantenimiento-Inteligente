import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type AuditAction = 'CREATE_ASSET' | 'UPDATE_ASSET' | 'DELETE_ASSET' | 'UPDATE_PRICE' | 'LOGIN' | 'SIGNATURE_CLOSE';

export const logActivity = async (userId: string, userName: string, action: AuditAction, details: string, metadata?: any) => {
  try {
    // Firestore does not accept 'undefined'. We must sanitize the data.
    const cleanLog = JSON.parse(JSON.stringify({
      userId: userId || 'anonymous',
      userName: userName || 'Unknown',
      action,
      details,
      metadata: metadata || {},
      timestamp: new Date().toISOString(), // Use ISO string if serverTimestamp fails in some contexts or for immediate local sorting
      platform: 'web'
    }));

    await addDoc(collection(db, 'audit_logs'), {
      ...cleanLog,
      timestamp: serverTimestamp() // Overwrite with official server timestamp
    });
  } catch (error) {
    console.error('Error recording audit log:', error);
  }
};
