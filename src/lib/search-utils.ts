import { ContentChunk, SearchResult, ExtractedUpdate, Member } from '@/types';

export function searchChunks(
  query: string,
  chunks: ContentChunk[],
  updates: ExtractedUpdate[],
  members: Member[],
  filters?: { memberId?: string; source?: string; date?: string },
  alpha?: number
): SearchResult[] {
  if (!query.trim()) return [];

  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  let filtered = chunks;

  if (filters?.memberId) filtered = filtered.filter(c => c.memberId === filters.memberId);
  if (filters?.source) filtered = filtered.filter(c => c.source === filters.source);
  if (filters?.date) filtered = filtered.filter(c => c.date === filters.date);

  const results: SearchResult[] = [];

  for (const chunk of filtered) {
    const cl = chunk.chunkText.toLowerCase();
    const matches = queryWords.filter(w => cl.includes(w));
    if (matches.length === 0) continue;

    const keywordScore = matches.length / queryWords.length;
    const semanticScore = Math.min(1, keywordScore * 1.2);
    const a = alpha ?? 0.3;
    const score = (1 - a) * keywordScore + a * semanticScore;

    const member = members.find(m => m.id === chunk.memberId);
    const update = updates.find(u => u.memberId === chunk.memberId && u.date === chunk.date);

    results.push({
      chunk,
      memberName: member?.name || chunk.memberId,
      relevance: score,
      update,
    });
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 20);
}
