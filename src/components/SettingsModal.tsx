import React, { useState } from 'react';
import { Settings, Save, Sparkles, FileText, Check } from 'lucide-react';
import { PipelineConfig } from '../types';

interface SettingsModalProps {
  config: PipelineConfig;
  onSaveConfig: (newConfig: PipelineConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ config, onSaveConfig }) => {
  const [formData, setFormData] = useState<PipelineConfig>(config);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div id="settings-container" className="max-w-4xl mx-auto space-y-6">
      {/* Settings Header */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <span>Pipeline &amp; Gemini Parameters</span>
          </h2>
          <p className="text-[11px] font-mono text-white/50 mt-1 uppercase tracking-widest">
            Configure Google Gemini AI models, prompt engineering templates, and synthesis rules
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-widest">
            <Check className="w-4 h-4" />
            <span>Parameters Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Models & Performance */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-base flex items-center gap-2 border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Google Gemini Model Allocation</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-1">
                LLM Summarization Engine
              </label>
              <select
                value={formData.llmModel}
                onChange={e => setFormData({ ...formData, llmModel: e.target.value })}
                className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
              >
                <option value="gemini-3.6-flash">gemini-3.6-flash (Recommended Fast)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Reasoning)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Lite)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-1">
                Visual Artwork Generator
              </label>
              <select
                value={formData.imageModel}
                onChange={e => setFormData({ ...formData, imageModel: e.target.value })}
                className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
              >
                <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (High Quality Imagen)</option>
                <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image (Default Lite)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-1">
                Aspect Ratio Format
              </label>
              <select
                value={formData.aspectRatio}
                onChange={e => setFormData({ ...formData, aspectRatio: e.target.value })}
                className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
              >
                <option value="16:9">16:9 Widescreen (Cinematic)</option>
                <option value="4:3">4:3 Standard Editorial</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-1">
                Max Stories Per Briefing
              </label>
              <input
                type="number"
                min={3}
                max={20}
                value={formData.maxStories}
                onChange={e => setFormData({ ...formData, maxStories: parseInt(e.target.value) || 8 })}
                className="w-full bg-black border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Master Prompt Template */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-base flex items-center gap-2 border-b border-white/10 pb-3">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Master Image Generation Template</span>
          </h3>
          <p className="text-[11px] font-mono text-white/50">
            Use <code className="text-amber-400 bg-black px-1.5 py-0.5 border border-white/10">{'{themes}'}</code> as the variable placeholder where today's news topics will be injected.
          </p>

          <textarea
            rows={8}
            value={formData.promptTemplate}
            onChange={e => setFormData({ ...formData, promptTemplate: e.target.value })}
            className="w-full bg-black border border-white/10 p-4 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-white hover:bg-amber-500 text-black font-mono font-bold px-6 py-3 text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Persist Parameters</span>
          </button>
        </div>
      </form>
    </div>
  );
};
