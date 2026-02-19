import { useApp } from '@/store/app-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, BookOpen, Plug, Unplug } from 'lucide-react';

const IntegrationsTab = () => {
  const { integrations, connectIntegration, disconnectIntegration, mode } = useApp();

  const cards = [
    {
      integration: integrations.find(i => i.provider === 'hyperspell-github')!,
      icon: Github,
      title: 'Hyperspell GitHub',
      description: 'Automatically pull commits, PRs, and issues for each team member. GitHub activity appears as searchable chunks alongside standup updates.',
    },
    {
      integration: integrations.find(i => i.provider === 'hyperspell-notion')!,
      icon: BookOpen,
      title: 'Hyperspell Notion',
      description: 'Sync extracted updates to a Notion database. Each standup becomes a row with structured Yesterday/Today/Blockers columns.',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {cards.map(({ integration, icon: Icon, title, description }) => (
        <Card key={integration.id} className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-foreground">{title}</h3>
            </div>
            <Badge
              variant="outline"
              className={
                integration.status === 'connected'
                  ? 'text-success border-success/30 font-mono text-[10px]'
                  : 'text-muted-foreground font-mono text-[10px]'
              }
            >
              {integration.status}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

          {integration.accountLabel && (
            <p className="text-xs text-muted-foreground font-mono">Connected as: {integration.accountLabel}</p>
          )}

          {mode === 'live' && integration.status === 'disconnected' && (
            <p className="text-xs text-warning">Live mode: Requires Hyperspell API key configuration.</p>
          )}

          <div className="flex gap-2">
            {integration.status === 'disconnected' ? (
              <Button size="sm" onClick={() => connectIntegration(integration.provider)} className="font-display">
                <Plug className="h-4 w-4 mr-1" /> Connect
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => disconnectIntegration(integration.provider)}>
                <Unplug className="h-4 w-4 mr-1" /> Disconnect
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default IntegrationsTab;
