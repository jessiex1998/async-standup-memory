import { useState } from 'react';
import { useApp } from '@/store/app-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import MemberDrawer from './MemberDrawer';

const StandupTab = () => {
  const { members, entries, date, extractionRun, runExtraction, demoLoaded, addMember } = useApp();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const submittedCount = members.filter(m =>
    entries.some(e => e.memberId === m.id && e.date === date && e.inputType !== 'github')
  ).length;
  const completionRate = members.length > 0 ? (submittedCount / members.length) * 100 : 0;

  if (!demoLoaded && members.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="text-sm">Load demo data or add members to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-semibold text-foreground">Team Members</h2>
          <Button variant="outline" size="sm" onClick={() => addMember(`Member ${members.length + 1}`, 'Engineer')}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {members.map(member => {
            const hasSubmitted = entries.some(e => e.memberId === member.id && e.date === date && e.inputType !== 'github');
            const hasGithub = entries.some(e => e.memberId === member.id && e.date === date && e.inputType === 'github');

            return (
              <Card
                key={member.id}
                className="p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => setSelectedMember(member.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/15 text-primary text-sm font-medium">
                      {member.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasSubmitted ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/40" />
                    )}
                    {hasGithub && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">GH</Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-4 space-y-3">
          <h3 className="font-display font-semibold text-sm text-foreground">Completion</h3>
          <Progress value={completionRate} className="h-2" />
          <p className="text-xs text-muted-foreground">{submittedCount} / {members.length} submitted</p>
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-display font-semibold text-sm text-foreground">Extraction</h3>
          {extractionRun ? (
            <div className="flex items-center gap-2">
              <Badge className="bg-success/20 text-success border-success/30 hover:bg-success/20">Completed</Badge>
              <span className="text-[10px] text-muted-foreground">just now</span>
            </div>
          ) : (
            <Button size="sm" className="w-full font-display" onClick={runExtraction} disabled={submittedCount === 0}>
              <Sparkles className="h-4 w-4 mr-2" /> Run Extraction
            </Button>
          )}
        </Card>
      </div>

      <MemberDrawer
        memberId={selectedMember}
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};

export default StandupTab;
