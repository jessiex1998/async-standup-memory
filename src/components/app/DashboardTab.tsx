import { useState } from 'react';
import { useApp } from '@/store/app-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Copy, Eye } from 'lucide-react';
import EvidenceModal from './EvidenceModal';

const DashboardTab = () => {
  const { members, updates, entries, duplications, conflicts, extractionRun, date } = useApp();
  const [evidenceMemberId, setEvidenceMemberId] = useState<string | null>(null);

  if (!extractionRun) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="text-sm">Run extraction from the Standup tab to populate the dashboard.</p>
      </div>);

  }

  return (
    <div className="space-y-6 mt-4">
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