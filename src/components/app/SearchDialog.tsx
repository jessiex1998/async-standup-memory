import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/store/app-store';
import { Search } from 'lucide-react';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const { search, members } = useApp();
  const [query, setQuery] = useState('');
  const [alpha, setAlpha] = useState([0.3]);
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return search(
      query,
      {
        memberId: memberFilter !== 'all' ? memberFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
      },
      alpha[0]
    );
  }, [query, alpha, memberFilter, sourceFilter, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Search Updates</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              placeholder='Try "auth refresh", "rate limit", "flaky CI"…'
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 px-0"
            />
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block font-display">Member</label>
              <Select value={memberFilter} onValueChange={setMemberFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All members</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block font-display">Source</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="standup">Standup</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground font-display">Semantic Weight (α)</label>
              <span className="text-xs text-primary font-mono">{alpha[0].toFixed(2)}</span>
            </div>
            <Slider value={alpha} onValueChange={setAlpha} min={0} max={1} step={0.05} />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              0 = keyword match only · 1 = full semantic (Moss) · Demo uses keyword approximation
            </p>
          </div>

          {query.trim() && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono">{results.length} result{results.length !== 1 ? 's' : ''}</p>
              {results.map(r => (
                <div key={r.chunk.id} className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-foreground">{r.memberName}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{r.chunk.source}</Badge>
                    <span className="text-[10px] text-primary font-mono ml-auto">
                      {(r.relevance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {r.chunk.chunkText.length > 300 ? r.chunk.chunkText.slice(0, 300) + '…' : r.chunk.chunkText}
                  </p>
                </div>
              ))}
              {results.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No matching chunks found.</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
