
import React, { useState, useEffect } from 'react';
import { Shield, Users, Radio, AlertCircle, Bell, Settings, Terminal, LayoutDashboard, ChevronRight, X, Power, Volume2, Eye, Sliders, CheckCircle2, Trash2, Cpu, Database } from 'lucide-react';
import { Soldier } from './types';
import { INITIAL_SOLDIERS } from './constants';
import VitalsDisplay from './components/VitalsDisplay';
import EnvironmentPanel from './components/EnvironmentPanel';
import StrategicAnalysis from './components/StrategicAnalysis';
import NavigationMap from './components/NavigationMap';
import SoldierCard from './components/SoldierCard';
import { generateOperationalBriefing } from './services/geminiService';

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [bootText, setBootText] = useState("INITIALIZING ASTRA-CORE...");
  const [soldiers, setSoldiers] = useState<Soldier[]>(INITIAL_SOLDIERS);
  const [selectedSoldierId, setSelectedSoldierId] = useState<string>(INITIAL_SOLDIERS[0].id);
  const [briefing, setBriefing] = useState<string>("Establishing secure command uplink...");
  const [view, setView] = useState<'OVERVIEW' | 'DETAILED'>('OVERVIEW');
  
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [config, setConfig] = useState({ aiAutoPilot: true, audioFeedback: false, hudBrightness: 80, stealthMode: false });
  const [notifications, setNotifications] = useState([
    { id: '1', time: '2m ago', title: 'Tactical Sync', msg: 'Major Singh position updated via Mesh Node-4.', type: 'INFO' },
    { id: '2', time: '14m ago', title: 'BIO ALERT', msg: 'Elevated HR detected for Unit ARMY-842.', type: 'WARN' },
  ]);

  const [evacConfirmation, setEvacConfirmation] = useState(false);
  const [evacStatus, setEvacStatus] = useState<'IDLE' | 'PENDING' | 'SENT'>('IDLE');
  const [trainingConnection, setTrainingConnection] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED'>('IDLE');

  const selectedSoldier = soldiers.find(s => s.id === selectedSoldierId) || soldiers[0];

  // Boot Sequence Logic
  useEffect(() => {
    const sequence = [
      { text: "DECRYPTING MESH SIGNALS...", delay: 800 },
      { text: "STABILIZING BIOMETRIC UPLINK...", delay: 1600 },
      { text: "SYSTEMS READY. WELCOME COMMANDER.", delay: 2400 },
    ];

    sequence.forEach(step => {
      setTimeout(() => setBootText(step.text), step.delay);
    });

    setTimeout(() => {
      setIsBooting(false);
      document.body.style.overflow = 'auto';
    }, 3200);
  }, []);

  // Simulation: Update vitals
  useEffect(() => {
    if (isBooting) return;
    const interval = setInterval(() => {
      setSoldiers(prev => prev.map(s => {
        const roll = Math.random();
        let newStatus = s.status;
        if (roll < 0.02) newStatus = 'DISTRESS';
        else if (roll < 0.04) newStatus = 'OFFLINE';
        else if (roll < 0.06 && s.status !== 'ACTIVE') newStatus = 'ACTIVE';

        return {
          ...s,
          status: newStatus,
          vitals: {
            ...s.vitals,
            heartRate: newStatus === 'DISTRESS' ? 115 + Math.floor(Math.random() * 25) : (newStatus === 'OFFLINE' ? 0 : s.vitals.heartRate + (Math.random() > 0.5 ? 2 : -2)),
          },
          power: {
            ...s.power,
            batteryLevel: Math.max(0, s.power.batteryLevel - 0.2),
          },
          lastUpdate: Date.now()
        };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, [isBooting]);

  useEffect(() => {
    if (isBooting) return;
    const fetchBrief = async () => {
      const b = await generateOperationalBriefing(soldiers);
      setBriefing(b);
    };
    fetchBrief();
    const briefInterval = setInterval(fetchBrief, 180000);
    return () => clearInterval(briefInterval);
  }, [soldiers.length, isBooting]);

  const handleSoldierClick = (id: string) => {
    setSelectedSoldierId(id);
    setView('DETAILED');
  };

  const handleTriggerEvac = () => {
    setEvacStatus('PENDING');
    setTimeout(() => {
      setEvacStatus('SENT');
      setTimeout(() => { setEvacStatus('IDLE'); setEvacConfirmation(false); }, 3000);
    }, 2000);
  };

  const handleJoinTraining = () => {
    setTrainingConnection('CONNECTING');
    setTimeout(() => {
      setTrainingConnection('CONNECTED');
      setTimeout(() => setTrainingConnection('IDLE'), 4000);
    }, 2000);
  };

  if (isBooting) {
    return (
      <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center boot-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-[2px] bg-lime-500/20 shadow-[0_0_20px_#84cc16] animate-[scanline_3s_linear_infinite] opacity-50"></div>
        
        <div className="relative mb-12 animate-logo-boot-full">
          <div className="w-32 h-32 bg-gradient-to-br from-lime-400 to-lime-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(132,204,22,0.4)] border border-lime-400/50">
            <Shield className="text-slate-950" size={64} strokeWidth={2.5} />
          </div>
          <div className="absolute -inset-4 border border-lime-500/20 rounded-full animate-ping opacity-20"></div>
        </div>

        <div className="text-center relative z-10">
          <h1 className="text-2xl font-black tracking-[0.3em] text-white mb-4 animate-pulse">SUS-TACTICAL</h1>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 text-lime-500 font-mono text-xs tracking-[0.2em] font-bold">
              <Terminal size={14} className="animate-pulse" />
              <span>{bootText}</span>
            </div>
            <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden mt-4 border border-slate-800">
               <div className="h-full bg-lime-500 shadow-[0_0_10px_#84cc16] animate-[scanline_2s_linear_infinite]" style={{ width: '40%', transform: 'translateX(0)' }}></div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 flex gap-12 text-[10px] font-mono text-slate-600 tracking-widest uppercase">
          <div className="flex items-center gap-2"><Cpu size={12}/> CORE_V4.2</div>
          <div className="flex items-center gap-2"><Database size={12}/> DATA_LINK_SECURE</div>
          <div className="flex items-center gap-2"><Radio size={12}/> SIGNAL_STABLE</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-lime-500 selection:text-slate-950 overflow-hidden animate-in fade-in duration-1000 ${config.stealthMode ? 'grayscale contrast-125' : ''}`}>
      {/* Header */}
      <header className="h-16 border-b border-slate-900 bg-slate-950/90 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-600 rounded-lg flex items-center justify-center shadow-lg shadow-lime-500/20 animate-breathing">
             <Shield className="text-slate-950" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase text-white leading-none">SUS-TACTICAL</h1>
            <p className="text-[10px] text-lime-500 font-mono tracking-[0.2em] uppercase mt-1">Command Node Alpha</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-2">
          {[
            { id: 'OVERVIEW', label: 'Squad View', icon: LayoutDashboard },
            { id: 'NCC', label: 'NCC Assets', icon: Users },
            { id: 'COMMS', label: 'Signal Hub', icon: Radio },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => item.id === 'OVERVIEW' && setView('OVERVIEW')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${view === item.id ? 'bg-slate-900 text-lime-400 shadow-inner' : 'text-slate-500 hover:text-white hover:bg-slate-900/50'}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">Global Link</span>
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 4 ? 'bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.5)]' : 'bg-slate-800'}`}></div>)}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-lime-500 text-slate-950 shadow-[0_0_15px_rgba(132,204,22,0.4)]' : 'bg-slate-900 text-slate-400 hover:text-lime-500'}`}
            >
              <Bell size={20} />
              {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>}
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl transition-all ${showSettings ? 'bg-lime-500 text-slate-950 shadow-[0_0_15px_rgba(132,204,22,0.4)]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto relative">
        <main className="p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-lime-500/20 to-sky-500/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-5 rounded-2xl flex items-center gap-6 shadow-2xl">
                 <div className="p-3 bg-lime-500/10 rounded-xl border border-lime-500/20 shrink-0">
                   <Terminal className="text-lime-500" size={24} />
                 </div>
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1.5">
                     <h2 className="text-[10px] font-black text-lime-500 uppercase tracking-[0.3em]">Operational Intel Briefing</h2>
                     <div className="h-[1px] flex-1 bg-gradient-to-r from-lime-500/30 to-transparent"></div>
                   </div>
                   <p className="text-base text-slate-200 font-medium italic leading-relaxed">{briefing}</p>
                 </div>
              </div>
            </div>

            {view === 'OVERVIEW' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black uppercase tracking-tight text-white">Squad Manifest</h2>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 font-mono">STRENGTH: {soldiers.length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {soldiers.map(s => <SoldierCard key={s.id} soldier={s} onClick={handleSoldierClick} />)}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                 <div className="lg:col-span-8 space-y-8">
                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl flex flex-wrap items-center justify-between gap-8 shadow-2xl">
                      <div className="flex items-center gap-8">
                         <div className="relative">
                            <div className="w-24 h-24 rounded-2xl border-2 border-lime-500/30 overflow-hidden shadow-[0_0_30px_rgba(132,204,22,0.1)]">
                              <img src={`https://picsum.photos/seed/${selectedSoldier.id}/300/300`} alt={selectedSoldier.name} className="w-full h-full object-cover" />
                            </div>
                            <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl ${selectedSoldier.status === 'DISTRESS' ? 'bg-red-600' : 'bg-emerald-600'}`}>{selectedSoldier.status}</div>
                         </div>
                         <div>
                           <div className="flex items-center gap-3 mb-2">
                             <h2 className="text-3xl font-black text-white uppercase tracking-tight">{selectedSoldier.name}</h2>
                             <span className="text-slate-500 font-mono text-sm">/ {selectedSoldier.rank}</span>
                           </div>
                           <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{selectedSoldier.unit} | {selectedSoldier.id}</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <div className="relative">
                            <button onClick={() => setEvacConfirmation(true)} className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-500 transition-all uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-red-600/20">
                              <AlertCircle size={16} /> TRIGGER EVAC
                            </button>
                            {evacConfirmation && (
                              <div className="absolute top-full mt-2 right-0 w-64 bg-slate-900 border border-red-500/50 p-4 rounded-xl shadow-2xl z-50 animate-in zoom-in-95">
                                {evacStatus === 'IDLE' ? (
                                  <>
                                    <p className="text-[10px] font-bold text-red-400 mb-3 uppercase">Confirm Exfiltration for {selectedSoldier.name}?</p>
                                    <div className="flex gap-2">
                                      <button onClick={handleTriggerEvac} className="flex-1 bg-red-600 text-white text-[10px] font-black py-2 rounded-lg">INITIATE</button>
                                      <button onClick={() => setEvacConfirmation(false)} className="flex-1 bg-slate-800 text-white text-[10px] font-black py-2 rounded-lg">ABORT</button>
                                    </div>
                                  </>
                                ) : evacStatus === 'PENDING' ? (
                                  <div className="flex flex-col items-center py-2">
                                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Encrypting Signal...</p>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center py-2">
                                    <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Signal Broadcasted</p>
                                  </div>
                                )}
                              </div>
                            )}
                         </div>
                         <button onClick={() => setView('OVERVIEW')} className="px-6 py-3 bg-slate-800 text-white rounded-xl text-xs font-black hover:bg-slate-700 transition-all uppercase tracking-widest shadow-lg">BACK TO SQUAD</button>
                      </div>
                    </div>
                    <VitalsDisplay vitals={selectedSoldier.vitals} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <NavigationMap soldier={selectedSoldier} allSoldiers={soldiers} />
                      <EnvironmentPanel env={selectedSoldier.environment} power={selectedSoldier.power} />
                    </div>
                 </div>
                 <div className="lg:col-span-4 space-y-8">
                    <StrategicAnalysis soldier={selectedSoldier} />
                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-500/10 rounded-lg"><AlertCircle className="text-amber-500" size={20} /></div>
                          <h3 className="font-black text-sm uppercase tracking-widest text-slate-200">Alert Registry</h3>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">REALTIME</span>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-950/60 border-l-2 border-amber-500 rounded-r-xl">
                          <p className="text-[10px] font-black text-amber-500 uppercase mb-1">Environmental Alert</p>
                          <p className="text-xs text-slate-300 leading-relaxed">Toxic gas concentration rising in Sector A-7. Proximity alert sent to HUD.</p>
                        </div>
                      </div>
                    </div>
                    <div className="group relative overflow-hidden bg-slate-900 border border-indigo-500/20 rounded-3xl p-8">
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/40 rotate-12 group-hover:rotate-0 transition-transform">
                          <Users className="text-indigo-400" size={28} />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3">NCC CADET NETWORK</h3>
                        <p className="text-sm text-slate-400 mb-6 leading-relaxed">This feed is shared with NCC Training Command for real-time situational awareness exercises.</p>
                        <button onClick={handleJoinTraining} disabled={trainingConnection !== 'IDLE'} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-500 transition-all uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50">
                          {trainingConnection === 'IDLE' ? <>JOIN TRAINING CHANNEL <ChevronRight size={14} /></> : trainingConnection === 'CONNECTING' ? <>TUNNELING... <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div></> : <>CONNECTION ESTABLISHED <CheckCircle2 size={14} /></>}
                        </button>
                      </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </main>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute inset-0 z-[150] flex justify-end">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowSettings(false)}></div>
            <div className="relative w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl p-8 animate-in slide-in-from-right-full duration-300">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3"><Sliders className="text-lime-500" size={20} /><h3 className="font-black text-lg uppercase tracking-tight">Node Config</h3></div>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500"><X size={20}/></button>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Operational Parameters</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300"><Power size={14} className={config.aiAutoPilot ? 'text-emerald-500' : 'text-slate-600'}/> AI Auto-Pilot</div>
                      <button onClick={() => setConfig(p => ({ ...p, aiAutoPilot: !p.aiAutoPilot }))} className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${config.aiAutoPilot ? 'bg-lime-500' : 'bg-slate-700'}`}><div className={`w-3.5 h-3.5 bg-slate-950 rounded-full transition-transform ${config.aiAutoPilot ? 'translate-x-4.5' : 'translate-x-0'}`}></div></button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300"><Volume2 size={14} className={config.audioFeedback ? 'text-blue-400' : 'text-slate-600'}/> Audio Feedback</div>
                      <button onClick={() => setConfig(p => ({ ...p, audioFeedback: !p.audioFeedback }))} className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${config.audioFeedback ? 'bg-blue-500' : 'bg-slate-700'}`}><div className={`w-3.5 h-3.5 bg-slate-950 rounded-full transition-transform ${config.audioFeedback ? 'translate-x-4.5' : 'translate-x-0'}`}></div></button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300"><Eye size={14} className={config.stealthMode ? 'text-rose-500' : 'text-slate-600'}/> Stealth Visuals</div>
                      <button onClick={() => setConfig(p => ({ ...p, stealthMode: !p.stealthMode }))} className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${config.stealthMode ? 'bg-rose-500' : 'bg-slate-700'}`}><div className={`w-3.5 h-3.5 bg-slate-950 rounded-full transition-transform ${config.stealthMode ? 'translate-x-4.5' : 'translate-x-0'}`}></div></button>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Interface HUD</p>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase">Brightness <span className="text-lime-500">{config.hudBrightness}%</span></div>
                    <div className="relative h-6 flex items-center group cursor-pointer" onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const percent = Math.round(((e.clientX - rect.left) / rect.width) * 100); setConfig(p => ({ ...p, hudBrightness: Math.min(100, Math.max(0, percent)) })); }}>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full relative overflow-hidden"><div className="absolute inset-y-0 left-0 bg-lime-500 transition-all duration-300" style={{ width: `${config.hudBrightness}%` }}></div></div>
                      <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-950 rounded-full shadow-lg transition-all duration-300" style={{ left: `calc(${config.hudBrightness}% - 8px)` }}></div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-slate-800 hover:bg-lime-500 hover:text-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] mt-8 transition-all">Apply & Sync Nodes</button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="absolute inset-0 z-[150] flex justify-end">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowNotifications(false)}></div>
            <div className="relative w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
              <div className="p-8 border-b border-slate-800 flex items-center justify-between"><div className="flex items-center gap-3"><Bell className="text-lime-500" size={20} /><h3 className="font-black text-lg uppercase tracking-tight">Signal Feed</h3></div><button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500"><X size={20}/></button></div>
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group relative">
                    <div className="flex justify-between items-start mb-2"><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${notif.type === 'WARN' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>{notif.title}</span><span className="text-[9px] font-mono text-slate-600">{notif.time}</span></div>
                    <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{notif.msg}</p>
                    <button onClick={() => setNotifications(p => p.filter(n => n.id !== notif.id))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-500"><Trash2 size={12}/></button>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-800"><button onClick={() => setNotifications([])} className="w-full py-3 text-[10px] font-black uppercase text-slate-500 hover:text-lime-500 tracking-widest">Clear All Signal Logs</button></div>
            </div>
          </div>
        )}
      </div>

      {/* Footer System Status */}
      <footer className="h-12 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md px-8 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <div className="flex gap-8">
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div><span className="uppercase tracking-widest font-bold">Encrypted Feed: OK</span></div>
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div><span className="uppercase tracking-widest font-bold">Mesh Sync: 98%</span></div>
        </div>
        <div className="flex items-center gap-6"><span className="text-slate-400 font-bold uppercase tracking-widest">© 2024 INDIAN ARMY R&D • NCC TECH</span><div className="bg-slate-900 px-3 py-1 rounded-md text-lime-500 border border-slate-800 font-bold">SYSTEM_UPTIME: 247:12:04</div></div>
      </footer>
    </div>
  );
};

export default App;
