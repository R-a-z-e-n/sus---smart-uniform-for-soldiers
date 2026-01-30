
import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Signal, Flame, Users, EyeOff, Crosshair } from 'lucide-react';
import { Soldier } from '../types';

interface NavigationMapProps {
  soldier: Soldier;
  allSoldiers?: Soldier[];
}

type OverlayMode = 'NONE' | 'HAZARDS' | 'DENSITY';

const NavigationMap: React.FC<NavigationMapProps> = ({ soldier, allSoldiers = [] }) => {
  const [activeOverlay, setActiveOverlay] = useState<OverlayMode>('NONE');

  // Calculate relative coordinates for all soldiers based on the squad's bounding box
  const mappedPoints = useMemo(() => {
    if (allSoldiers.length === 0) return [];

    const lats = allSoldiers.map(s => s.location.lat);
    const lngs = allSoldiers.map(s => s.location.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.01;
    const lngRange = maxLng - minLng || 0.01;

    // Add 10% padding to the map edges
    const padding = 15;
    const scale = (100 - (padding * 2));

    return allSoldiers.map(s => {
      // Note: Latitudes increase North (up), so we invert Y
      const x = padding + ((s.location.lng - minLng) / lngRange) * scale;
      const y = padding + (1 - (s.location.lat - minLat) / latRange) * scale;

      return {
        ...s,
        mapX: x,
        mapY: y
      };
    });
  }, [allSoldiers]);

  const hazardPoints = useMemo(() => {
    return mappedPoints.filter(s => s.environment.radiation > 0.15 || s.environment.toxicGas > 5);
  }, [mappedPoints]);

  const toggleOverlay = (mode: OverlayMode) => {
    setActiveOverlay(prev => prev === mode ? 'NONE' : mode);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-full flex flex-col relative overflow-hidden group">
      {/* HUD Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-30" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)', backgroundSize: '100% 4px' }}></div>

      <div className="flex items-center justify-between mb-4 relative z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 rounded border border-blue-500/20">
            <Navigation className="text-blue-400" size={16} />
          </div>
          <div>
            <span className="font-black text-slate-300 uppercase text-[10px] tracking-widest block leading-none">Tactical HUD</span>
            <span className="text-[9px] text-blue-500/70 font-mono uppercase">Spatial Sync Active</span>
          </div>
        </div>
        
        {/* Overlay Toggles */}
        <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800 shadow-2xl backdrop-blur-md">
          <button 
            onClick={() => toggleOverlay('HAZARDS')}
            className={`p-1.5 rounded transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${activeOverlay === 'HAZARDS' ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Flame size={12} />
            <span className="hidden sm:inline">Hazards</span>
          </button>
          <button 
            onClick={() => toggleOverlay('DENSITY')}
            className={`p-1.5 rounded transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${activeOverlay === 'DENSITY' ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Users size={12} />
            <span className="hidden sm:inline">Density</span>
          </button>
          <button 
            onClick={() => setActiveOverlay('NONE')}
            className={`p-1.5 rounded transition-all text-slate-500 hover:text-slate-300 ${activeOverlay === 'NONE' ? 'bg-slate-800 text-slate-100' : ''}`}
          >
            <EyeOff size={12} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-900 border border-slate-800 rounded-lg overflow-hidden mb-4 min-h-[300px]">
        {/* Terrain Radar Pulse */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="w-full h-1 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)] animate-[radar-sweep_4s_linear_infinite]"></div>
        </div>

        {/* Base Grid Layer */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ 
          backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}></div>

        {/* HAZARD HEATMAP OVERLAY */}
        {activeOverlay === 'HAZARDS' && (
          <div className="absolute inset-0 z-0 animate-in fade-in zoom-in-95 duration-500">
            {hazardPoints.map((pt) => {
              const intensity = Math.min(1, (pt.environment.radiation / 0.5) + (pt.environment.toxicGas / 50));
              const size = 60 + (intensity * 120);
              return (
                <div 
                  key={`hazard-${pt.id}`}
                  className="absolute rounded-full blur-[25px] mix-blend-screen animate-pulse"
                  style={{
                    left: `${pt.mapX}%`,
                    top: `${pt.mapY}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: `radial-gradient(circle, rgba(244, 63, 94, ${0.4 * intensity}) 0%, rgba(245, 158, 11, ${0.2 * intensity}) 50%, transparent 100%)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              );
            })}
          </div>
        )}

        {/* DENSITY HEATMAP OVERLAY */}
        {activeOverlay === 'DENSITY' && (
          <div className="absolute inset-0 z-0 animate-in fade-in duration-500">
            {mappedPoints.map((pt) => (
              <div 
                key={`density-${pt.id}`}
                className="absolute rounded-full blur-[20px] mix-blend-lighten"
                style={{
                  left: `${pt.mapX}%`,
                  top: `${pt.mapY}%`,
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>
        )}

        {/* Squad Unit Markers */}
        <div className="absolute inset-0 z-20">
          {mappedPoints.map((pt) => {
            const isTarget = pt.id === soldier.id;
            return (
              <div 
                key={`unit-${pt.id}`}
                className="absolute group/marker transition-all duration-1000"
                style={{ left: `${pt.mapX}%`, top: `${pt.mapY}%`, transform: 'translate(-50%, -50%)' }}
              >
                 <div className="relative flex flex-col items-center">
                    {isTarget && (
                      <div className="absolute -inset-4 border border-lime-500/20 rounded-full animate-ping pointer-events-none"></div>
                    )}
                    <div className={`w-3 h-3 rounded-full border-2 border-slate-950 transition-all shadow-lg ${isTarget ? 'bg-lime-500 scale-125 z-20 shadow-lime-500/40' : 'bg-blue-500/60'}`}></div>
                    
                    {/* Unit Label */}
                    <div className="mt-1 flex flex-col items-center">
                      <div className={`bg-slate-900/90 px-1.5 py-0.5 rounded text-[7px] border border-slate-800 font-mono tracking-tighter whitespace-nowrap shadow-xl transition-opacity ${isTarget ? 'opacity-100' : 'opacity-0 group-hover/marker:opacity-100'}`}>
                        {pt.rank} {pt.name.split(' ')[0]}
                      </div>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>

        {/* Global Reticle */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-10">
          <Crosshair size={120} className="text-slate-500" strokeWidth={0.5} />
        </div>

        {/* HUD UI Elements */}
        <div className="absolute bottom-4 left-4 z-40 bg-slate-950/80 border border-slate-800 p-3 rounded-lg text-[10px] font-mono backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse"></div>
            <span className="text-slate-200 font-black uppercase tracking-wider">Telemetry Lock</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 font-bold">LATITUDE</span>
              <span className="text-slate-300">{soldier.location.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 font-bold">LONGITUDE</span>
              <span className="text-slate-300">{soldier.location.lng.toFixed(6)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 font-bold">ACCURACY</span>
              <span className="text-lime-500 font-bold">±{soldier.location.accuracy || 3}m</span>
            </div>
          </div>
        </div>

        {/* Compass Overlay */}
        <div className="absolute top-4 right-4 z-40">
           <div className="w-16 h-16 border-2 border-slate-800/80 rounded-full flex items-center justify-center bg-slate-950/60 backdrop-blur-md shadow-2xl relative">
              <div className="absolute inset-0 rounded-full border border-slate-700/20 border-t-blue-500/50 animate-[spin_12s_linear_infinite]"></div>
              <div className="w-0.5 h-10 bg-rose-500 -rotate-[15deg] origin-bottom absolute top-2 transition-transform duration-1000"></div>
              <div className="absolute top-1 text-[8px] font-black text-slate-400">N</div>
              <div className="absolute bottom-1 text-[7px] font-black text-slate-700">S</div>
              <div className="absolute left-1 text-[7px] font-black text-slate-700">W</div>
              <div className="absolute right-1 text-[7px] font-black text-slate-700">E</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-40">
        <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 backdrop-blur-sm group/card hover:bg-slate-900/60 transition-colors">
           <div className="p-2 bg-slate-800 rounded-lg group-hover/card:bg-slate-700 transition-colors">
             <MapPin size={16} className="text-slate-400" />
           </div>
           <div>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.15em] leading-none mb-1">AOR SECTOR</p>
              <p className="text-xs font-black text-slate-100 uppercase">LEH-LADAKH / ALPHA-7</p>
           </div>
        </div>
         <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 backdrop-blur-sm group/card hover:bg-slate-900/60 transition-colors">
           <div className="p-2 bg-blue-500/10 rounded-lg group-hover/card:bg-blue-500/20 transition-colors">
             <Signal size={16} className="text-blue-400" />
           </div>
           <div>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.15em] leading-none mb-1">DATA LINK</p>
              <p className="text-xs font-black text-blue-400 uppercase tracking-tighter">SECURE MESH ACTIVE</p>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes radar-sweep {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default NavigationMap;
