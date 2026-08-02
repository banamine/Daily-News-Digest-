import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BriefingViewer } from './components/BriefingViewer';
import { FeedManager } from './components/FeedManager';
import { LiveFeedExplorer } from './components/LiveFeedExplorer';
import { ArchiveBrowser } from './components/ArchiveBrowser';
import { SettingsModal } from './components/SettingsModal';
import { PythonScriptViewer } from './components/PythonScriptViewer';
import { PipelineRunnerModal } from './components/PipelineRunnerModal';
import { ScraperStrategyViewer } from './components/ScraperStrategyViewer';
import { PrebuildConfigViewer } from './components/PrebuildConfigViewer';
import { BriefingData, RSSFeed, PipelineConfig, PipelineRunStatus, PipelineStep } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'briefing' | 'live-feeds' | 'scraper' | 'feeds' | 'archive' | 'python' | 'prebuilds' | 'settings'>('briefing');
  const [currentBriefing, setCurrentBriefing] = useState<BriefingData | null>(null);
  const [briefingsList, setBriefingsList] = useState<BriefingData[]>([]);
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [config, setConfig] = useState<PipelineConfig>({
    maxStories: 8,
    llmModel: 'gemini-3.6-flash',
    imageModel: 'gemini-3.1-flash-image',
    aspectRatio: '16:9',
    imageSize: '1K',
    autoSchedule: true,
    scheduleTime: '08:00',
    promptTemplate: '',
    systemInstruction: ''
  });
  const [pythonCode, setPythonCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [autoOpenExport, setAutoOpenExport] = useState<boolean>(false);

  // Pipeline execution modal status
  const [pipelineStatus, setPipelineStatus] = useState<PipelineRunStatus>({
    isRunning: false,
    currentStepIndex: 0,
    steps: [
      { id: '1', name: '1. News Fetcher (RSS Scraping)', status: 'pending', message: 'Ready to connect to active RSS feeds' },
      { id: '2', name: '2. Summarizer (Gemini LLM)', status: 'pending', message: 'Generates factual 2-4 sentence neutral summaries' },
      { id: '3', name: '3. Prompt Builder (Rich Template)', status: 'pending', message: 'Injects themes into cinematic image prompt' },
      { id: '4', name: '4. Image Generator (Gemini Imagen)', status: 'pending', message: 'Calls Google Gemini Image API for high-res illustration' },
      { id: '5', name: '5. Page Builder & Publisher', status: 'pending', message: 'Assembles dark HTML briefing and updates archive' }
    ]
  });

  // Load initial data from backend API
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statusRes, feedsRes, configRes, briefingsRes, pyRes] = await Promise.all([
        fetch('/api/status').then(r => r.json()),
        fetch('/api/feeds').then(r => r.json()),
        fetch('/api/config').then(r => r.json()),
        fetch('/api/briefings').then(r => r.json()),
        fetch('/api/python-script').then(r => r.json())
      ]);

      if (Array.isArray(feedsRes)) setFeeds(feedsRes);
      if (configRes) setConfig(configRes);
      if (Array.isArray(briefingsRes) && briefingsRes.length > 0) {
        setBriefingsList(briefingsRes);
        setCurrentBriefing(briefingsRes[0]);
      }
      if (pyRes?.code) setPythonCode(pyRes.code);
    } catch (err) {
      console.error("Error loading initial data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Run full daily news pipeline
  const handleRunPipeline = async () => {
    const initialSteps: PipelineStep[] = [
      { id: '1', name: '1. News Fetcher (RSS Scraping)', status: 'running', message: 'Connecting to configured RSS feeds...' },
      { id: '2', name: '2. Summarizer (Gemini LLM)', status: 'pending', message: 'Waiting for articles...' },
      { id: '3', name: '3. Prompt Builder (Rich Template)', status: 'pending', message: 'Waiting for summaries...' },
      { id: '4', name: '4. Image Generator (Gemini Imagen)', status: 'pending', message: 'Waiting for prompt...' },
      { id: '5', name: '5. Page Builder & Publisher', status: 'pending', message: 'Waiting for image & summaries...' }
    ];

    setPipelineStatus({
      isRunning: true,
      currentStepIndex: 0,
      steps: initialSteps
    });

    try {
      // Step 1 simulated progress while server fetches feeds
      await new Promise(r => setTimeout(r, 800));
      initialSteps[0].status = 'completed';
      initialSteps[0].message = `Collected top stories from ${feeds.filter(f => f.enabled).length} news feeds`;
      initialSteps[1].status = 'running';
      initialSteps[1].message = `Sending stories to Google Gemini (${config.llmModel})...`;
      setPipelineStatus({ isRunning: true, currentStepIndex: 1, steps: [...initialSteps] });

      // Trigger backend Express execution endpoint
      const response = await fetch('/api/pipeline/run', { method: 'POST' });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Pipeline execution failed');
      }

      // Step 2 Completed
      initialSteps[1].status = 'completed';
      initialSteps[1].message = `Summaries generated successfully via Gemini AI`;
      initialSteps[2].status = 'running';
      initialSteps[2].message = `Injecting summaries into master prompt template...`;
      setPipelineStatus({ isRunning: true, currentStepIndex: 2, steps: [...initialSteps] });

      await new Promise(r => setTimeout(r, 600));

      // Step 3 Completed
      initialSteps[2].status = 'completed';
      initialSteps[2].message = `Rich cinematic prompt created`;
      initialSteps[3].status = 'running';
      initialSteps[3].message = `Calling Google Gemini Image Model (${config.imageModel})...`;
      setPipelineStatus({ isRunning: true, currentStepIndex: 3, steps: [...initialSteps] });

      await new Promise(r => setTimeout(r, 1200));

      // Step 4 Completed
      initialSteps[3].status = 'completed';
      initialSteps[3].message = `Cinematic illustration generated & saved`;
      initialSteps[4].status = 'running';
      initialSteps[4].message = `Rendering HTML briefing page and saving archive...`;
      setPipelineStatus({ isRunning: true, currentStepIndex: 4, steps: [...initialSteps] });

      await new Promise(r => setTimeout(r, 600));

      // Step 5 Completed
      initialSteps[4].status = 'completed';
      initialSteps[4].message = `Page compiled & saved to output/${data.briefing.date}/index.html`;

      setPipelineStatus({
        isRunning: false,
        currentStepIndex: 4,
        steps: [...initialSteps]
      });

      // Update current state
      setCurrentBriefing(data.briefing);
      setBriefingsList(prev => [data.briefing, ...prev.filter(b => b.date !== data.briefing.date)]);
      setActiveTab('briefing');

    } catch (err: any) {
      console.error("Pipeline run error:", err);
      const failedSteps = [...pipelineStatus.steps];
      const curIdx = pipelineStatus.currentStepIndex;
      if (failedSteps[curIdx]) {
        failedSteps[curIdx].status = 'error';
        failedSteps[curIdx].message = err.message || 'Error occurred during execution';
      }
      setPipelineStatus({
        isRunning: false,
        currentStepIndex: curIdx,
        steps: failedSteps
      });
    }
  };

  // Feed Actions
  const handleToggleFeed = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/feeds/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      }).then(r => r.json());

      setFeeds(prev => prev.map(f => f.id === id ? res : f));
    } catch (err) {
      console.error("Failed to toggle feed:", err);
    }
  };

  const handleAddFeed = async (name: string, url: string, category: any) => {
    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, category })
      }).then(r => r.json());

      setFeeds(prev => [...prev, res]);
    } catch (err) {
      console.error("Failed to add feed:", err);
    }
  };

  const handleDeleteFeed = async (id: string) => {
    try {
      await fetch(`/api/feeds/${id}`, { method: 'DELETE' });
      setFeeds(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error("Failed to delete feed:", err);
    }
  };

  // Config Action
  const handleSaveConfig = async (newConfig: PipelineConfig) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      }).then(r => r.json());

      setConfig(res);
    } catch (err) {
      console.error("Failed to save config:", err);
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'live-feeds') setAutoOpenExport(false);
        }}
        onRunPipeline={handleRunPipeline}
        onOpenExportPage={() => {
          setActiveTab('live-feeds');
          setAutoOpenExport(true);
        }}
        isRunning={pipelineStatus.isRunning}
        lastRunDate={currentBriefing?.date || null}
        activeFeedsCount={feeds.filter(f => f.enabled).length}
      />

      {/* Main Body */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {activeTab === 'briefing' && (
          <BriefingViewer
            briefing={currentBriefing}
            onRefresh={loadData}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'live-feeds' && (
          <LiveFeedExplorer
            feeds={feeds}
            initialOpenExportDrawer={autoOpenExport}
          />
        )}

        {activeTab === 'scraper' && (
          <ScraperStrategyViewer />
        )}

        {activeTab === 'feeds' && (
          <FeedManager
            feeds={feeds}
            onToggleFeed={handleToggleFeed}
            onAddFeed={handleAddFeed}
            onDeleteFeed={handleDeleteFeed}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveBrowser
            briefings={briefingsList}
            onSelectBriefing={(b) => {
              setCurrentBriefing(b);
              setActiveTab('briefing');
            }}
          />
        )}

        {activeTab === 'python' && (
          <PythonScriptViewer
            pythonCode={pythonCode}
          />
        )}

        {activeTab === 'prebuilds' && (
          <PrebuildConfigViewer />
        )}

        {activeTab === 'settings' && (
          <SettingsModal
            config={config}
            onSaveConfig={handleSaveConfig}
          />
        )}
      </main>

      {/* Pipeline Execution Modal */}
      <PipelineRunnerModal
        status={pipelineStatus}
        onClose={() => {
          setPipelineStatus(prev => ({
            ...prev,
            isRunning: false,
            steps: prev.steps.map(s => ({ ...s, status: 'pending' }))
          }));
        }}
      />

      {/* Minimal Footer */}
      <footer id="app-footer" className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <p>Daily Automated News Digest &amp; Cinematic Image Generator &bull; Powered by Google Gemini AI</p>
      </footer>
    </div>
  );
}
