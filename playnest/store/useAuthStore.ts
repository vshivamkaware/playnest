import { create } from 'zustand';
import { User } from 'firebase/auth';

type DeviceStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'UNBOUND';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isInitialized: boolean;
  deviceStatus: DeviceStatus;
  setUser: (user: User | null) => void;
  setAdmin: (isAdmin: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  setDeviceStatus: (status: DeviceStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  isInitialized: false,
  deviceStatus: 'UNBOUND',
  setUser: (user) => set({ user }),
  setAdmin: (isAdmin) => set({ isAdmin }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setDeviceStatus: (status) => set({ deviceStatus: status }),
}));

