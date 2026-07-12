import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { user, isInitialized, deviceStatus, isAdmin } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    // Check if the user is inside the (auth) group
    const inAuthGroup = segments[0] === '(auth)';

    if (!user) {
      // If user is logged out, ensure they are on login or register screen
      if (segments[1] !== 'login' && segments[1] !== 'register') {
        setTimeout(() => router.replace('/(auth)/login'), 0);
      }
    } else {
      // Admins bypass device verification
      if (deviceStatus === 'APPROVED' || isAdmin) {
        if (inAuthGroup) {
          setTimeout(() => router.replace('/(tabs)'), 0);
        }
      } else {
        const seg = segments as string[];
        if (seg[1] !== 'device-verification') {
          setTimeout(() => router.replace('/(auth)/device-verification'), 0);
        }
      }
    }
  }, [user, segments, isInitialized, deviceStatus, isAdmin]);
}

