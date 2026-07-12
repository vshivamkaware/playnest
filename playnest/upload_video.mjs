import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
 use own api
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function uploadRealVideo() {
  try {
    console.log("=== STEP 1: Admin Login ===");
    const userCredential = await signInWithEmailAndPassword(auth, "admin@sv.in", "Admin@123");
    console.log("Login OK! UID:", userCredential.user.uid);
    
    console.log("\n=== STEP 2: Adding Real Video ===");
    const newVideo = {
      title: "Sample Drive Video",
      description: "This video was uploaded using the script to verify the end-to-end functionality.",
      thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
      driveLink: "https://drive.google.com/file/d/1UaESQXXgqI2l2YrGUA1pW081zm891MMU/view?usp=drive_link",
      category: "Demo",
      isPremium: false,
      price: 0,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'videos'), newVideo);
    console.log("Success! Uploaded real video to database with ID:", docRef.id);

  } catch (error) {
    console.error("\n!!! VERIFICATION FAILED !!!");
    console.error(error.message);
  } finally {
    process.exit(0);
  }
}

uploadRealVideo();
