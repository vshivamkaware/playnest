import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './config';
import { User } from '../../types';

const USERS_COLLECTION = 'users';

export const userService = {
  async getUser(uid: string): Promise<User | null> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  },

  async unlockVideoForUser(uid: string, videoId: string) {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, {
      unlockedVideos: arrayUnion(videoId)
    });
  },

  async hasUnlockedVideo(uid: string, videoId: string): Promise<boolean> {
    const user = await this.getUser(uid);
    if (!user) return false;
    return user.unlockedVideos?.includes(videoId) || false;
  }
};
