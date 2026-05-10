import React from 'react';
import { 
  Users, 
  TrendingUp, 
  LayoutDashboard, 
  Settings, 
  Plus, 
  Search, 
  Zap, 
  LogOut,
  Moon,
  Sun,
  DownloadCloud,
  UploadCloud,
  Timer,
  Target
} from 'lucide-react';
import Papa from 'papaparse';
import { Lead, LeadStatus } from './types';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadsTable } from './components/LeadsTable';
import { LeadForm } from './components/LeadForm';
import { LeadDetails } from './components/LeadDetails';
import { LoginPage } from './components/LoginPage';
import { Button, Badge, cn } from './lib/utils';
import { formatDistanceToNow } from 'date-fns';

type View = 'dashboard' | 'pipeline' | 'leads' | 'settings';

export default function App() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [currentView, setCurrentView] = React.useState<View>('dashboard');
  const [user, setUser] = React.useState<any>(null);
  const [token, setToken] = React.useState<string | null>(localStorage.getItem('token'));
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    }
    return 'dark';
  });

  const authFetch = React.useCallback(async (url: string, options: any = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      handleLogout();
      throw new Error('Unauthorized');
    }
    return res;
  }, [token]);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const fetchLeads = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await authFetch('/api/leads');
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, authFetch]);

  const checkAuth = React.useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authFetch('/api/me');
      const data = await res.json();
      setUser(data);
      fetchLeads();
    } catch (err) {
      handleLogout();
    }
  }, [token, authFetch, fetchLeads]);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = (newToken: string, newUser: any) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLeads([]);
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    // Optimistic update for leads list
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    
    // Optimistic update for selected lead if open
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      await authFetch('/api/leads/' + leadId, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      fetchLeads();
    } catch (err) {
      console.error('Update status error:', err);
      fetchLeads(); // Revert on error
    }
  };

  const handleAddLead = async (data: any) => {
    try {
      await authFetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setIsFormOpen(false);
      fetchLeads();
    } catch (err) {
      console.error('Add lead error:', err);
    }
  };

  const handleAddNote = async (leadId: string, note: string) => {
    const tempActivity = {
      id: `temp-${Date.now()}`,
      leadId,
      note,
      action: 'Note Added',
      timestamp: new Date().toISOString()
    };

    // Update leads array optimistically
    setLeads(prev => prev.map(l => 
      l.id === leadId 
        ? { ...l, activities: [tempActivity, ...(l.activities || [])] }
        : l
    ));

    // Update selectedLead optimistically
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => prev ? {
        ...prev,
        activities: [tempActivity, ...(prev.activities || [])]
      } : null);
    }

    try {
      await authFetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note })
      });
      await fetchLeads();
    } catch (err) {
      console.error('Add note error:', err);
      await fetchLeads();
    }
  };

  // Sync selectedLead when leads array updates
  React.useEffect(() => {
    if (selectedLead) {
      const updated = leads.find(l => l.id === selectedLead.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedLead)) {
        setSelectedLead(updated);
      }
    }
  }, [leads, selectedLead]);

  const handleExportCSV = () => {
    const csvData = leads.map(({ id, name, email, company, source, status }) => ({
      name, email, company, source, status
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const leadsToImport = results.data.map((row: any) => ({
            name: row.name || row.Name,
            email: row.email || row.Email,
            company: row.company || row.Company || 'Private',
            source: row.source || row.Source || 'CSV Import'
          })).filter(l => l.name && l.email);

          if (leadsToImport.length > 0) {
            await authFetch('/api/leads/bulk', {
              method: 'POST',
              body: JSON.stringify(leadsToImport)
            });
            fetchLeads();
          }
        } catch (err) {
          console.error('Import error:', err);
        }
      }
    });
  };


  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase())
  );

  const allActivities = leads.flatMap(l => l.activities.map(a => ({ ...a, leadName: l.name })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#09090B] text-zinc-900 dark:text-zinc-200 overflow-hidden font-sans border-zinc-200 dark:border-zinc-900 border">
      {/* Left Sidebar */}
      <nav className="w-64 bg-white dark:bg-[#09090B] border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full z-20 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-10 px-6 py-8">
          <div className="w-9 h-9 bg-zinc-900 dark:bg-zinc-50 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white dark:text-zinc-900" fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">LeadsVault</span>
        </div>

        <div className="space-y-1 flex-1 px-4">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <NavItem icon={<Users />} label="Leads" active={currentView === 'leads'} onClick={() => setCurrentView('leads')} />
          <NavItem icon={<TrendingUp />} label="Pipeline" active={currentView === 'pipeline'} onClick={() => setCurrentView('pipeline')} />
          <NavItem icon={<Settings />} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs capitalize">
              {user?.username?.substring(0, 1) || 'A'}
            </div>
            <div className="text-xs">
              <p className="font-bold text-zinc-900 dark:text-zinc-200 truncate w-24 capitalize">{user?.username || 'Admin'}</p>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Manager</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><LogOut size={16} /></button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-zinc-50/50 dark:bg-[#0F0F12] relative overflow-hidden transition-colors duration-300">
        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-10">
          {currentView === 'dashboard' && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Dashboard</h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Overview of your leads and performance</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchLeads()} className="h-11 px-6 rounded-xl text-xs font-bold gap-2">
                  <Zap size={14} className="fill-zinc-900 dark:fill-zinc-50" />
                  Refresh
                </Button>
              </div>
              <PerformanceDashboard leads={leads} />
            </div>
          )}

          {currentView === 'pipeline' && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Pipeline</h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Visual sales funnel management</p>
                </div>
                <Button size="sm" onClick={() => setIsFormOpen(true)} className="h-11 px-8 rounded-xl text-xs font-bold gap-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                  <Plus size={18} />
                  New Lead
                </Button>
              </div>
              <KanbanBoard 
                leads={filteredLeads} 
                onStatusChange={handleStatusChange} 
                onLeadClick={setSelectedLead}
                onAddLead={() => setIsFormOpen(true)}
              />
            </div>
          )}

          {currentView === 'leads' && (
            <LeadsTable 
              leads={leads}
              search={search}
              onSearchChange={setSearch}
              onLeadClick={setSelectedLead}
              onAddLead={() => setIsFormOpen(true)}
              onExport={handleExportCSV}
              onImport={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv';
                input.onchange = (e) => handleImportCSV(e);
                input.click();
              }}
            />
          )}

          {currentView === 'settings' && (
            <div className="max-w-2xl space-y-8">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Vault Settings</h1>
              <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Data Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4"><DownloadCloud size={20} /></div>
                      <h4 className="text-sm font-bold mb-1">Export Database</h4>
                      <p className="text-[10px] text-zinc-500 mb-4 uppercase tracking-wider font-bold">Download leads as CSV</p>
                      <Button variant="outline" className="w-full text-[10px] h-9" onClick={handleExportCSV}>Export CSV</Button>
                   </div>
                   <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4"><UploadCloud size={20} /></div>
                      <h4 className="text-sm font-bold mb-1">Import Data</h4>
                      <p className="text-[10px] text-zinc-500 mb-4 uppercase tracking-wider font-bold">Upload leads via CSV</p>
                      <div className="relative">
                        <input type="file" accept=".csv" onChange={handleImportCSV} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <Button variant="outline" className="w-full text-[10px] h-9">Upload CSV</Button>
                      </div>
                   </div>
                </div>
              </div>


              <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
                <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
                    <span className="text-xs font-medium">Visual Interface</span>
                  </div>
                  <button onClick={toggleTheme} className="px-4 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest font-mono">
                    {theme === 'light' ? 'Light' : 'Dark'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Global Activity Sidebar */}
      <aside className="w-80 bg-white dark:bg-[#09090B] border-l border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Activity Timeline</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800 space-y-10">
            {allActivities.length > 0 ? allActivities.map((activity, idx) => (
              <div key={activity.id} className="relative group">
                <div className={cn(
                  "absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-[#09090B] transition-transform group-hover:scale-125",
                  activity.action === 'Status Update' || activity.action === 'Note Added' ? 'bg-amber-500' : 
                  activity.action === 'Creation' ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'
                )} />
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-mono tracking-tighter">
                  {formatDistanceToNow(new Date(activity.timestamp))} ago
                </p>
                <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100 mt-1.5 leading-relaxed">
                  <span className="text-zinc-500 dark:text-zinc-400">{activity.leadName}</span> • {activity.note}
                </p>
              </div>
            )) : (
              <p className="text-xs text-zinc-500 italic">No recent activity.</p>
            )}
          </div>
        </div>
      </aside>

      <LeadDetails lead={selectedLead} onClose={() => setSelectedLead(null)} onAddNote={handleAddNote} />
      <LeadForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleAddLead} />
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-xs font-bold uppercase tracking-widest text-left",
        active 
          ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-xl shadow-zinc-900/10" 
          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
      )}
    >
      <span>{React.cloneElement(icon as React.ReactElement, { size: 18 })}</span>
      <span className="tracking-widest">{label}</span>
    </button>
  );
}
