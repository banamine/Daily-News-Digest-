import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, Copy, Check, Terminal, FileCode, Zap, Layers, RefreshCw, Globe, Key, Rocket } from 'lucide-react';

export const PrebuildConfigViewer: React.FC = () => {
  const [prebuildData, setPrebuildData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'devcontainer' | 'setup' | 'workflow' | 'deploy' | 'guide'>('deploy');

  const fetchPrebuildStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prebuild/status').then(r => r.json());
      setPrebuildData(res);
    } catch (err) {
      console.error("Failed to fetch prebuild status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrebuildStatus();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div id="prebuild-config-viewer" className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-3 h-3" />
              <span>Codespaces Prebuild Engine Active</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-white">
              GitHub Codespaces Prebuild Specification
            </h2>
            <p className="text-white/60 text-xs font-serif max-w-2xl leading-relaxed">
              Prebuild configurations pre-execute environment setup tasks—installing Node.js, Python 3.11, Playwright browsers, and compiling build artifacts—slashing Codespace boot time from 2+ minutes to under 3 seconds.
            </p>
          </div>

          <button
            onClick={fetchPrebuildStatus}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-amber-500 text-black text-[10px] font-mono font-bold uppercase tracking-widest transition-all self-start md:self-auto shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Verify Environment</span>
          </button>
        </div>

        {/* Readiness Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-black p-4 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">DevContainer Spec</div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5 mt-0.5">
                {prebuildData?.files?.devcontainerJson ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>devcontainer.json</span>
                  </>
                ) : (
                  <span className="text-amber-400">Not Detected</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-black p-4 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">Setup Shell Script</div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5 mt-0.5">
                {prebuildData?.files?.setupScript ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>setup.sh</span>
                  </>
                ) : (
                  <span className="text-amber-400">Not Detected</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-black p-4 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">Prebuild Workflow</div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5 mt-0.5">
                {prebuildData?.files?.codespacesWorkflow ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>codespaces-prebuilds.yml</span>
                  </>
                ) : (
                  <span className="text-amber-400">Not Detected</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-black p-4 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">GitHub Pages CI/CD</div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5 mt-0.5">
                {prebuildData?.files?.deployWorkflow ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>deploy.yml</span>
                  </>
                ) : (
                  <span className="text-amber-400">Not Detected</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Code & Setup Guide Tabs */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <h3 className="font-serif font-bold text-lg text-white">CI/CD Workflows &amp; Deployment Specification</h3>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-black p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('deploy')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all ${
                activeTab === 'deploy'
                  ? 'bg-sky-500 text-black font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              deploy.yml (GitHub Pages)
            </button>
            <button
              onClick={() => setActiveTab('devcontainer')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all ${
                activeTab === 'devcontainer'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              devcontainer.json
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all ${
                activeTab === 'setup'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              setup.sh
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all ${
                activeTab === 'workflow'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              codespaces-prebuilds.yml
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Setup Manual
            </button>
          </div>
        </div>

        {/* Tab 0: deploy.yml (GitHub Pages CI/CD) */}
        {activeTab === 'deploy' && (
          <div className="space-y-6">
            <div className="bg-sky-500/10 border border-sky-500/20 p-4 text-sky-300 flex items-start gap-3">
              <Rocket className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-white block font-mono uppercase tracking-widest text-xs">Automated Daily News GitHub Pages CI/CD Workflow</strong>
                <p className="text-white/70 text-xs font-serif leading-relaxed">
                  This workflow executes <code className="font-mono bg-black px-1.5 py-0.5 text-sky-300 border border-white/10">daily_news.py</code> automatically on a daily cron schedule (<code className="font-mono text-sky-300">0 6 * * *</code>) or manual trigger. It builds <code className="font-mono text-sky-300">index.html</code> with Google Gemini AI summaries &amp; photos and commits the compiled output directly to GitHub Pages: <a href="https://banamine.github.io/Daily-News-Digest-/" target="_blank" rel="noreferrer" className="underline text-sky-400 hover:text-sky-300">https://banamine.github.io/Daily-News-Digest-/</a>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/50">
                <span>Path: <code className="text-sky-400 font-mono bg-black px-2 py-0.5 border border-white/10">/.github/workflows/deploy.yml</code></span>
                <button
                  onClick={() => handleCopy(prebuildData?.config?.deployYaml || '', 'deploy')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-black hover:bg-white/10 text-white border border-white/10 transition-colors"
                >
                  {copiedFile === 'deploy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'deploy' ? 'Copied Deploy Workflow' : 'Copy File'}</span>
                </button>
              </div>
              <pre className="bg-black p-4 border border-white/10 font-mono text-xs text-sky-200/90 overflow-x-auto max-h-96 leading-relaxed">
                {prebuildData?.config?.deployYaml || '# deploy.yml created'}
              </pre>
            </div>

            {/* Quick 2-Step GitHub Repository Setup Guide */}
            <div className="p-4 bg-black border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
                <Key className="w-4 h-4 text-amber-400" />
                <span>GitHub Repository Setup Checklist</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#0a0a0a] p-3 border border-white/10 space-y-1">
                  <div className="text-amber-400 font-mono font-bold text-[11px]">1. Add GEMINI_API_KEY Secret</div>
                  <p className="text-white/60 text-[11px] font-serif">
                    Go to <a href="https://github.com/banamine/Daily-News-Digest-/settings/secrets/actions" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">Repo Settings &rarr; Secrets &amp; Variables &rarr; Actions</a>. Add <code className="text-amber-300 font-mono">GEMINI_API_KEY</code> with your Google AI Studio key.
                  </p>
                </div>
                <div className="bg-[#0a0a0a] p-3 border border-white/10 space-y-1">
                  <div className="text-emerald-400 font-mono font-bold text-[11px]">2. Enable GitHub Pages</div>
                  <p className="text-white/60 text-[11px] font-serif">
                    Go to <a href="https://github.com/banamine/Daily-News-Digest-/settings/pages" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">Repo Settings &rarr; Pages</a>. Set Source to <strong>Deploy from a branch</strong>, select branch <code className="text-emerald-300 font-mono">main</code> and root folder <code className="text-emerald-300 font-mono">/ (root)</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: devcontainer.json */}
        {activeTab === 'devcontainer' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/50">
              <span>Path: <code className="text-amber-400 font-mono bg-black px-2 py-0.5 border border-white/10">/.devcontainer/devcontainer.json</code></span>
              <button
                onClick={() => handleCopy(JSON.stringify(prebuildData?.config?.devcontainerJson, null, 2) || '', 'devcontainer')}
                className="flex items-center gap-1.5 px-3 py-1 bg-black hover:bg-white/10 text-white border border-white/10 transition-colors"
              >
                {copiedFile === 'devcontainer' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile === 'devcontainer' ? 'Copied JSON' : 'Copy File'}</span>
              </button>
            </div>
            <pre className="bg-black p-4 border border-white/10 font-mono text-xs text-amber-200/90 overflow-x-auto max-h-96 leading-relaxed">
              {JSON.stringify(prebuildData?.config?.devcontainerJson, null, 2) || '// devcontainer.json not loaded'}
            </pre>
          </div>
        )}

        {/* Tab 2: setup.sh */}
        {activeTab === 'setup' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/50">
              <span>Path: <code className="text-amber-400 font-mono bg-black px-2 py-0.5 border border-white/10">/.devcontainer/setup.sh</code></span>
              <button
                onClick={() => handleCopy(prebuildData?.config?.setupScript || '', 'setup')}
                className="flex items-center gap-1.5 px-3 py-1 bg-black hover:bg-white/10 text-white border border-white/10 transition-colors"
              >
                {copiedFile === 'setup' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile === 'setup' ? 'Copied Script' : 'Copy File'}</span>
              </button>
            </div>
            <pre className="bg-black p-4 border border-white/10 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-96 leading-relaxed">
              {prebuildData?.config?.setupScript || '# setup.sh not loaded'}
            </pre>
          </div>
        )}

        {/* Tab 3: codespaces-prebuilds.yml */}
        {activeTab === 'workflow' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/50">
              <span>Path: <code className="text-amber-400 font-mono bg-black px-2 py-0.5 border border-white/10">/.github/workflows/codespaces-prebuilds.yml</code></span>
              <button
                onClick={() => handleCopy(prebuildData?.config?.workflowYaml || '', 'workflow')}
                className="flex items-center gap-1.5 px-3 py-1 bg-black hover:bg-white/10 text-white border border-white/10 transition-colors"
              >
                {copiedFile === 'workflow' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile === 'workflow' ? 'Copied Workflow' : 'Copy File'}</span>
              </button>
            </div>
            <pre className="bg-black p-4 border border-white/10 font-mono text-xs text-amber-200/90 overflow-x-auto max-h-96 leading-relaxed">
              {prebuildData?.config?.workflowYaml || '# workflow not loaded'}
            </pre>
          </div>
        )}

        {/* Tab 4: Step by Step Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-6 text-xs text-white/80">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 text-amber-300 flex items-start gap-3">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-mono uppercase tracking-widest text-[11px] mb-1">Codespaces Prebuild Mechanics</strong>
                When pushing changes or setting up a prebuild configuration, GitHub generates a warm container image containing all Node modules, Python dependencies (<code className="font-mono bg-black px-1">feedparser</code>, <code className="font-mono bg-black px-1">jinja2</code>, <code className="font-mono bg-black px-1">google-genai</code>), Playwright browser binaries, and compiled server assets ready to execute.
              </div>
            </div>

            <ol className="space-y-4 font-normal">
              <li className="flex items-start gap-3 bg-black p-4 border border-white/10">
                <div className="w-6 h-6 bg-amber-500 text-black flex items-center justify-center font-mono font-bold text-xs shrink-0">1</div>
                <div>
                  <h4 className="font-mono font-bold uppercase tracking-widest text-white text-[11px]">Commit &amp; Push Prebuild Configuration Files</h4>
                  <p className="text-white/50 text-xs font-serif mt-1">
                    Ensure <code className="text-amber-400 bg-[#0a0a0a] px-1.5 py-0.5 border border-white/10 font-mono text-[10px]">.devcontainer/devcontainer.json</code>, <code className="text-amber-400 bg-[#0a0a0a] px-1.5 py-0.5 border border-white/10 font-mono text-[10px]">.devcontainer/setup.sh</code>, and <code className="text-amber-400 bg-[#0a0a0a] px-1.5 py-0.5 border border-white/10 font-mono text-[10px]">.github/workflows/codespaces-prebuilds.yml</code> are committed to your repository's default branch (<code className="text-white font-mono">main</code>).
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-black p-4 border border-white/10">
                <div className="w-6 h-6 bg-amber-500 text-black flex items-center justify-center font-mono font-bold text-xs shrink-0">2</div>
                <div>
                  <h4 className="font-mono font-bold uppercase tracking-widest text-white text-[11px]">Enable Prebuilds in GitHub Repository Settings</h4>
                  <p className="text-white/50 text-xs font-serif mt-1">
                    On GitHub.com, navigate to <strong>Settings</strong> &rarr; <strong>Codespaces</strong> &rarr; <strong>Set up prebuild</strong>.
                  </p>
                  <div className="mt-2 text-[10px] bg-[#0a0a0a] p-2.5 border border-white/10 text-white/70 font-mono uppercase tracking-widest">
                    GitHub Repo &rarr; Settings &rarr; Codespaces &rarr; Set up prebuild &rarr; Select branch: main
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-black p-4 border border-white/10">
                <div className="w-6 h-6 bg-amber-500 text-black flex items-center justify-center font-mono font-bold text-xs shrink-0">3</div>
                <div>
                  <h4 className="font-mono font-bold uppercase tracking-widest text-white text-[11px]">Instant 2-Second Codespace Boot Sequence</h4>
                  <p className="text-white/50 text-xs font-serif mt-1">
                    When anyone opens a new Codespace from this repository, GitHub loads the prebuilt image instantly—bypassing lengthy package compilation and environment initialization steps.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

