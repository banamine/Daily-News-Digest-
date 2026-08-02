export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  summary: string;
  published: string;
  feedName?: string;
  feedId?: string;
  category?: string;
  author?: string;
  ingestionType?: 'rss' | 'scraper';
  sourceGroup?: 'rss' | 'scraped';
  imageUrl?: string;
}

export interface CustomFeedPreset {
  id: string;
  name: string;
  feedIds: string[];
}

export interface StorySummary {
  headline: string;
  summary: string;
  category?: string;
  keyThemes?: string[];
}

export interface BriefingData {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  articles: NewsArticle[];
  summaries: StorySummary[];
  rawSummaryText: string;
  imagePrompt: string;
  imageUrl: string; // base64 or path
  collageImages?: string[];
  collageMode?: 'collage' | 'ai';
  htmlContent: string;
  sourcesCount: number;
  status: 'completed' | 'failed';
  error?: string;
}

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: 'Global' | 'Tech' | 'Alternative' | 'Finance' | 'Custom';
  enabled: boolean;
  lastFetched?: string;
  status?: 'active' | 'error';
}

export interface PipelineConfig {
  maxStories: number;
  llmModel: string;
  imageModel: string;
  aspectRatio: string;
  imageSize: string;
  autoSchedule: boolean;
  scheduleTime: string; // e.g. "08:00"
  promptTemplate: string;
  systemInstruction: string;
}

export interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  timestamp?: string;
  detail?: any;
}

export interface PipelineRunStatus {
  isRunning: boolean;
  currentStepIndex: number;
  steps: PipelineStep[];
  lastRunDate?: string;
  nextRunDate?: string;
}
