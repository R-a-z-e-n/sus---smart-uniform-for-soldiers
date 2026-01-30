
import React from 'react';
import { Wifi, WifiOff, Zap, Activity, Droplets, AlertCircle, MapPin, Clock, Signal } from 'lucide-react';
import { Soldier } from '../types';

interface SoldierCardProps {
  soldier: Soldier;
  onClick: (id: string) => void;
  batteryAlertThreshold?: number;
}

const SoldierCard: React.FC<SoldierCardProps> = ({ soldier, onClick, batteryAlertThreshold = 20 }) => {
  const getStatusStyles = (status: Soldier['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-600 text-white border-green-400';
      case 'RESTING':
        return 'bg-blue-600 text-white border-blue-400';
      case 'DISTRESS':
        return 'bg-red-600 text-white border-red-400 animate-pulse ring-2 ring-red-500/50';
      case 'OFFLINE':
        return 'bg-gray-600 text-gray-200 border-gray-500 opacity-80';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const isDistress = soldier.status === 'DISTRESS';
  const isOffline = soldier.status === 'OFFLINE';
  const isBatteryLow = soldier.power.batteryLevel < batteryAlertThreshold;

  // GPS Accuracy Visuals
  const acc = soldier.location.accuracy || 0;
  const isAccPoor = acc > 15;
  
  const getAccColor = (val: number) => {
    if (isOffline) return 'bg-slate-700';
    if (val <= 5) return 'bg-emerald-500';
    if (val <= 15) return 'bg-amber-500';
    return 'bg-red-500 animate-pulse';
  };
  
  const getAccTextColor = (val: number) => {
    if (isOffline) return 'text-slate-600';
    if (val <= 5) return 'text-emerald-400';
    if (val <= 15) return 'text-amber-400';
    return 'text-red-400';
  };

  // Calculate a "percentage" for the bar where 1m = 100% and 50m+ = 0%
  const accPercent = Math.max(5, Math.min(100, 100 - (acc * 2)));

  // Abnormal metric logic
  const hrCritical = soldier.vitals.heartRate > 120 || (soldier.vitals.heartRate < 45 && !isOffline);
  const hrWarning = soldier.vitals.heartRate > 100 || (soldier.vitals.heartRate < 55 && !isOffline);
  
  const spo2Critical = soldier.vitals.spO2 < 90 && !isOffline;
  const spo2Warning = soldier.vitals.spO2 < 95 && !isOffline;

  const hasCriticalIssue = (isDistress || hrCritical || spo2Critical) && !isOffline;

  const getMetricColor = (isCritical: boolean, isWarning: boolean) => {
    if (isCritical) return 'text-red-500';
    if (isWarning) return 'text-amber-500';
    return 'text-white';
  };

  return (
    <div 
      onClick={() => onClick(soldier.id)}
      className={`relative bg-slate-900/40 border p-5 rounded-2xl transition-all duration-300 cursor-pointer group hover:bg-slate-900/60 flex flex-col justify-between h-full overflow-hidden ${
        hasCriticalIssue 
          ? 'border-red-500/50 shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)]' 
          : 'border-slate-800 hover:border-lime-500/50 hover:shadow-lg hover:shadow-lime-500/5'
      }`}
    >
      {/* Status Badge */}
      <div className={`absolute top-3 right-3 px-2.5 py-1 rounded shadow-lg border text-[10px] font-black uppercase tracking-widest z-10 transition-colors duration-300 flex items-center gap-1.5 ${getStatusStyles(soldier.status)}`}>
        {isOffline ? <WifiOff size={10} /> : <Wifi size={10} />}
        {soldier.status}
      </div>

      <div>
        {/* Header Profile Info */}
        <div className="flex gap-4 mb-6 pr-24">
          <div className="relative shrink-0">
            <div className={`w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border-2 transition-transform group-hover:scale-105 ${hasCriticalIssue ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-slate-700'}`}>
               <img 
                 src={`https://picsum.photos/seed/${soldier.id}/120/120`} 
                 alt={soldier.name} 
                 className={`w-full h-full object-cover ${isOffline ? 'grayscale opacity-50' : ''}`}
               />
            </div>
            {!isOffline && (
               <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center ${hasCriticalIssue ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}>
                 <div className={`w-1.5 h-1.5 rounded-full bg-white`}></div>
               </div>
            )}
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <h3 className={`font-black truncate transition-colors text-lg uppercase tracking-tight ${hasCriticalIssue ? 'text-red-400' : 'text-white group-hover:text-lime-400'}`}>
                {soldier.name}
              </h3>
              {hasCriticalIssue && (
                <AlertCircle 
                  size={18} 
                  className="text-red-500 animate-pulse shrink-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
                />
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase truncate">{soldier.rank} | {soldier.unit}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[9px] text-slate-600 font-mono uppercase">{soldier.id}</p>
              <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
                <Clock size={10} className="text-slate-700" />
                <span>{getTimeAgo(soldier.lastUpdate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simplified Location Data */}
        <div className="mb-4 p-2 bg-slate-950/40 border border-slate-800 rounded-lg flex items-center gap-3">
          <div className="p-1.5 bg-blue-500/10 rounded border border-blue-500/20">
            <MapPin size={12} className="text-blue-400" />
          </div>
          <div className="grid grid-cols-3 gap-x-2 flex-1">
            <div>
               <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Lat</p>
               <p className="text-[10px] font-mono text-slate-300 leading-none">{soldier.location.lat.toFixed(4)}</p>
            </div>
            <div>
               <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Lng</p>
               <p className="text-[10px] font-mono text-slate-300 leading-none">{soldier.location.lng.toFixed(4)}</p>
            </div>
            <div>
               <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Alt</p>
               <p className="text-[10px] font-mono text-slate-300 leading-none">{soldier.location.alt}m</p>
            </div>
          </div>
        </div>

        {/* Telemetry & Signal Grid */}
        <div className="grid grid-cols-2 gap-3">
           <div className={`p-2 bg-slate-950/40 border rounded-lg transition-colors ${hrCritical ? 'border-red-500/30 bg-red-500/5' : 'border-slate-800'}`}>
             <div className="flex items-center gap-1.5 mb-1">
               <Activity size={12} className={hrWarning ? 'text-red-500' : 'text-rose-500'} />
               <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Heart Rate</span>
             </div>
             <p className={`text-sm font-black font-mono flex items-baseline gap-1 ${getMetricColor(hrCritical, hrWarning)}`}>
               {isOffline ? '--' : soldier.vitals.heartRate}
               <span className="text-[10px] font-normal text-slate-500">BPM</span>
             </p>
           </div>

           <div className={`p-2 bg-slate-950/40 border rounded-lg transition-colors ${spo2Critical ? 'border-red-500/30 bg-red-500/5' : 'border-slate-800'}`}>
             <div className="flex items-center gap-1.5 mb-1">
               <Droplets size={12} className={spo2Warning ? 'text-amber-500' : 'text-sky-500'} />
               <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Oxygen (SpO2)</span>
             </div>
             <p className={`text-sm font-black font-mono flex items-baseline gap-1 ${getMetricColor(spo2Critical, spo2Warning)}`}>
               {isOffline ? '--' : soldier.vitals.spO2}
               <span className="text-[10px] font-normal text-slate-500">%</span>
             </p>
           </div>

           {/* NEW: GPS Accuracy - Prominent Display */}
           <div className={`p-2 bg-slate-950/40 border rounded-lg col-span-2 transition-all duration-500 ${isAccPoor ? 'border-red-500/40 bg-red-500/5' : 'border-slate-800'}`}>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                 <Signal size={12} className={getAccTextColor(acc)} />
                 <span className={`text-[9px] font-bold uppercase tracking-tighter ${isAccPoor ? 'text-red-400' : 'text-slate-500'}`}>GPS Precision</span>
               </div>
               <p className={`text-xs font-black font-mono ${getAccTextColor(acc)}`}>
                 {soldier.location.accuracy ? `±${soldier.location.accuracy}m` : 'SEARCHING...'}
               </p>
             </div>
             <div className="mt-1.5 h-1 bg-slate-800 rounded-full overflow-hidden">
               <div 
                className={`h-full transition-all duration-500 ${getAccColor(acc)}`} 
                style={{width: `${accPercent}%`}}
               ></div>
             </div>
           </div>

           {/* Battery Section */}
           <div className={`p-2 bg-slate-950/40 border rounded-lg col-span-2 transition-all duration-500 ${isBatteryLow ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-[pulse_1.5s_infinite]' : 'border-slate-800'}`}>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                 <Zap size={12} className={isBatteryLow ? 'text-red-500' : 'text-amber-500'} />
                 <span className={`text-[9px] font-bold uppercase tracking-tighter ${isBatteryLow ? 'text-red-400' : 'text-slate-500'}`}>Grid Battery</span>
               </div>
               <p className={`text-xs font-black font-mono ${isBatteryLow ? 'text-red-400' : 'text-white'}`}>
                 {Math.floor(soldier.power.batteryLevel)}%
               </p>
             </div>
             <div className="mt-1.5 h-1 bg-slate-800 rounded-full overflow-hidden">
               <div 
                className={`h-full transition-all duration-500 ${isBatteryLow ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-lime-500'}`} 
                style={{width: `${soldier.power.batteryLevel}%`}}
               ></div>
             </div>
           </div>
        </div>
      </div>

      {/* Footer System HUD Info */}
      <div className="mt-5 pt-4 border-t border-slate-800/50 flex justify-between items-center">
        <div className="flex gap-2">
          {['COMMS', 'GPS', 'BIO'].map((tag, idx) => {
            const isAlert = (idx === 2 && (hrWarning || spo2Warning)) || (idx === 1 && isAccPoor);
            return (
              <div key={tag} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-slate-700' : (isAlert ? 'bg-red-500 animate-pulse' : 'bg-emerald-500')}`}></div>
                <span className="text-[8px] text-slate-600 font-bold">{tag}</span>
              </div>
            );
          })}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-all group-hover:translate-x-1 ${hasCriticalIssue ? 'text-red-400' : 'text-lime-500'}`}>
          HUD READY
        </div>
      </div>
      
      {/* Tactical HUD Overlays */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lime-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}></div>
    </div>
  );
};

export default SoldierCard;
