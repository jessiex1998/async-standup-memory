export interface Member {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface StandupEntry {
  id: string;
  memberId: string;
  date: string;
  inputType: 'audio' | 'video' | 'text' | 'github';
  transcriptText: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface ContentChunk {
  id: string;
  entryId: string;
  memberId: string;
  date: string;
  chunkText: string;
  orderIndex: number;
  source: 'standup' | 'github';
}

export interface ExtractedUpdate {
  id: string;
  entryId: string;
  memberId: string;
  date: string;
  yesterday: string[];
  today: string[];
  blockers: string[];
  risks: string[];
  evidenceChunkIds: string[];
}

export interface Integration {
  id: string;
  provider: 'hyperspell-github' | 'hyperspell-notion';
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  accountLabel?: string;
}

export interface DuplicationAlert {
  id: string;
  description: string;
  memberIds: string[];
  evidenceChunkIds: string[];
  items: string[];
}

export interface ConflictAlert {
  id: string;
  description: string;
  memberIds: string[];
  evidenceChunkIds: string[];
  statements: [string, string];
}

export interface SearchResult {
  chunk: ContentChunk;
  memberName: string;
  relevance: number;
  update?: ExtractedUpdate;
}
