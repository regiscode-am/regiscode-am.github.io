import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Config: regis-8646e
const firebaseConfig = {
  apiKey: "AIzaSyDKiCznhQlcpsnUaEuVLD2MZDoZMu8A8Tk",
  authDomain: "regis-8646e.firebaseapp.com",
  projectId: "regis-8646e",
  storageBucket: "regis-8646e.firebasestorage.app",
  messagingSenderId: "303636628077",
  appId: "1:303636628077:web:3bc762df5a32daba487564",
  measurementId: "G-G1TMREE5JM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const leadForm = document.getElementById('leadForm');
const successMsg = document.getElementById('successMsg');

if (leadForm) {
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectedSiteType = document.querySelector('input[name="siteType"]:checked');
    const siteType = selectedSiteType ? selectedSiteType.value : 'Նշված չէ';
    
    const industry = document.getElementById('industry')?.value || '';
    const audience = document.getElementById('audience')?.value || '';
    const clientName = document.getElementById('clientName')?.value || '';
    const clientPhone = document.getElementById('clientPhone')?.value || '';

    try {
      await addDoc(collection(db, "leads"), {
        siteType,
        industry,
        audience,
        clientName,
        clientPhone,
        createdAt: serverTimestamp()
      });

      leadForm.classList.add('hidden');
      if (successMsg) {
        successMsg.classList.remove('hidden');
      }
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Խնդիր առաջացավ հայտն ուղարկելիս:");
    }
  });
}
