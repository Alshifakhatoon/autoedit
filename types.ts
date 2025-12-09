export interface Caption {
  startTime: number;
  endTime: number;
  text: string;
}

export interface BRollSegment {
  id: string;
  startTime: number;
  endTime: number;
  description: string;
  imagePrompt: string;
  generatedImageUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

export interface VideoAnalysisResult {
  captions: Caption[];
  bRoll: BRollSegment[];
  summary: string;
  title: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  EDITING = 'EDITING',
}
