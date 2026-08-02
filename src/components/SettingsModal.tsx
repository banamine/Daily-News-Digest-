import React, { useState } from 'react';
import { Settings, Save, Sparkles, Image, Clock, FileText, Check } from 'lucide-react';
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-xl text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" />
            <span>Pipeline &amp; Gemini Model Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure Gemini AI models, prompts, image resolution, and automated daily schedule.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Check className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Models & Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Google Gemini Models</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                LLM Summarization Model
              </label>
              <select
                value={formData.llmModel}
                onChange={e => setFormData({ ...formData, llmModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="gemini-3.6-flash">gemini-3.6-flash (Recommended Fast)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Reasoning)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Lite)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Image Generation Model
              </label>
              <select
                value={formData.imageModel}
                onChange={e => setFormData({ ...formData, imageModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (High Quality Imagen)</option>
                <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image (Default Lite)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Aspect Ratio
              </label>
              <select
                value={formData.aspectRatio}
                onChange={e => setFormData({ ...formData, aspectRatio: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="16:9">16:9 Widescreen (Cinematic)</option>
                <option value="4:3">4:3 Standard</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Max Stories Per Briefing
              </label>
              <input
                type="number"
                min={3}
                max={20}
                value={formData.maxStories}
                onChange={e => setFormData({ ...formData, maxStories: parseInt(e.target.value) || 8 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Master Prompt Template */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Master Image Generation Prompt Template</span>
          </h3>
          <p className="text-xs text-slate-400">
            Use <code className="text-sky-400 font-mono bg-slate-950 px-1 py-0.5 rounded">{'{themes}'}</code> as the placeholder where today's summarized news themes will be injected.
          </p>

          <textarea
            rows={8}
            value={formData.promptTemplate}
            onChange={e => setFormData({ ...formData, promptTemplate: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500 transition-colors leading-relaxed"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-sky-500/20 active:scale-98 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
