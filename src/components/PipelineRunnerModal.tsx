import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Newspaper, Brain, Sparkles, Image, Globe, ChevronRight } from 'lucide-react';
import { PipelineRunStatus } from '../types';

interface PipelineRunnerModalProps {
  status: PipelineRunStatus;
  onClose: () => void;
}

export const PipelineRunnerModal: React.FC<PipelineRunnerModalProps> = ({ status, onClose }) => {
  if (!status.isRunning && status.steps.every(s => s.status === 'pending')) return null;

  const currentStep = status.steps[status.currentStepIndex] || status.steps[0];
  const isFinished = status.steps.every(s => s.status === 'completed');
  const hasError = status.steps.some(s => s.status === 'error');

  const getStepIcon = (id: string) => {
    switch (id) {
      case '1': return <Newspaper className="w-4 h-4" />;
      case '2': return <Brain className="w-4 h-4" />;
      case '3': return <Sparkles className="w-4 h-4" />;
      case '4': return <Image className="w-4 h-4" />;
      case '5': return <Globe className="w-4 h-4" />;
      default: return <Newspaper className="w-4 h-4" />;
    }
  };

  return (
    <div id="pipeline-modal-backdrop" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div id="pipeline-modal-card" className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              hasError ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
              isFinished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              'bg-sky-500/10 text-sky-400 border border-sky-500/20'
            }`}>
              {hasError ? <AlertCircle className="w-5 h-5" /> :
               isFinished ? <CheckCircle2 className="w-5 h-5" /> :
               <Loader2 className="w-5 h-5 animate-spin" />}
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">
                {hasError ? 'Pipeline Execution Failed' :
                 isFinished ? 'Daily Briefing Generated!' :
                 'Running Automated News Pipeline...'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {hasError ? 'An error occurred during execution' :
                 isFinished ? 'All steps completed successfully' :
                 `Step ${status.currentStepIndex + 1} of ${status.steps.length}: ${currentStep?.name || ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Steps Progress List */}
        <div className="p-6 space-y-3.5 max-h-[60vh] overflow-y-auto">
          {status.steps.map((step, idx) => {
            const isActive = idx === status.currentStepIndex && status.isRunning;
            const isDone = step.status === 'completed';
            const isErr = step.status === 'error';

            return (
              <div
                key={step.id}
                className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-sky-950/30 border-sky-500/40 shadow-md shadow-sky-500/5'
                    : isDone
                    ? 'bg-slate-900/40 border-slate-800'
                    : isErr
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-slate-950/20 border-slate-800/40 opacity-50'
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-sky-500/20 text-sky-400' :
                  isDone ? 'bg-emerald-500/10 text-emerald-400' :
                  isErr ? 'bg-rose-500/20 text-rose-400' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  {getStepIcon(step.id)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-semibold ${isActive ? 'text-sky-300' : isDone ? 'text-slate-200' : 'text-slate-400'}`}>
                      {step.name}
                    </h3>
                    {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {isActive && <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />}
                    {isErr && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  </div>
                  {step.message && (
                    <p className="text-xs text-slate-400 mt-1 font-mono leading-relaxed bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                      {step.message}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end">
          <button
            id="btn-close-pipeline-modal"
            onClick={onClose}
            disabled={status.isRunning}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              status.isRunning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95'
            }`}
          >
            {isFinished || hasError ? 'Close & View Briefing' : 'Processing...'}
          </button>
        </div>
      </div>
    </div>
  );
};
