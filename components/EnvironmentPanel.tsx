
import React from 'react';
import { ShieldAlert, AlertTriangle, Zap, ThermometerSnowflake, Radiation } from 'lucide-react';
import { Environment, PowerStatus } from '../types';

interface EnvironmentPanelProps {
  env: Environment;
  power: PowerStatus;
}

const EnvironmentPanel: React.FC<EnvironmentPanelProps> = ({ env, power }) => {
  const getHazardSeverity = (val: number, threshold: number) => {
    if (val > threshold * 1.5) return 'text-rose-500';
    if (val > threshold) return 'text-amber-500';
    return 'text-emerald-500';
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="text-sky-500" size={20} />
          <span className="font-bold text-slate-300">Environment</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <ThermometerSnowflake size={14} className="text-sky-400" />
              <span className="text-[10px] text-slate-500 uppercase">Ext. Temp</span>
            </div>
            <p className="text-xl font-bold font-mono">{env.externalTemp}°C</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Radiation size={14} className={getHazardSeverity(env.radiation, 0.2)} />
              <span className="text-[10px] text-slate-500 uppercase">Rad Level</span>
            </div>
            <p className={`text-xl font-bold font-mono ${getHazardSeverity(env.radiation, 0.2)}`}>{env.radiation} <span className="text-[10px]">uSv/h</span></p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
             <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className={getHazardSeverity(env.toxicGas, 10)} />
              <span className="text-[10px] text-slate-500 uppercase">Toxic Gas</span>
            </div>
            <p className={`text-xl font-bold font-mono ${getHazardSeverity(env.toxicGas, 10)}`}>{env.toxicGas} <span className="text-[10px]">PPM</span></p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
             <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] text-slate-500 uppercase">O2 Concentration</span>
            </div>
            <p className="text-xl font-bold font-mono">{env.o2Level}%</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="text-amber-400" size={20} />
            <span className="font-bold text-slate-300">SUS Power Grid</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            {power.source} HARVESTING
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-xs text-slate-400">System Battery</span>
            <span className="text-lg font-bold font-mono text-white">{power.batteryLevel}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${power.batteryLevel < 20 ? 'bg-rose-500' : 'bg-amber-400'}`}
              style={{ width: `${power.batteryLevel}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-500">Energy Consumption: 12W</span>
            <span className="text-emerald-500">Harvesting: +{power.harvestingRate}mW</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentPanel;
