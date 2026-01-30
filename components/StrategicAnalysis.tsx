
import React from 'react';
import { BrainCircuit, Info, ShieldCheck, Zap, RefreshCw, AlertTriangle } from 'lucide-react';
import { analyzeSoldierStatus } from '../services/geminiService';
import { Soldier } from '../types';

interface StrategicAnalysisProps {
  soldier: Soldier;
}

const StrategicAnalysis: React.FC<StrategicAnalysisProps> = ({ soldier }) => {
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const fetchAnalysis = async (force = false) => {
    setLoading(true);
    const result = await analyzeSoldierStatus(soldier, force);
    setAnalysis(result);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchAnalysis();
  }, [soldier.id]);

  const isRateLimited = analysis?.error_type === 'RATE_LIMIT';

  return (
    <div className="bg-slate-900/80 border border-lime-500/30 rounded-2xl overflow-hidden shadow-lg shadow-lime-500/5">
      <div className="bg-lime-500/10 border-b border-lime-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-lime-500 rounded-lg">
            <BrainCircuit size={18} className="text-slate-900" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-lime-400 uppercase tracking-widest">Astra AI Analysis</h3>
            <p className="text-[10px] text-lime-600/70">Strategic Readiness Advisor</p>
          </div>
        </div>
        <button 
          onClick={() => fetchAnalysis(true)} 
          disabled={loading}
          className="p-1.5 hover:bg-lime-500/10 rounded-lg transition-colors text-lime-500 disabled:opacity-30"
          title="Force Refresh Analysis"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-10 h-10 border-2 border-lime-500/20 border-t-lime-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-mono animate-pulse">Processing tactical data nodes...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {isRateLimited && (
              <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-2">
                <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                <p className="text-[10px] text-amber-200 font-medium">
                  Command link saturated. Analysis may be delayed.
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-lime-500" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Status Summary</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {analysis?.status_summary || "Tactical data baseline established."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={14} className="text-rose-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Risk Assessment</span>
                </div>
                <p className="text-xs text-rose-100">{analysis?.health_risk || "Minimal risks."}</p>
              </div>

              <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-amber-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Immediate Action</span>
                </div>
                <p className="text-xs text-amber-100">{analysis?.immediate_action || "Continue routine sweep."}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/50 flex justify-between items-center">
              <p className="text-[9px] text-slate-600 italic">
                *Analysis generated via Astra Core Node
              </p>
              {analysis?.timestamp && (
                <span className="text-[8px] font-mono text-slate-700">
                  TS: {new Date(analysis.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategicAnalysis;
