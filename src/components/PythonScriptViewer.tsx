import React, { useState } from 'react';
import { Code, Copy, Check, Terminal, Download, Github, Sparkles } from 'lucide-react';

interface PythonScriptViewerProps {
  pythonCode: string;
}

export const PythonScriptViewer: React.FC<PythonScriptViewerProps> = ({ pythonCode }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'github'>('script');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily_news.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  const githubWorkflowYaml = `name: Daily News AI Pipeline

on:
  schedule:
    - cron: '0 8 * * *'  # Runs every day at 08:00 UTC
  workflow_dispatch:      # Allows manual trigger in GitHub Actions

jobs:
  run-pipeline:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Dependencies
        run: |
          pip install feedparser requests jinja2 google-genai

      - name: Execute Daily News Pipeline
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
        run: |
          python daily_news.py

      - name: Commit and Push Output
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'
          git add output/
          git commit -m "Auto-update daily news briefing [skip ci]" || exit 0
          git push
`;

  return (
    <div id="python-viewer-container" className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-500" />
            <span>Standalone Python Pipeline</span>
          </h2>
          <p className="text-[11px] font-mono text-white/50 mt-1 uppercase tracking-widest">
            Pre-configured script powered by <code className="text-amber-400">google-genai</code> SDK for background automation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all ${
                activeTab === 'script' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>daily_news.py</span>
            </button>

            <button
              onClick={() => setActiveTab('github')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-all ${
                activeTab === 'github' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Actions Cron</span>
            </button>
          </div>

          <button
            onClick={handleDownloadScript}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-amber-500 text-black text-[10px] font-mono font-bold uppercase tracking-widest transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .py</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'script' ? (
        <div className="bg-[#0a0a0a] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Google GenAI SDK Integration (<code className="text-amber-300">google.genai</code>)</span>
            </div>

            <button
              onClick={() => handleCopy(pythonCode)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[10px] font-mono font-bold uppercase tracking-widest transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Script' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-5 bg-black border border-white/10 text-xs font-mono text-green-400 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[600px]">
            {pythonCode || '# Loading daily_news.py script...'}
          </pre>

          <div className="bg-black p-5 border border-white/10 space-y-2">
            <h4 className="font-mono text-xs font-bold text-amber-400 flex items-center gap-2 uppercase tracking-widest">
              <Terminal className="w-3.5 h-3.5 text-amber-500" />
              <span>Execution Instructions:</span>
            </h4>
            <pre className="text-xs font-mono text-white/70 bg-[#0a0a0a] p-3 border border-white/10">
              pip install feedparser requests jinja2 google-genai{'\n'}
              export GEMINI_API_KEY="your_api_key_here"{'\n'}
              python daily_news.py
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <Github className="w-4 h-4 text-amber-500" />
                <span>Automated GitHub Actions Cron Workflow</span>
              </h3>
              <p className="text-[11px] font-mono text-white/50 mt-1 uppercase tracking-widest">
                Executes autonomously every day at 08:00 UTC and commits compiled edition outputs
              </p>
            </div>

            <button
              onClick={() => handleCopy(githubWorkflowYaml)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-amber-500 hover:text-black text-white text-[10px] font-mono font-bold uppercase tracking-widest transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Workflow'}</span>
            </button>
          </div>

          <pre className="p-5 bg-black border border-white/10 text-xs font-mono text-amber-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
            {githubWorkflowYaml}
          </pre>
        </div>
      )}
    </div>
  );
};
