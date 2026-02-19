import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/store/app-store';

interface EvidenceModalProps {
  memberId: string | null;
  onClose: () => void;
}

const EvidenceModal = ({ memberId, onClose }: EvidenceModalProps) => {
  const { members, chunks, updates, date } = useApp();

  const member = members.find(m => m.id === memberId);
  const update = updates.find(u => u.memberId === memberId && u.date === date);
  const memberChunks = chunks.filter(c => c.memberId === memberId && c.date === date);
  const evidenceChunks = update
    ? memberChunks.filter(c => update.evidenceChunkIds.includes(c.id))
    : memberChunks;

  return (
    <Dialog open={!!memberId} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            Evidence — {member?.name}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">{evidenceChunks.length} evidence chunks · {date}</p>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {evidenceChunks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No evidence chunks found.</p>
          ) : (
            evidenceChunks.map(chunk => (
              <div key={chunk.id} className="p-3 rounded-lg bg-secondary border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] font-mono">{chunk.source}</Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">#{chunk.orderIndex}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{chunk.chunkText}</p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvidenceModal;
