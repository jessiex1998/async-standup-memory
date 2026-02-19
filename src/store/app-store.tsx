import React, { createContext, useContext, useState, useCallback } from 'react';
import { Member, StandupEntry, ContentChunk, ExtractedUpdate, Integration, DuplicationAlert, ConflictAlert, SearchResult } from '@/types';
import { demoTeam } from '@/data/demo-team';
import { demoStandups } from '@/data/demo-standups';
import { demoGithub } from '@/data/demo-github';
import { chunkText } from '@/lib/chunking';
import { extractFromTranscript, detectDuplications, detectConflicts } from '@/lib/extraction';
import { searchChunks } from '@/lib/search-utils';

interface AppState {
  mode: 'demo' | 'live';
  date: string;
  members: Member[];
  entries: StandupEntry[];
  chunks: ContentChunk[];
  updates: ExtractedUpdate[];
  integrations: Integration[];
  duplications: DuplicationAlert[];
  conflicts: ConflictAlert[];
  demoLoaded: boolean;
  extractionRun: boolean;
}

interface AppContextType extends AppState {
  setMode: (mode: 'demo' | 'live') => void;
  setDate: (date: string) => void;
  loadDemoData: () => void;
  addMember: (name: string, role: string) => void;
  submitStandup: (memberId: string, text: string, inputType: StandupEntry['inputType']) => void;
  fetchGithub: (memberId: string) => void;
  runExtraction: () => void;
  connectIntegration: (provider: Integration['provider']) => void;
  disconnectIntegration: (provider: Integration['provider']) => void;
  search: (query: string, filters?: { memberId?: string; source?: string; date?: string }, alpha?: number) => SearchResult[];
  getMemberEntries: (memberId: string) => StandupEntry[];
  getMemberUpdate: (memberId: string) => ExtractedUpdate | undefined;
}

const initialState: AppState = {
  mode: 'demo',
  date: '2026-02-18',
  members: [],
  entries: [],
  chunks: [],
  updates: [],
  integrations: [
    { id: 'int-gh', provider: 'hyperspell-github', status: 'disconnected' },
    { id: 'int-notion', provider: 'hyperspell-notion', status: 'disconnected' },
  ],
  duplications: [],
  conflicts: [],
  demoLoaded: false,
  extractionRun: false,
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const loadDemoData = useCallback(() => {
    setState(prev => {
      const members: Member[] = demoTeam.map(m => ({ ...m }));
      const entries: StandupEntry[] = [];
      const chunks: ContentChunk[] = [];

      for (const ds of demoStandups) {
        const entryId = `entry-standup-${ds.memberId}-${ds.date}`;
        entries.push({
          id: entryId,
          memberId: ds.memberId,
          date: ds.date,
          inputType: 'text',
          transcriptText: ds.transcriptText,
          createdAt: new Date().toISOString(),
        });
        chunks.push(...chunkText(ds.transcriptText, entryId, ds.memberId, ds.date, 'standup'));
      }

      for (const dg of demoGithub) {
        const entryId = `entry-github-${dg.memberId}-${dg.date}`;
        entries.push({
          id: entryId,
          memberId: dg.memberId,
          date: dg.date,
          inputType: 'github',
          transcriptText: dg.summaryText,
          createdAt: new Date().toISOString(),
        });
        chunks.push(...chunkText(dg.summaryText, entryId, dg.memberId, dg.date, 'github'));
      }

      return { ...prev, members, entries, chunks, demoLoaded: true, updates: [], duplications: [], conflicts: [], extractionRun: false };
    });
  }, []);

  const addMember = useCallback((name: string, role: string) => {
    setState(prev => ({
      ...prev,
      members: [...prev.members, { id: `m-${Date.now()}`, name, role }],
    }));
  }, []);

  const submitStandup = useCallback((memberId: string, text: string, inputType: StandupEntry['inputType']) => {
    setState(prev => {
      const entryId = `entry-${inputType}-${memberId}-${Date.now()}`;
      const entry: StandupEntry = { id: entryId, memberId, date: prev.date, inputType, transcriptText: text, createdAt: new Date().toISOString() };
      const newChunks = chunkText(text, entryId, memberId, prev.date, inputType === 'github' ? 'github' : 'standup');
      return { ...prev, entries: [...prev.entries, entry], chunks: [...prev.chunks, ...newChunks] };
    });
  }, []);

  const fetchGithub = useCallback((memberId: string) => {
    setState(prev => {
      const ghData = demoGithub.find(g => g.memberId === memberId);
      if (!ghData) return prev;
      const entryId = `entry-github-${memberId}-${Date.now()}`;
      const entry: StandupEntry = { id: entryId, memberId, date: prev.date, inputType: 'github', transcriptText: ghData.summaryText, createdAt: new Date().toISOString() };
      const newChunks = chunkText(ghData.summaryText, entryId, memberId, prev.date, 'github');
      return { ...prev, entries: [...prev.entries, entry], chunks: [...prev.chunks, ...newChunks] };
    });
  }, []);

  const runExtraction = useCallback(() => {
    setState(prev => {
      const updates: ExtractedUpdate[] = [];
      for (const member of prev.members) {
        const memberEntries = prev.entries.filter(e => e.memberId === member.id && e.date === prev.date && e.inputType !== 'github');
        if (memberEntries.length === 0) continue;
        const fullTranscript = memberEntries.map(e => e.transcriptText).join('\n\n');
        updates.push(extractFromTranscript(member.id, prev.date, memberEntries[0].id, fullTranscript, prev.chunks));
      }
      const duplications = detectDuplications(updates, prev.chunks, prev.members);
      const conflicts = detectConflicts(updates, prev.chunks, prev.members);
      return { ...prev, updates, duplications, conflicts, extractionRun: true };
    });
  }, []);

  const connectIntegration = useCallback((provider: Integration['provider']) => {
    setState(prev => ({
      ...prev,
      integrations: prev.integrations.map(i =>
        i.provider === provider
          ? { ...i, status: 'connected' as const, accountLabel: provider.includes('github') ? 'Demo GitHub' : 'Demo Notion' }
          : i
      ),
    }));
  }, []);

  const disconnectIntegration = useCallback((provider: Integration['provider']) => {
    setState(prev => ({
      ...prev,
      integrations: prev.integrations.map(i =>
        i.provider === provider ? { ...i, status: 'disconnected' as const, accountLabel: undefined } : i
      ),
    }));
  }, []);

  const search = useCallback((query: string, filters?: { memberId?: string; source?: string; date?: string }, alpha?: number): SearchResult[] => {
    return searchChunks(query, state.chunks, state.updates, state.members, filters, alpha);
  }, [state.chunks, state.updates, state.members]);

  const getMemberEntries = useCallback((memberId: string) => {
    return state.entries.filter(e => e.memberId === memberId && e.date === state.date);
  }, [state.entries, state.date]);

  const getMemberUpdate = useCallback((memberId: string) => {
    return state.updates.find(u => u.memberId === memberId && u.date === state.date);
  }, [state.updates, state.date]);

  const setMode = useCallback((mode: 'demo' | 'live') => setState(prev => ({ ...prev, mode })), []);
  const setDate = useCallback((date: string) => setState(prev => ({ ...prev, date })), []);

  return (
    <AppContext.Provider value={{
      ...state, setMode, setDate, loadDemoData, addMember, submitStandup,
      fetchGithub, runExtraction, connectIntegration, disconnectIntegration,
      search, getMemberEntries, getMemberUpdate,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
