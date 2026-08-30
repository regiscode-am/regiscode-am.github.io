import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Config
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
const auth = getAuth(app);

// DOM Elements
const loginSection = document.getElementById('loginSection');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const leadsTableBody = document.getElementById('leadsTableBody');

let allLeads = [];
let currentFilter = 'all';
let unsubscribeFirestore = null;

// Auth State Listener (Ստուգում է՝ մուտք եղած է, թե չէ)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Մուտքը հաջողված է
    loginSection.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    loadLeads();
  } else {
    // Մուտք եղած չէ
    loginSection.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
    if (unsubscribeFirestore) unsubscribeFirestore();
  }
});

// Login Form Submit
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      loginError.textContent = "Սխալ էլ-փոստ կամ գաղտնաբառ:";
      loginError.classList.remove('hidden');
    }
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    signOut(auth);
  });
}

// Load Firestore Data
function loadLeads() {
  const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
  unsubscribeFirestore = onSnapshot(q, (snapshot) => {
    allLeads = [];
    snapshot.forEach((docSnap) => {
      allLeads.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderLeads();
  });
}

// Render Table
function renderLeads() {
  if (!leadsTableBody) return;
  leadsTableBody.innerHTML = '';

  const filtered = allLeads.filter(lead => {
    if (currentFilter === 'all') return true;
    return (lead.status || 'Ուսումնասիրում') === currentFilter;
  });

  filtered.forEach((data) => {
    const rawPhone = data.clientPhone || '';
    const phoneClean = rawPhone.replace(/[^0-9]/g, '');
    const status = data.status || 'Ուսումնասիրում';

    const row = document.createElement('tr');
    row.className = "hover:bg-slate-800/50 transition border-b border-slate-800/50";
    row.innerHTML = `
      <td class="p-4 font-semibold text-white">${data.clientName || 'Անուն չկա'}</td>
      <td class="p-4">${data.clientPhone || '—'}</td>
      <td class="p-4"><span class="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${data.siteType || '—'}</span></td>
      <td class="p-4">${data.industry || '—'}</td>
      <td class="p-4">${data.audience || '—'}</td>
      <td class="p-4">
        <select data-id="${data.id}" class="status-select bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer">
          <option value="Ուսումնասիրում" ${status === 'Ուսումնասիրում' ? 'selected' : ''}>🟡 Ուսումնասիրում</option>
          <option value="Կոդավորում" ${status === 'Կոդավորում' ? 'selected' : ''}>🔵 Կոդավորում</option>
          <option value="Ավարտված" ${status === 'Ավարտված' ? 'selected' : ''}>🟢 Ավարտված</option>
        </select>
      </td>
      <td class="p-4 flex gap-2">
        <a href="https://wa.me/374${phoneClean}?text=Բարև%20ձեզ,%20Regiscode-ից%20ենք%20կապնվում%20Ձեր%20հայտի%20հետ%20կապված:" target="_blank" class="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
          <i class="fa-brands fa-whatsapp"></i> WhatsApp
        </a>
        <a href="tel:${data.clientPhone}" class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
          <i class="fa-solid fa-phone"></i> Զանգել
        </a>
      </td>
    `;
    leadsTableBody.appendChild(row);
  });

  // Attach status change events
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const docId = e.target.getAttribute('data-id');
      const newStatus = e.target.value;
      try {
        await updateDoc(doc(db, "leads", docId), { status: newStatus });
      } catch (err) {
        console.error("Error updating status: ", err);
      }
    });
  });
}

// Top Filter listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-500');
      b.classList.add('bg-slate-900', 'text-slate-300', 'border-slate-800');
    });
    
    e.target.classList.remove('bg-slate-900', 'text-slate-300', 'border-slate-800');
    e.target.classList.add('bg-indigo-600', 'text-white', 'border-indigo-500');

    currentFilter = e.target.getAttribute('data-filter');
    renderLeads();
  });
});
