import React, { useState } from 'react';
import { Code, Copy, Check, Terminal, Download, Github, Play, Sparkles } from 'lucide-react';

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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-xl text-slate-100 flex items-center gap-2">
            <Code className="w-5 h-5 text-sky-400" />
            <span>Standalone Python Workflow Script</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pre-configured with <code className="text-sky-400 font-mono">google-genai</code> SDK for Google Gemini image generation, news scraping &amp; HTML output.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'script' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>daily_news.py</span>
            </button>

            <button
              onClick={() => setActiveTab('github')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'github' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Actions Cron</span>
            </button>
          </div>

          <button
            onClick={handleDownloadScript}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .py</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'script' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Google Gemini GenAI SDK Pre-filled (<code className="text-sky-400 font-mono">google.genai</code>)</span>
            </div>

            <button
              onClick={() => handleCopy(pythonCode)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Python Code' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[600px]">
            {pythonCode || '# Loading daily_news.py script...'}
          </pre>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>How to run locally:</span>
            </h4>
            <pre className="text-xs font-mono text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              pip install feedparser requests jinja2 google-genai{'\n'}
              export GEMINI_API_KEY="your_api_key_here"{'\n'}
              python daily_news.py
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Github className="w-4 h-4 text-sky-400" />
                <span>Automated Daily Cron Workflow (.github/workflows/daily.yml)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically runs every day at 08:00 UTC and pushes the new HTML briefing page to GitHub Pages or repository.
              </p>
            </div>

            <button
              onClick={() => handleCopy(githubWorkflowYaml)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied YAML' : 'Copy Workflow'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-sky-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
            {githubWorkflowYaml}
          </pre>
        </div>
      )}
    </div>
  );
};
