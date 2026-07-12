import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../services/firebase/config';
import { useAuthStore } from '../../store/useAuthStore';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { doc, onSnapshot } from 'firebase/firestore';
import { getOrCreateDeviceId } from '../../utils/device';

/**
 * AuthProvider handles Firebase auth state, Firestore user data sync,
 * and route protection via useProtectedRoute().
 * 
 * NOTE: useProtectedRoute() is safe to call here because Expo Router
 * provides the NavigationContainer ABOVE the root _layout.tsx,
 * so useRouter() and useSegments() have valid navigation context.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAdmin, setInitialized, setDeviceStatus } = useAuthStore();

  useProtectedRoute();

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Clean up previous snapshot listener
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        setUser(user);
        
        // Listen to user document changes to reflect deviceStatus in real-time
        unsubscribeSnapshot = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // If the user is banned, sign them out immediately
            if (data.isBanned) {
              auth.signOut();
              return;
            }

            // Check admin status: strictly from DB flag or role
            const isAdminUser = data.isAdmin === true || data.role === 'admin';
            setAdmin(isAdminUser);
            
            const currentDeviceId = await getOrCreateDeviceId();
            if (data.deviceId === currentDeviceId) {
              setDeviceStatus(data.deviceStatus || 'APPROVED');
            } else {
              setDeviceStatus('UNBOUND');
            }
          } else {
            // Document doesn't exist yet. 
            // Auto-bootstrap the admin document if the user is the system admin
            const isFallbackAdmin = user.email?.toLowerCase() === 'admin@sv.in';
            
            if (isFallbackAdmin) {
              const { setDoc, serverTimestamp } = require('firebase/firestore');
              const deviceId = await getOrCreateDeviceId();
              
              setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                createdAt: serverTimestamp(),
                deviceId: deviceId,
                deviceStatus: 'APPROVED',
                isAdmin: true
              }).catch((e: any) => console.error("Failed to bootstrap admin", e));
            }
            
            setAdmin(isFallbackAdmin);
            setDeviceStatus(isFallbackAdmin ? 'APPROVED' : 'UNBOUND');
          }
          setInitialized(true);
        }, (error) => {
          console.error("Error fetching user data:", error);
          setAdmin(false);
          setDeviceStatus('UNBOUND');
          setInitialized(true);
        });

      } else {
        setUser(null);
        setAdmin(false);
        setDeviceStatus('UNBOUND');
        setInitialized(true);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  return <>{children}</>;
}
