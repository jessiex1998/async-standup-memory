import { ContentChunk, ExtractedUpdate, DuplicationAlert, ConflictAlert, Member } from '@/types';

export function extractFromTranscript(
  memberId: string,
  date: string,
  entryId: string,
  transcriptText: string,
  chunks: ContentChunk[]
): ExtractedUpdate {
  const memberChunks = chunks.filter(c => c.memberId === memberId && c.date === date);
  const lines = transcriptText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let section: 'yesterday' | 'today' | 'blockers' = 'yesterday';
  const yesterday: string[] = [];
  const today: string[] = [];
  const blockers: string[] = [];
  let currentItem = '';

  function pushItem() {
    if (!currentItem.trim()) return;
    const target = section === 'yesterday' ? yesterday : section === 'today' ? today : blockers;
    target.push(currentItem.trim());
    currentItem = '';
  }

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.startsWith('today ') || lower.startsWith('today i')) {
      pushItem();
      section = 'today';
      currentItem = line;
      continue;
    }
    if (lower.startsWith('blocker') || lower.startsWith('i still don') || lower.includes('blocked on')) {
      pushItem();
      section = 'blockers';
      currentItem = line;
      continue;
    }

    if (isNewItem(line)) {
      pushItem();
      currentItem = line;
    } else {
      currentItem += ' ' + line;
    }
  }
  pushItem();

  const evidenceChunkIds = findEvidenceChunks([...yesterday, ...today, ...blockers], memberChunks);

  return {
    id: `update-${memberId}-${date}`,
    entryId,
    memberId,
    date,
    yesterday,
    today,
    blockers,
    risks: [],
    evidenceChunkIds,
  };
}

function isNewItem(line: string): boolean {
  return /^(First|Second|Third|Finally|Separately|And I|I also|I'll also|I need|I want|I got|I tried|I wrote|I tested|I looked|I created|I added|I updated|I prototyped|I fixed|I helped|I reviewed|I drafted|I collected|I aligned|If we|The main|None)/i.test(line);
}

function findEvidenceChunks(items: string[], chunks: ContentChunk[]): string[] {
  const ids = new Set<string>();
  for (const item of items) {
    const words = item.toLowerCase().split(/\W+/).filter(w => w.length > 4);
    for (const chunk of chunks) {
      const cl = chunk.chunkText.toLowerCase();
      const matches = words.filter(w => cl.includes(w));
      if (matches.length >= 2) {
        ids.add(chunk.id);
      }
    }
  }
  return Array.from(ids);
}

const STOP = new Set(['also', 'that', 'this', 'with', 'from', 'into', 'when', 'then', 'have', 'will', 'would', 'should', 'could', 'about', 'their', 'there', 'these', 'those', 'some', 'been', 'being', 'does', 'doing', 'each', 'after', 'before', 'where', 'which', 'while', 'between', 'same', 'other', 'more', 'most', 'just', 'still', 'need', 'want', 'make', 'like', 'very', 'well', 'back', 'only', 'even', 'because', 'don\'t']);

function getSignificantWords(text: string): Set<string> {
  return new Set(
    text.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !STOP.has(w))
  );
}

export function detectDuplications(
  updates: ExtractedUpdate[],
  chunks: ContentChunk[],
  members: Member[]
): DuplicationAlert[] {
  const alerts: DuplicationAlert[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < updates.length; i++) {
    for (let j = i + 1; j < updates.length; j++) {
      const pairKey = [updates[i].memberId, updates[j].memberId].sort().join('-');
      if (seen.has(pairKey)) continue;

      for (const itemA of updates[i].today) {
        const wordsA = getSignificantWords(itemA);
        for (const itemB of updates[j].today) {
          const wordsB = getSignificantWords(itemB);
          const shared = [...wordsA].filter(w => wordsB.has(w));
          if (shared.length >= 3 && !seen.has(pairKey)) {
            seen.add(pairKey);
            const mA = members.find(m => m.id === updates[i].memberId)?.name ?? updates[i].memberId;
            const mB = members.find(m => m.id === updates[j].memberId)?.name ?? updates[j].memberId;
            alerts.push({
              id: `dup-${pairKey}`,
              description: `${mA} and ${mB} may have overlapping work: ${shared.slice(0, 4).join(', ')}`,
              memberIds: [updates[i].memberId, updates[j].memberId],
              evidenceChunkIds: [...updates[i].evidenceChunkIds.slice(0, 2), ...updates[j].evidenceChunkIds.slice(0, 2)],
              items: [itemA, itemB],
            });
          }
        }
      }
    }
  }
  return alerts.slice(0, 5);
}

export function detectConflicts(
  updates: ExtractedUpdate[],
  _chunks: ContentChunk[],
  members: Member[]
): ConflictAlert[] {
  const alerts: ConflictAlert[] = [];

  const allItems = updates.flatMap(u => [
    ...u.yesterday.map(text => ({ memberId: u.memberId, text })),
    ...u.today.map(text => ({ memberId: u.memberId, text })),
    ...u.blockers.map(text => ({ memberId: u.memberId, text })),
  ]);

  const rateLimitItems = allItems.filter(i =>
    i.text.toLowerCase().includes('rate limit') ||
    i.text.toLowerCase().includes('429')
  );

  const ownCause = rateLimitItems.filter(i =>
    i.text.toLowerCase().includes('caused by our') ||
    i.text.toLowerCase().includes('our own retries')
  );
  const externalCause = rateLimitItems.filter(i =>
    i.text.toLowerCase().includes('from the upstream') ||
    i.text.toLowerCase().includes('from github itself')
  );

  for (const own of ownCause) {
    for (const ext of externalCause) {
      if (own.memberId !== ext.memberId) {
        const ownName = members.find(m => m.id === own.memberId)?.name;
        const extName = members.find(m => m.id === ext.memberId)?.name;
        alerts.push({
          id: 'conflict-rate-limit-cause',
          description: `${ownName} attributes 429 errors to internal retry storms, while ${extName} suggests an upstream/external cause`,
          memberIds: [own.memberId, ext.memberId],
          evidenceChunkIds: [],
          statements: [
            `${ownName}: "${own.text.slice(0, 150)}${own.text.length > 150 ? '…' : ''}"`,
            `${extName}: "${ext.text.slice(0, 150)}${ext.text.length > 150 ? '…' : ''}"`,
          ],
        });
        return alerts;
      }
    }
  }

  return alerts;
}
