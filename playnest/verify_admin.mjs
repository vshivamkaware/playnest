import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc, query, where, orderBy, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0-CxoKa9e8o2nEdD5dfWlPSx7xIimHE4",
  authDomain: "playnest-mvp-2026.firebaseapp.com",
  projectId: "playnest-mvp-2026",
  storageBucket: "playnest-mvp-2026.firebasestorage.app",
  messagingSenderId: "947451001451",
  appId: "1:947451001451:web:ec6891132a1d5b846b8f2e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function verifyAddVideo() {
  let docId = null;
  try {
    console.log("=== STEP 1: Admin Login ===");
    const userCredential = await signInWithEmailAndPassword(auth, "admin@sv.in", "Admin@123");
    console.log("Login OK! UID:", userCredential.user.uid);
    
    console.log("\n=== STEP 2: Adding Dummy Video ===");
    const newVideo = {
      title: "Test Dummy Video",
      description: "This is a test video added by the verification script.",
      thumbnailUrl: "https://example.com/thumbnail.jpg",
      driveLink: "https://drive.google.com/file/d/test12345/view",
      category: "Test",
      isPremium: false,
      price: 0,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'videos'), newVideo);
    docId = docRef.id;
    console.log("Success! Added dummy video with ID:", docId);

    console.log("\n=== STEP 3: Fetching Videos ===");
    const vidQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const vidSnap = await getDocs(vidQuery);
    console.log(`Success! Fetched ${vidSnap.size} videos.`);
    vidSnap.forEach(v => {
      console.log(`- [${v.id}] ${v.data().title}`);
    });

    console.log("\nVERIFICATION COMPLETE: WRITE ACCESS SUCCEEDED.");
    
  } catch (error) {
    console.error("\n!!! VERIFICATION FAILED !!!");
    console.error(error.message);
  } finally {
    if (docId) {
      console.log(`\nCleaning up... Deleting test video ${docId}`);
      await deleteDoc(doc(db, 'videos', docId));
      console.log("Cleanup complete.");
    }
    process.exit(0);
  }
}

verifyAddVideo();
