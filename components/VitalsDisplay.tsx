
import React from 'react';
import { Activity, Thermometer, Droplets, Wind } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Vitals } from '../types';

interface VitalsDisplayProps {
  vitals: Vitals;
}

const VitalsDisplay: React.FC<VitalsDisplayProps> = ({ vitals }) => {
  const chartData = React.useMemo(() => {
    // Generate dummy historical data points
    return Array.from({ length: 10 }).map((_, i) => ({
      time: i,
      hr: vitals.heartRate + Math.floor(Math.random() * 5 - 2),
      spO2: vitals.spO2 + Math.floor(Math.random() * 2 - 1),
    }));
  }, [vitals]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="text-rose-500" size={20} />
            <span className="font-bold text-slate-300">Biometrics</span>
          </div>
          <span className="text-xs bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded-full">LIVE</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-slate-500 uppercase">Heart Rate</p>
            <p className="text-2xl font-bold font-mono text-white">{vitals.heartRate} <span className="text-sm font-normal text-slate-400">BPM</span></p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Oxygen Saturation</p>
            <p className="text-2xl font-bold font-mono text-white">{vitals.spO2}<span className="text-sm font-normal text-slate-400">%</span></p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Body Temp</p>
            <p className="text-2xl font-bold font-mono text-white">{vitals.temperature}<span className="text-sm font-normal text-slate-400">°C</span></p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Hydration</p>
            <p className="text-2xl font-bold font-mono text-white">{vitals.hydration}<span className="text-sm font-normal text-slate-400">%</span></p>
          </div>
        </div>

        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="hr" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} labelStyle={{ display: 'none' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
         <div className="flex items-center gap-2 mb-4">
            <Wind className="text-emerald-500" size={20} />
            <span className="font-bold text-slate-300">Respiration & Health</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Respiratory Rate</span>
              <span className="text-sm font-mono text-emerald-400">14 breaths/min</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[85%]"></div>
            </div>

             <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Blood Pressure</span>
              <span className="text-sm font-mono text-emerald-400">118/78 mmHg</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[92%]"></div>
            </div>

             <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Stress Index</span>
              <span className="text-sm font-mono text-emerald-400">Low (12/100)</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[12%]"></div>
            </div>
          </div>
          <div className="mt-4 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Health Status</p>
            <p className="text-sm text-emerald-100">Optimal. No anomalies detected by on-suit sensors.</p>
          </div>
      </div>
    </div>
  );
};

export default VitalsDisplay;
