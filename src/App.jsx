import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Building2, Lock } from 'lucide-react';

const ACCESS_PIN = "933979";
const firebaseConfig = {
  apiKey: "AIzaSyD8G-1a-3DoCx1hjBHCXUDUhv29WQLMUyo",
  authDomain: "my-apartment-3497e.firebaseapp.com",
  projectId: "my-apartment-3497e",
  storageBucket: "my-apartment-3497e.firebasestorage.app",
  messagingSenderId: "564858257636",
  appId: "1:564858257636:web:356988adad40170ce72cf1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2rem] shadow-2xl text-center space-y-6 max-w-sm w-full">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center">
            <Lock className="text-white w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black italic">APARTMENT CLOUD</h2>
          <input 
            type="password" 
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-xl p-4 text-center text-2xl font-black outline-none ring-2 ring-indigo-50"
            placeholder="ENTER PIN"
          />
          <button 
            onClick={() => pinInput === ACCESS_PIN ? setIsUnlocked(true) : alert("รหัสผิด!")}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            UNLOCK SYSTEM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <Building2 className="w-20 h-20 text-indigo-600 mb-4" />
      <h1 className="text-3xl font-black text-slate-800 italic">SYSTEM ONLINE!</h1>
      <p className="text-slate-500 font-bold mt-2">ยินดีด้วยครับ ระบบของคุณติดตั้งสำเร็จแล้ว</p>
    </div>
  );
}
