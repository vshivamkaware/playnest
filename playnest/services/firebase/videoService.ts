import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp, getDoc, where } from 'firebase/firestore';
import { db } from './config';
import { Video } from '../../types';

const VIDEOS_COLLECTION = 'videos';

export const videoService = {
  async addVideo(videoData: Omit<Video, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, VIDEOS_COLLECTION), {
      ...videoData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getVideos(): Promise<Video[]> {
    // Standard users only see videos that are NOT hidden
    const q = query(
      collection(db, VIDEOS_COLLECTION),
      where('isHidden', '==', false),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Video[];
  },

  async getAdminVideos(): Promise<Video[]> {
    // Admins see everything
    const q = query(collection(db, VIDEOS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Video[];
  },

  async updateVideo(id: string, updates: Partial<Video>) {
    const docRef = doc(db, VIDEOS_COLLECTION, id);
    await updateDoc(docRef, updates);
  },

  async deleteVideo(id: string) {
    const docRef = doc(db, VIDEOS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  async getVideo(id: string): Promise<Video | null> {
    const docRef = doc(db, VIDEOS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Video;
    }
    return null;
  }
};
