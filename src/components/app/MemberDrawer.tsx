import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/store/app-store';
import { Mic, Video, Github, Send } from 'lucide-react';

interface MemberDrawerProps {
  memberId: string | null;
  open: boolean;
  onClose: () => void;
}

const MemberDrawer = ({ memberId, open, onClose }: MemberDrawerProps) => {
  const { members, submitStandup, fetchGithub, getMemberEntries, date, mode } = useApp();
  const [transcript, setTranscript] = useState('');

  const member = members.find(m => m.id === memberId);
  const entries = memberId ? getMemberEntries(memberId) : [];
  const hasGithub = entries.some(e => e.inputType === 'github');

  const handleSubmit = () => {
    if (!memberId || !transcript.trim()) return;
    submitStandup(memberId, transcript.trim(), 'text');
    setTranscript('');
  };

  const handleFetchGithub = () => {
    if (!memberId) return;
    fetchGithub(memberId);
  };

  if (!member) return null;

  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">{member.name}</SheetTitle>
          <p className="text-sm text-muted-foreground">{member.role} · {date}</p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground font-display">Record Update</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                <Mic className="h-4 w-4 mr-1" /> Audio
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Video className="h-4 w-4 mr-1" /> Video
              </Button>
              {mode === 'live' && (
                <p className="text-xs text-muted-foreground self-center ml-2">Coming soon</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground font-display">Paste Transcript</h4>
            <Textarea
              placeholder="Yesterday I worked on... Today I plan to... Blockers: ..."
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              rows={8}
              className="resize-none font-mono text-xs"
            />
            <Button onClick={handleSubmit} disabled={!transcript.trim()} className="w-full font-display">
              <Send className="h-4 w-4 mr-2" /> Submit Update
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground font-display">GitHub Snapshot</h4>
            <Button variant="outline" onClick={handleFetchGithub} disabled={hasGithub} className="w-full">
              <Github className="h-4 w-4 mr-2" />
              {hasGithub ? 'GitHub data loaded' : 'Fetch from GitHub'}
            </Button>
          </div>

          {entries.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground font-display">Submitted ({entries.length})</h4>
              {entries.map(entry => (
                <div key={entry.id} className="p-3 rounded-lg bg-secondary text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-mono">{entry.inputType}</Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(entry.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-4">{entry.transcriptText}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MemberDrawer;
