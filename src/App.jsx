import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  deleteDoc, 
  addDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Download, 
  Printer, 
  X, 
  Edit3, 
  CheckCircle2,
  Calendar,
  Clock,
  Phone,
  Info,
  Tag,
  ClipboardList,
  Search,
  Save,
  Banknote,
  FileText,
  PieChart,
  Lock,
  Unlock,
  KeyRound
} from 'lucide-react';

// --- Configuration & Constants ---

const ACCESS_PIN = "933979"; 

const STATUS_CONFIG = {
  available: { label: 'พร้อมขาย (Available)', color: 'bg-emerald-500', text: 'text-white', light: 'bg-emerald-50', border: 'border-emerald-200', iconColor: 'text-emerald-600' },
  maintenance: { label: 'รอซ่อมบำรุง (Maintenance)', color: 'bg-orange-600', text: 'text-white', light: 'bg-orange-50', border: 'border-orange-200', iconColor: 'text-orange-600' },
  appointment: { label: 'นัดดูห้อง (Appointment)', color: 'bg-sky-400', text: 'text-white', light: 'bg-sky-50', border: 'border-sky-200', iconColor: 'text-sky-600' },
  booked: { label: 'จองแล้ว (Booked)', color: 'bg-rose-500', text: 'text-white', light: 'bg-rose-50', border: 'border-rose-200', iconColor: 'text-rose-600' },
  notice: { label: 'แจ้งออก (Notice)', color: 'bg-amber-500', text: 'text-white', light: 'bg-amber-50', border: 'border-amber-200', iconColor: 'text-amber-600' },
  occupied: { label: 'มีผู้เช่า (Occupied)', color: 'bg-blue-600', text: 'text-white', light: 'bg-blue-50', border: 'border-blue-200', iconColor: 'text-blue-600' },
};

const PROPERTIES = [
  { 
    id: 'mangmee', 
    name: 'บ้านมั่งมีทวีสุข', 
    floors: [
      { level: 6, price: "5,900", rooms: Array.from({ length: 18 }, (_, i) => `6${String(i + 1).padStart(2, '0')}`) },
      { level: 5, price: "5,900", rooms: Array.from({ length: 18 }, (_, i) => `5${String(i + 1).padStart(2, '0')}`) },
      { level: 4, price: "5,500", rooms: Array.from({ length: 18 }, (_, i) => `4${String(i + 1).padStart(2, '0')}`) },
      { level: 3, price: "5,500", rooms: Array.from({ length: 18 }, (_, i) => `3${String(i + 1).padStart(2, '0')}`) },
      { level: 2, price: "5,000", rooms: Array.from({ length: 18 }, (_, i) => `2${String(i + 1).padStart(2, '0')}`) }
    ] 
  },
  { 
    id: 'mytree', 
    name: 'บ้านมายทรี 48', 
    floors: [
      { level: 5, price: "4,500", rooms: ['501', '502', '503', '505', '506', '507', '508', '509', '510', '511', '512', '513', '514', '515'] },
      { level: 4, price: "4,500", rooms: ['401', '402', '403', '405', '406', '407', '408', '409', '410', '411', '412', '413', '414', '415'] },
      { level: 3, price: "4,500", rooms: ['301', '302', '303', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315'] },
      { level: 2, price: "4,500", rooms: ['201', '202', '203', '205', '206', '207', '208', '209', '210', '211', '212', '213', '214', '215'] },
      { level: 1, price: "4,000", rooms: Array.from({ length: 11 }, (_, i) => `1${String(i + 1).padStart(2, '0')}`) }
    ] 
  },
  { 
    id: 'khunluang', 
    name: 'บ้านคุณหลวง', 
    notes: [
      "ราคาหลากหลายตามขนาดเตียงและตำแหน่งห้อง",
      "สามารถกรอกราคาพิเศษรายห้องได้หากมีโปรโมชั่น"
    ],
    floors: [
      { 
        level: 4, 
        rooms: Array.from({ length: 6 }, (_, i) => `4/${i + 1}`),
        customPrices: {
          '4/1': '4,000', '4/2': '4,000', '4/3': '3,800',
          '4/4': '4,000', '4/5': '4,000', '4/6': '5,000'
        }
      },
      { 
        level: 3, 
        rooms: Array.from({ length: 12 }, (_, i) => `3/${i + 1}`),
        customPrices: {
          '3/1': '3,800', '3/2': '3,800', '3/3': '3,800', '3/4': '3,800', '3/5': '3,800',
          '3/6': '3,500', 
          '3/7': '3,800', '3/8': '3,800', '3/9': '3,800', '3/10': '3,800', '3/11': '3,800', '3/12': '3,800'
        }
      },
      { 
        level: 2, 
        rooms: Array.from({ length: 12 }, (_, i) => `2/${i + 1}`),
        customPrices: {
          '2/10': '3,500',
          '2/1': '3,800', '2/2': '3,800', '2/3': '3,800', '2/4': '3,800', '2/5': '3,800',
          '2/6': '3,800', '2/7': '3,800', '2/8': '3,800', '2/9': '3,800', '2/11': '3,800', '2/12': '3,800'
        }
      },
      { 
        level: 1, 
        rooms: Array.from({ length: 18 }, (_, i) => `1/${i + 1}`),
        customPrices: {
          '1/1': '4,500', '1/2': '4,500', '1/3': '4,500', '1/4': '4,500', '1/5': '4,500', '1/6': '4,500', '1/7': '4,500', '1/8': '4,500', '1/9': '4,500', '1/10': '4,500', '1/11': '4,500',
          '1/12': '4,200',
          '1/13': '4,800', '1/14': '4,800', '1/15': '4,800', '1/16': '4,800', '1/17': '4,800', '1/18': '4,800'
        }
      }
    ] 
  },
  { 
    id: 'meesap', 
    name: 'อพาร์ทเม้นท์มีทรัพย์', 
    notes: ["ราคาห้อง: 4,800 บาท/เดือน", "เงินประกัน: 9,600 บาท", "สัญญาขั้นต่ำ: 6 เดือน"],
    floors: Array.from({ length: 5 }, (_, i) => ({ level: 5 - i, price: "4,800", rooms: Array.from({ length: 6 }, (_, j) => `${5 - i}.${j + 1}`) }))
  },
  { 
    id: 'meethong', 
    name: 'อพาร์ทเม้นท์มีทอง', 
    floors: Array.from({ length: 5 }, (_, i) => {
        const lv = 5 - i;
        return { level: lv, rooms: lv === 1 ? Array.from({ length: 11 }, (_, j) => `${102 + j}`) : Array.from({ length: 13 }, (_, j) => `${lv}${String(j + 1).padStart(2, '0')}`) };
    })
  }
];

const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'apartcloud-pro-v1';

export default function App() {
  const [user, setUser] = useState(null);
  const [activePropertyId, setActivePropertyId] = useState(() => localStorage.getItem('apt_last_property') || PROPERTIES[0].id);
  const [roomStates, setRoomStates] = useState({});
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [tempStatus, setTempStatus] = useState(null);
  const [view, setView] = useState(() => localStorage.getItem('apt_last_view') || 'dashboard');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('apt_unlocked') === 'true');
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    localStorage.setItem('apt_last_property', activePropertyId);
    localStorage.setItem('apt_last_view', view);
  }, [activePropertyId, view]);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isUnlocked) return;
    const roomsRef = collection(db, 'artifacts', appId, 'public', 'data', 'rooms');
    const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'logs');

    const unsubRooms = onSnapshot(roomsRef, (snapshot) => {
      const data = {};
      snapshot.forEach(doc => { data[doc.id] = doc.data(); });
      setRoomStates(data);
      setLoading(false);
    });

    const unsubLogs = onSnapshot(logsRef, (snapshot) => {
      const logs = [];
      snapshot.forEach(doc => { logs.push({ id: doc.id, ...doc.data() }); });
      setVisitorLogs(logs.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => { unsubRooms(); unsubLogs(); };
  }, [user, isUnlocked]);

  const activeProperty = PROPERTIES.find(p => p.id === activePropertyId);

  const statusSummary = useMemo(() => {
    const summary = { available: [], booked: [], maintenance: [], appointment: [], notice: [], occupied: [] };
    Object.entries(roomStates).forEach(([key, info]) => {
      const [pId, rNo] = key.split('_');
      if (summary[info.status]) {
        summary[info.status].push({ ...info, roomNo: rNo, propertyName: PROPERTIES.find(p => p.id === pId)?.name });
      }
    });
    return summary;
  }, [roomStates]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    const formData = new FormData(e.target);
    const status = tempStatus;
    const date = formData.get('actionDate') || "";
    const time = formData.get('actionTime') || "";
    const name = formData.get('visitorName') || "";
    const phone = formData.get('visitorPhone') || "";
    const customPrice = formData.get('customPrice') || "";
    
    const docId = `${activePropertyId}_${selectedRoom}`;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', docId);
    
    try {
      await setDoc(roomRef, { 
        status, date, time, lastVisitor: name, lastPhone: phone, price: customPrice, updatedAt: Date.now() 
      }, { merge: true });

      if (name) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'logs'), {
          name, phone, roomNo: selectedRoom, propertyId: activePropertyId, propertyName: activeProperty.name,
          entryDate: new Date().toLocaleString('th-TH'), actionDate: date, actionTime: time,
          statusLabel: STATUS_CONFIG[status]?.label || status, createdAt: Date.now()
        });
      }
      setSelectedRoom(null);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === ACCESS_PIN) {
      setIsUnlocked(true);
      localStorage.setItem('apt_unlocked', 'true');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    localStorage.removeItem('apt_unlocked');
  };

  const exportCSVSummary = () => {
    let csvRows = [["สรุปรายงานหอพักทั้งหมด", `วันที่: ${new Date().toLocaleString('th-TH')}`], []];
    
    csvRows.push(["สรุปภาพรวมจำนวนห้อง"]);
    csvRows.push(["สถานะ", "จำนวนห้อง"]);
    Object.keys(STATUS_CONFIG).forEach(key => {
        csvRows.push([STATUS_CONFIG[key].label, statusSummary[key].length]);
    });
    csvRows.push([]);

    csvRows.push(["รายละเอียดรายการจอง"]);
    csvRows.push(["อาคาร", "เลขห้อง", "ชื่อลูกค้า", "เบอร์โทร", "วันที่นัด", "เวลานัด"]);
    statusSummary.booked.forEach(item => {
        csvRows.push([item.propertyName, item.roomNo, item.lastVisitor, item.lastPhone, item.date, item.time]);
    });
    csvRows.push([]);

    csvRows.push(["รายละเอียดรายการนัดดูห้อง"]);
    csvRows.push(["อาคาร", "เลขห้อง", "ชื่อลูกค้า", "เบอร์โทร", "วันที่นัด", "เวลานัด"]);
    statusSummary.appointment.forEach(item => {
        csvRows.push([item.propertyName, item.roomNo, item.lastVisitor, item.lastPhone, item.date, item.time]);
    });

    const csvContent = "\uFEFF" + csvRows.map(e => e.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ApartCloud_Summary_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.csv`;
    link.click();
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-['Prompt',sans-serif]">
        <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-200">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter">PRIVATE CLOUD</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน</p>
          </div>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <input 
                type="password" 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="ACCESS PIN"
                className={`w-full bg-slate-100 border-none rounded-2xl p-5 text-center text-2xl font-black tracking-[0.5em] focus:ring-4 transition-all outline-none ${pinError ? 'ring-rose-200 bg-rose-50' : 'ring-indigo-100'}`}
                autoFocus
              />
              {pinError && <p className="text-rose-500 text-[10px] font-bold mt-2 animate-bounce">รหัสผ่านไม่ถูกต้อง!</p>}
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-black transition-all active:scale-95 shadow-xl">UNLOCK</button>
          </form>
          <div className="pt-4 text-slate-300 text-[10px] font-bold italic">ApartCloud PRO © 2024</div>
        </div>
      </div>
    );
  }

  if (loading && !user) return <div className="min-h-screen flex items-center justify-center font-bold">กำลังโหลดข้อมูลคลาวด์...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Prompt',sans-serif]">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-40 shadow-sm px-4 h-16 flex justify-between items-center no-print">
        <div className="flex items-center gap-2 text-lg font-black text-indigo-600 italic">
          <Building2 className="w-5 h-5" /> ApartCloud PRO
        </div>
        <div className="flex gap-2 font-bold text-xs">
          <button onClick={() => setView('dashboard')} className={`p-2 px-3 rounded-xl flex items-center gap-2 ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-4 h-4" /> แดชบอร์ด
          </button>
          <button onClick={() => setView('visitors')} className={`p-2 px-3 rounded-xl flex items-center gap-2 ${view === 'visitors' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <Users className="w-4 h-4" /> ประวัติ
          </button>
          <button onClick={() => setView('summary')} className={`p-2 px-3 rounded-xl flex items-center gap-2 ${view === 'summary' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <FileText className="w-4 h-4" /> สรุป
          </button>
          <button onClick={handleLock} className="p-2 px-3 rounded-xl text-slate-300 hover:text-rose-500 transition-colors">
            <Unlock className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="p-4 max-w-7xl mx-auto no-print">
        {view === 'dashboard' ? (
          <>
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {['available', 'booked', 'maintenance', 'appointment'].map(st => (
                <div key={st} className="bg-white p-4 rounded-2xl border-b-4 shadow-sm text-center" style={{borderColor: st==='available'?'#10b981':st==='booked'?'#f43f5e':st==='maintenance'?'#ea580c':'#38bdf8'}}>
                  <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">{STATUS_CONFIG[st].label.split(' ')[0]}</p>
                  <p className="text-2xl font-black">{statusSummary[st]?.length || 0}</p>
                </div>
              ))}
            </div>

            <div className="flex overflow-x-auto gap-2 no-scrollbar mb-6">
              {PROPERTIES.map(p => (
                <button key={p.id} onClick={() => setActivePropertyId(p.id)} className={`px-5 py-2 rounded-full border-2 font-bold whitespace-nowrap transition-all ${activePropertyId === p.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white text-slate-500'}`}>{p.name}</button>
              ))}
            </div>

            <div className="space-y-6">
              {[...activeProperty.floors].reverse().map(floor => (
                <div key={floor.level} className="bg-white p-6 rounded-[2rem] border shadow-sm">
                  <h3 className="font-bold text-slate-300 text-[10px] uppercase mb-4 tracking-widest">ชั้น {floor.level}</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3">
                    {floor.rooms.map(roomNo => {
                      const docId = `${activePropertyId}_${roomNo}`;
                      const info = roomStates[docId] || { status: 'available' };
                      const manualPrice = info.price;
                      const customPrice = floor.customPrices ? floor.customPrices[roomNo] : null;
                      const displayPrice = manualPrice || customPrice || floor.price;
                      return (
                        <button key={roomNo} onClick={() => { setSelectedRoom(roomNo); setTempStatus(info.status); }} className={`p-3 rounded-2xl font-black text-center transition active:scale-95 ${STATUS_CONFIG[info.status].color} ${STATUS_CONFIG[info.status].text}`}>
                          <div className="text-lg leading-tight tracking-tighter">{roomNo}</div>
                          {displayPrice && <div className={`text-[7px] font-bold mt-1 ${manualPrice ? 'text-yellow-200' : 'opacity-80'}`}>฿ {displayPrice} {manualPrice && '★'}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : view === 'visitors' ? (
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center font-black italic uppercase">ACTIVITY HISTORY</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b">
                  <tr><th className="p-6">วันที่</th><th className="p-6">เลขห้อง</th><th className="p-6">ลูกค้า</th><th className="p-6">เบอร์โทร</th><th className="p-6">สถานะ</th><th className="p-6 text-right">จัดการ</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  {visitorLogs.map(log => (
                    <tr key={log.id}>
                      <td className="p-6 text-xs text-slate-400">{log.entryDate}</td>
                      <td className="p-6">{log.roomNo} <span className="text-[10px] text-slate-300 block">{log.propertyName}</span></td>
                      <td className="p-6">{log.name}</td>
                      <td className="p-6 text-indigo-500 font-black">{log.phone}</td>
                      <td className="p-6 uppercase text-[10px]">{log.statusLabel}</td>
                      <td className="p-6 text-right"><button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'logs', log.id))} className="p-2 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><X className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800">SUMMARY REPORT</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">สรุปภาพรวมหอพักทั้งหมดในคลาวด์</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={exportCSVSummary} className="flex-1 sm:flex-none bg-emerald-600 text-white p-3 rounded-2xl font-black flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-100"><Download className="w-4 h-4" /> Export CSV</button>
                <button onClick={() => window.print()} className="flex-1 sm:flex-none bg-slate-900 text-white p-3 rounded-2xl font-black flex items-center justify-center gap-2 text-xs shadow-lg"><Printer className="w-4 h-4" /> Print PDF</button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {['available', 'booked', 'maintenance', 'appointment'].map(st => (
                <div key={st} className={`${STATUS_CONFIG[st].light} border-2 ${STATUS_CONFIG[st].border} p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-sm`}>
                  <div className={`w-10 h-10 ${STATUS_CONFIG[st].color} text-white rounded-full flex items-center justify-center mb-3`}>{st === 'available' ? <CheckCircle2 /> : st === 'booked' ? <Banknote /> : st === 'maintenance' ? <Info /> : <Users />}</div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{STATUS_CONFIG[st].label}</p>
                  <p className={`text-4xl font-black ${STATUS_CONFIG[st].iconColor}`}>{statusSummary[st].length}</p>
                </div>
              ))}
            </div>

            {/* Booked Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden">
              <div className="p-6 bg-rose-50 border-b flex items-center gap-3 font-black text-rose-600 uppercase italic"><Banknote className="w-5 h-5" /> รายการห้องจอง (Booked)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b">
                    <tr><th className="p-6">อาคาร / เลขห้อง</th><th className="p-6">ลูกค้า</th><th className="p-6">เบอร์โทรศัพท์</th><th className="p-6">วันย้ายเข้า</th><th className="p-6">เวลา</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                    {statusSummary.booked.length === 0 ? <tr><td colSpan="5" className="p-10 text-center text-slate-300 italic">ไม่มีข้อมูลการจอง</td></tr> : statusSummary.booked.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6"><div className="text-slate-800">{item.roomNo}</div><div className="text-[10px] text-slate-400 uppercase tracking-wider">{item.propertyName}</div></td>
                        <td className="p-6 text-slate-700">{item.lastVisitor || '-'}</td>
                        <td className="p-6 text-indigo-500 font-black">{item.lastPhone || '-'}</td>
                        <td className="p-6 text-rose-600 flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date || 'ไม่ระบุ'}</td>
                        <td className="p-6 text-slate-600">{item.time || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Appointment Table (Added Back) */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden">
              <div className="p-6 bg-sky-50 border-b flex items-center gap-3 font-black text-sky-600 uppercase italic"><Users className="w-5 h-5" /> รายการนัดดูห้อง (Appointment)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b">
                    <tr><th className="p-6">อาคาร / เลขห้อง</th><th className="p-6">ลูกค้า</th><th className="p-6">เบอร์โทรศัพท์</th><th className="p-6">วันที่นัด</th><th className="p-6">เวลานัด</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                    {statusSummary.appointment.length === 0 ? <tr><td colSpan="5" className="p-10 text-center text-slate-300 italic">ไม่มีข้อมูลการนัดหมาย</td></tr> : statusSummary.appointment.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6"><div className="text-slate-800">{item.roomNo}</div><div className="text-[10px] text-slate-400 uppercase tracking-wider">{item.propertyName}</div></td>
                        <td className="p-6 text-slate-700">{item.lastVisitor || '-'}</td>
                        <td className="p-6 text-indigo-500 font-black">{item.lastPhone || '-'}</td>
                        <td className="p-6 text-sky-600 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.date || 'ไม่ระบุ'}</td>
                        <td className="p-6 text-slate-600">{item.time || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 no-print">
          <form onSubmit={handleUpdateStatus} className="bg-white rounded-t-[3rem] sm:rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none relative z-10">Room {selectedRoom}</h3>
                <button type="button" onClick={() => setSelectedRoom(null)} className="bg-white/10 p-2 rounded-full relative z-10 hover:bg-white/20 transition-all"><X /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <label key={key} className={`p-3 rounded-2xl border-2 font-black flex flex-col items-center gap-1 cursor-pointer transition active:scale-95 ${tempStatus === key ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-300'}`}>
                    <input type="radio" name="status" checked={tempStatus === key} onChange={() => setTempStatus(key)} className="hidden" />
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.color} ${tempStatus === key ? 'ring-4 ring-indigo-200' : ''}`}></div> 
                    <span className="text-[10px] uppercase tracking-tighter">{cfg.label.split(' ')[0]}</span>
                  </label>
                ))}
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 shadow-inner">
                <div className="relative"><p className="text-[10px] uppercase font-black text-indigo-600 mb-1 ml-2 flex items-center gap-1"><Banknote className="w-3 h-3" /> ราคาห้องพิเศษ</p><input name="customPrice" type="text" placeholder="ระบุราคา..." defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.price || ""} className="w-full p-4 rounded-xl border-none shadow-sm font-black focus:ring-4 ring-indigo-100 outline-none" /></div>
                {(tempStatus === 'booked' || tempStatus === 'appointment') && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div><p className="text-[10px] font-black mb-1 ml-2 text-slate-400 uppercase">วันที่</p><input type="date" name="actionDate" defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.date || ""} className="w-full p-4 rounded-xl shadow-sm font-bold text-xs border-none outline-none focus:ring-4 ring-indigo-100" /></div>
                      <div><p className="text-[10px] font-black mb-1 ml-2 text-slate-400 uppercase">เวลา</p><input type="time" name="actionTime" defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.time || ""} className="w-full p-4 rounded-xl shadow-sm font-bold text-xs border-none outline-none focus:ring-4 ring-indigo-100" /></div>
                    </div>
                    <input name="visitorName" placeholder="👤 ชื่อลูกค้า" defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.lastVisitor || ""} className="w-full p-4 rounded-xl shadow-sm border-none font-bold outline-none focus:ring-4 ring-indigo-100" />
                    <input name="visitorPhone" type="tel" placeholder="📞 เบอร์โทรศัพท์" defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.lastPhone || ""} className="w-full p-4 rounded-xl shadow-sm border-none font-bold outline-none focus:ring-4 ring-indigo-100" />
                  </div>
                )}
              </div>
              <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3">{isSaving ? <Loader2 className="animate-spin" /> : <><Save className="w-6 h-6" /> SAVE TO CLOUD</>}</button>
            </div>
          </form>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } @media print { .no-print { display: none !important; } body { background-color: white !important; } }`}} />
    </div>
  );
}

function Loader2({ className }) { return <div className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}></div>; }
