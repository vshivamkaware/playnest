import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, addDoc } from "firebase/firestore";

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

async function verifyUserRules() {
  const testEmail = `testuser_${Date.now()}@sv.in`;
  const testPassword = "TestPassword123";
  let user;

  try {
    console.log("=== STEP 1: Creating/Logging in as Standard User ===");
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    user = userCredential.user;
    console.log(`Success! Logged in as standard user. UID: ${user.uid}`);

    console.log("\n=== STEP 2: Write Own User Document ===");
    const userRef = doc(db, "users", user.uid);
    try {
      await setDoc(userRef, { email: testEmail });
      console.log("✅ Success: User can CREATE their own document.");
    } catch (e) {
      console.log("❌ FAIL: User could not create their own document:", e.message);
    }

    console.log("\n=== STEP 3: Attempt to Escalate Privileges (Create) ===");
    try {
      const userRef2 = doc(db, "users", user.uid + "_2");
      await setDoc(userRef2, { email: testEmail, isAdmin: true });
      console.log("❌ FAIL: User was able to create document for other UID!");
    } catch (e) {
      console.log("✅ Success: Prevented creating doc for other UID (Expected Error).");
    }

    try {
      // Try replacing own doc with isAdmin=true using setDoc
      await setDoc(userRef, { email: testEmail, isAdmin: true });
      console.log("❌ FAIL: User was able to set isAdmin=true during create/overwrite!");
    } catch (e) {
      console.log("✅ Success: Privilege escalation prevented during create (Expected Error).");
    }

    console.log("\n=== STEP 4: Attempt to Escalate Privileges (Update) ===");
    try {
      await updateDoc(userRef, { role: 'admin' });
      console.log("❌ FAIL: User was able to set role='admin' during update!");
    } catch (e) {
      console.log("✅ Success: Privilege escalation prevented during update (Expected Error).");
    }

    console.log("\n=== STEP 5: Attempt to Update Own Valid Field ===");
    try {
      await updateDoc(userRef, { newField: "test" });
      console.log("✅ Success: User can update their own valid fields.");
    } catch (e) {
      console.log("❌ FAIL: User could not update their own fields:", e.message);
    }

    console.log("\n=== STEP 6: Read Own User Document ===");
    try {
      const d = await getDoc(userRef);
      if (d.exists()) {
        console.log("✅ Success: User can READ their own document.");
      } else {
        console.log("❌ FAIL: Document doesn't exist?");
      }
    } catch (e) {
      console.log("❌ FAIL: User could not read their own document:", e.message);
    }

    console.log("\n=== STEP 7: Attempt to Read All Users ===");
    try {
      await getDocs(collection(db, "users"));
      console.log("❌ FAIL: User was able to read ALL users!");
    } catch (e) {
      console.log("✅ Success: Prevented reading all users (Expected Error).");
    }

    console.log("\n=== STEP 8: Attempt to Read Other User Document ===");
    try {
      // Hardcode admin UID from earlier
      await getDoc(doc(db, "users", "TRTUIlAJ16ZAhioWLOaDotIxWU62"));
      console.log("❌ FAIL: User was able to read Admin's document!");
    } catch (e) {
      console.log("✅ Success: Prevented reading other users (Expected Error).");
    }

    console.log("\n=== STEP 9: Read Videos Collection ===");
    try {
      await getDocs(collection(db, "videos"));
      console.log("✅ Success: User can READ videos.");
    } catch (e) {
      console.log("❌ FAIL: User could not read videos:", e.message);
    }

    console.log("\n=== STEP 10: Attempt to Write to Videos Collection ===");
    try {
      await addDoc(collection(db, "videos"), { title: "Hacked Video" });
      console.log("❌ FAIL: User was able to CREATE a video!");
    } catch (e) {
      console.log("✅ Success: Prevented writing to videos (Expected Error).");
    }

  } catch (error) {
    console.error("Critical test runner error:", error);
  } finally {
    if (user) {
      console.log("\nCleaning up... deleting test user auth.");
      try { await deleteUser(user); } catch(e) {}
    }
    process.exit(0);
  }
}

verifyUserRules();
