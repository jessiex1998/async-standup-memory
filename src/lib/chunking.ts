import { ContentChunk } from '@/types';

export function chunkText(
  text: string,
  entryId: string,
  memberId: string,
  date: string,
  source: 'standup' | 'github'
): ContentChunk[] {
  const sentences = text.split(/(?<=[.!?])\s+|\n+/).filter(s => s.trim().length > 5);
  const chunks: ContentChunk[] = [];
  let buffer = '';
  let idx = 0;

  for (const sentence of sentences) {
    if (buffer.length + sentence.length > 800 && buffer.length >= 200) {
      chunks.push({
        id: `chunk-${entryId}-${idx}`,
        entryId,
        memberId,
        date,
        chunkText: buffer.trim(),
        orderIndex: idx,
        source,
      });
      buffer = '';
      idx++;
    }
    buffer += (buffer ? ' ' : '') + sentence.trim();
  }

  if (buffer.trim()) {
    chunks.push({
      id: `chunk-${entryId}-${idx}`,
      entryId,
      memberId,
      date,
      chunkText: buffer.trim(),
      orderIndex: idx,
      source,
    });
  }

  return chunks;
}
