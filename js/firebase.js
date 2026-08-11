// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB1V67e8PXggpJ9-YDWjr7uQXZ1ltQVI9M",
  authDomain: "distribuidora-piselli.firebaseapp.com",
  projectId: "distribuidora-piselli",
  storageBucket: "distribuidora-piselli.firebasestorage.app",
  messagingSenderId: "966844821885",
  appId: "1:966844821885:web:a0e0c5698704928cc81c14"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
