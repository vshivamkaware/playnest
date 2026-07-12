import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  deviceId: string;
  deviceStatus: 'APPROVED' | 'BLOCKED';
  isAdmin: boolean;
  createdAt: Timestamp;
  unlockedVideos?: string[]; // Array of video IDs the user has purchased
}

export interface Video {
  id?: string;
  title: string;
  description: string;
  driveLink: string;
  thumbnailUrl: string;
  category: string;
  isPremium: boolean;
  price: number; // 0 if free
  isHidden?: boolean;
  createdAt?: Timestamp;
}

export interface Category {
  id?: string;
  name: string;
  order: number;
}
