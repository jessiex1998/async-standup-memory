import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Database, ArrowLeft } from 'lucide-react';
import { useApp } from '@/store/app-store';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import StandupTab from '@/components/app/StandupTab';
import DashboardTab from '@/components/app/DashboardTab';
import IntegrationsTab from '@/components/app/IntegrationsTab';
import SearchDialog from '@/components/app/SearchDialog';

const AppWorkspace = () => {
  const { mode, setMode, date, setDate, demoLoaded, loadDemoData } = useApp();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="font-display font-bold text-foreground tracking-tight">async standup</span>

          <div className="flex items-center gap-2 ml-4">
            <Badge variant={mode === 'demo' ? 'default' : 'secondary'} className="text-xs font-mono">
              {mode === 'demo' ? 'DEMO' : 'LIVE'}
            </Badge>
            <Switch
              checked={mode === 'live'}
              onCheckedChange={c => setMode(c ? 'live' : 'demo')}
            />
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-40 h-8 text-sm bg-secondary border-none"
            />
          </div>

          <div className="flex-1" />

          <Button variant="outline" size="sm" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>

          {mode === 'demo' && !demoLoaded && (
            <Button size="sm" onClick={loadDemoData}>
              <Database className="h-4 w-4 mr-2" /> Load Demo Data
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        {mode === 'live' && (
          <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm text-warning">
            Live mode: Connect Hyperspell integrations and configure backend to enable real data flow.
          </div>
        )}

        <Tabs defaultValue="standup" className="w-full">
          <TabsList className="bg-secondary">
            <TabsTrigger value="standup" className="font-display">Standup</TabsTrigger>
            <TabsTrigger value="dashboard" className="font-display">Dashboard</TabsTrigger>
            <TabsTrigger value="integrations" className="font-display">Integrations</TabsTrigger>
          </TabsList>
          <TabsContent value="standup"><StandupTab /></TabsContent>
          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="integrations"><IntegrationsTab /></TabsContent>
        </Tabs>
      </main>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};

export default AppWorkspace;
