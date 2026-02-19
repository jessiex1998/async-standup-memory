import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Radio, Search, GitBranch, BarChart3 } from 'lucide-react';

const features = [
  { icon: Radio, title: 'Async Submit', desc: 'Record or paste updates on your schedule' },
  { icon: BarChart3, title: 'Auto Extract', desc: 'Yesterday / Today / Blockers — structured' },
  { icon: Search, title: 'Full Search', desc: 'By topic, member, date, or semantic weight' },
  { icon: GitBranch, title: 'GitHub Sync', desc: 'Pull commits, PRs, issues automatically' },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-display text-lg font-bold tracking-tight text-foreground">async standup</span>
          <Button variant="outline" size="sm" onClick={() => navigate('/app')}>
            Open App
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center space-y-10 py-20">
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Kill the standup meeting.
            <br />
            <span className="text-primary">Keep the standup.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Turn synchronous standups into async, searchable, evidence-backed team memory.
            Every update is structured, every claim is traceable.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate('/app')} className="font-display font-semibold">
              Try Demo Mode <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/app')} className="font-display">
              Enter App
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 text-left">
            {features.map(f => (
              <div key={f.title} className="space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          Async Standup Assistant · Demo Mode available · Powered by Hyperspell + Moss
        </p>
      </footer>
    </div>
  );
};

export default Landing;
