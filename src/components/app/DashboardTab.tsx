import { useState } from 'react';
import { useApp } from '@/store/app-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Copy, Eye, Search, X, User, FolderGit2 } from 'lucide-react';
import EvidenceModal from './EvidenceModal';

interface MossResult {
  id: string;
  type: 'member' | 'project';
  title: string;
  subtitle: string;
  relevance: number;
  items: { text: string; member?: string; source: string }[];
}

const MOCK_RESULTS: Record<string, MossResult[]> = {
  'auth': [
    {
      id: 'r1', type: 'project', title: 'Auth Token Refresh', subtitle: 'Cross-team project progress',
      relevance: 0.95,
      items: [
        { text: 'Implemented token refresh endpoint with in-memory cache', member: 'Ben', source: 'standup' },
        { text: 'Reviewed auth flow changes, found two parallel refresh implementations', member: 'Ava', source: 'standup' },
        { text: 'Started alternative client-side token refresh using fetch wrapper', member: 'Diego', source: 'standup' },
        { text: 'PR #184: "Unify token refresh middleware"', member: 'Ben', source: 'github' },
      ],
    },
    {
      id: 'r2', type: 'project', title: 'Rate Limit Handling', subtitle: '429 error investigation',
      relevance: 0.82,
      items: [
        { text: 'Rate limits caused by own retries stacking up on 429', member: 'Ben', source: 'standup' },
        { text: 'Drafted ADR for consistent rate limit handling: retry vs fail-fast', member: 'Ava', source: 'standup' },
        { text: 'Not sure if 429s are from upstream provider or GitHub itself', member: 'Diego', source: 'standup' },
      ],
    },
  ],
  'ben': [
    {
      id: 'r3', type: 'member', title: 'Ben — Backend Engineer', subtitle: 'Progress summary for 2026-02-18',
      relevance: 0.98,
      items: [
        { text: 'Implemented token refresh endpoint + in-memory cache', source: 'standup' },
        { text: 'Added request-id header for log correlation', source: 'standup' },
        { text: 'Investigated rate limit errors — believes retries are the cause', source: 'standup' },
        { text: 'Pushed 3 commits to backend/auth', source: 'github' },
        { text: 'Opened PR #184: "Unify token refresh middleware"', source: 'github' },
      ],
    },
  ],
  'ava': [
    {
      id: 'r4', type: 'member', title: 'Ava — Tech Lead', subtitle: 'Progress summary for 2026-02-18',
      relevance: 0.97,
      items: [
        { text: 'Reviewed auth flow changes from Ben and Diego', source: 'standup' },
        { text: 'Drafted ADR for rate limit handling strategy', source: 'standup' },
        { text: 'Helped Grace reproduce flaky CI test', source: 'standup' },
        { text: 'Reviewed PR #184, left comments on retry policy', source: 'github' },
        { text: 'Opened issue #92: request tracing + request-id propagation', source: 'github' },
      ],
    },
  ],
  'ci': [
    {
      id: 'r5', type: 'project', title: 'CI Pipeline Stability', subtitle: 'Flaky test investigation',
      relevance: 0.91,
      items: [
        { text: 'Failures correlate with parallel test runs — suspected shared DB state', member: 'Ethan', source: 'standup' },
        { text: 'Helped Grace reproduce the flaky CI test, smells like test isolation', member: 'Ava', source: 'standup' },
        { text: 'Reproduced flaky test locally — fails after auth tests run first', member: 'Grace', source: 'standup' },
        { text: 'Updated CI config: added random seed logs + parallelism flags', member: 'Ethan', source: 'github' },
      ],
    },
  ],
  'dashboard': [
    {
      id: 'r6', type: 'project', title: 'Dashboard & UI', subtitle: 'Frontend progress',
      relevance: 0.88,
      items: [
        { text: 'Worked on dashboard layout: member rows, columns, evidence modal', member: 'Chloe', source: 'standup' },
        { text: 'Added search bar with filters and semantic weight slider', member: 'Chloe', source: 'standup' },
        { text: 'Fixed extraction status badge not updating after run', member: 'Chloe', source: 'standup' },
        { text: 'Merged PR #181: "Dashboard table + evidence modal"', member: 'Chloe', source: 'github' },
      ],
    },
  ],
  'extraction': [
    {
      id: 'r7', type: 'project', title: 'Extraction Pipeline', subtitle: 'Evidence-first approach',
      relevance: 0.93,
      items: [
        { text: 'Prototyped extraction with evidence-first: chunk → retrieve → format JSON', member: 'Fatima', source: 'standup' },
        { text: 'Drafted dedupe strategy based on task similarity overlap', member: 'Fatima', source: 'standup' },
        { text: 'Need stable ExtractedUpdate schema for yesterday/today/blockers', member: 'Chloe', source: 'standup' },
        { text: 'Created experiment branch: extraction-evidence-first', member: 'Fatima', source: 'github' },
      ],
    },
  ],
};

function findMockResults(query: string): MossResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  // Check direct key matches first
  for (const [key, results] of Object.entries(MOCK_RESULTS)) {
    if (q.includes(key)) return results;
  }
  
  // Fuzzy: return all if generic query
  if (q.length > 0) {
    // Return top results from various categories
    return [
      MOCK_RESULTS['auth']![0],
      MOCK_RESULTS['ci']![0],
      MOCK_RESULTS['extraction']![0],
    ].filter(Boolean) as MossResult[];
  }
  
  return [];
}

const DashboardTab = () => {
  const { members, updates, entries, duplications, conflicts, extractionRun, date } = useApp();
  const [evidenceMemberId, setEvidenceMemberId] = useState<string | null>(null);
  const [mossQuery, setMossQuery] = useState('');
  const [mossResults, setMossResults] = useState<MossResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleMossSearch = () => {
    if (!mossQuery.trim()) return;
    setMossResults(findMockResults(mossQuery));
    setSearched(true);
  };

  const clearSearch = () => {
    setMossQuery('');
    setMossResults([]);
    setSearched(false);
  };

  if (!extractionRun) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="text-sm">Run extraction from the Standup tab to populate the dashboard.</p>
      </div>);

  }

  return (
    <div className="space-y-6 mt-4">
      {/* Moss Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground shrink-0">
            <Search className="h-4 w-4" />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase">Search with Moss</span>
          </div>
          <div className="flex-1 relative">
            <Input
              placeholder='Try "auth", "ben", "ci", "dashboard", "extraction"…'
              value={mossQuery}
              onChange={e => setMossQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleMossSearch()}
              className="h-9 bg-secondary border-none text-sm pr-8"
            />
            {mossQuery && (
              <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button size="sm" onClick={handleMossSearch} className="shrink-0">
            Search
          </Button>
        </div>

        {/* Suggested queries */}
        {!searched && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[11px] text-muted-foreground">Try:</span>
            {['auth', 'ben', 'ava', 'ci', 'dashboard', 'extraction'].map(q => (
              <button
                key={q}
                onClick={() => { setMossQuery(q); setMossResults(findMockResults(q)); setSearched(true); }}
                className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-mono"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Search Results */}
        {searched && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {mossResults.length} result{mossResults.length !== 1 ? 's' : ''} for "<span className="text-foreground font-medium">{mossQuery}</span>"
              </p>
              <button onClick={clearSearch} className="text-xs text-muted-foreground hover:text-foreground underline">
                Clear
              </button>
            </div>

            {mossResults.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No results found. Try a different query.</p>
            )}

            {mossResults.map(result => (
              <div key={result.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  {result.type === 'member' ? (
                    <User className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <FolderGit2 className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span className="text-sm font-medium text-foreground">{result.title}</span>
                  <Badge variant="outline" className="text-[10px] font-mono ml-auto">
                    {Math.round(result.relevance * 100)}% match
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">{result.subtitle}</p>
                <div className="space-y-1.5">
                  {result.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <Badge variant="secondary" className="text-[9px] font-mono shrink-0 mt-0.5">
                        {item.source}
                      </Badge>
                      <span className="text-muted-foreground leading-relaxed">
                        {item.member && <span className="text-foreground font-medium">{item.member}: </span>}
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36 font-display">Member</TableHead>
              <TableHead className="font-display">Yesterday</TableHead>
              <TableHead className="font-display">Today</TableHead>
              <TableHead className="font-display">Blockers</TableHead>
              <TableHead className="w-28 font-display">GitHub</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const update = updates.find((u) => u.memberId === member.id);
              const ghEntry = entries.find((e) => e.memberId === member.id && e.date === date && e.inputType === 'github');

              if (!update) return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium text-sm">{member.name}</TableCell>
                  <TableCell colSpan={5} className="text-muted-foreground text-xs italic">No update submitted</TableCell>
                </TableRow>);


              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground">{member.role}</p>
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-1">
                      {update.yesterday.slice(0, 3).map((item, i) =>
                      <li key={i} className="text-xs leading-relaxed text-muted-foreground">• {item.length > 100 ? item.slice(0, 100) + '…' : item}</li>
                      )}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-1">
                      {update.today.map((item, i) =>
                      <li key={i} className="text-xs leading-relaxed text-muted-foreground">• {item.length > 100 ? item.slice(0, 100) + '…' : item}</li>
                      )}
                    </ul>
                  </TableCell>
                  <TableCell>
                    {update.blockers.length > 0 ?
                    <ul className="space-y-1">
                        {update.blockers.map((item, i) =>
                      <li key={i} className="text-xs text-destructive/80 leading-relaxed">• {item.length > 100 ? item.slice(0, 100) + '…' : item}</li>
                      )}
                      </ul> :

                    <span className="text-xs text-success">None</span>
                    }
                  </TableCell>
                  <TableCell>
                    {ghEntry ?
                    <p className="text-[11px] text-muted-foreground line-clamp-3">{ghEntry.transcriptText.slice(0, 80)}…</p> :

                    <span className="text-[11px] text-muted-foreground">—</span>
                    }
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setEvidenceMemberId(member.id)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>);

            })}
          </TableBody>
        </Table>
      </Card>

      {duplications.length > 0 &&
      <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Copy className="h-4 w-4 text-warning" />
            <h3 className="font-display font-semibold text-sm text-foreground">Potential Duplications</h3>
            <Badge variant="outline" className="text-[10px] text-warning border-warning/30 font-mono">{duplications.length}</Badge>
          </div>
          <div className="space-y-3">
            {duplications.map((d) =>
          <div key={d.id} className="p-3 rounded-lg bg-warning/5 border border-warning/10">
                <p className="text-sm text-foreground mb-2">{d.description}</p>
                <div className="space-y-1.5">
                  {d.items.map((item, i) =>
              <p key={i} className="text-xs text-muted-foreground pl-3 border-l-2 border-warning/30 leading-relaxed">
                      "{item.length > 120 ? item.slice(0, 120) + '…' : item}"
                    </p>
              )}
                </div>
              </div>
          )}
          </div>
        </Card>
      }

      {conflicts.length > 0 &&
      <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="font-display font-semibold text-sm text-foreground">Potential Conflicts</h3>
            <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30 font-mono">{conflicts.length}</Badge>
          </div>
          <div className="space-y-3">
            {conflicts.map((c) =>
          <div key={c.id} className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <p className="text-sm text-foreground mb-2">{c.description}</p>
                <div className="space-y-1.5">
                  {c.statements.map((s, i) =>
              <p key={i} className="text-xs text-muted-foreground pl-3 border-l-2 border-destructive/30 leading-relaxed">{s}</p>
              )}
                </div>
              </div>
          )}
          </div>
        </Card>
      }

      <EvidenceModal memberId={evidenceMemberId} onClose={() => setEvidenceMemberId(null)} />
    </div>);

};

export default DashboardTab;
