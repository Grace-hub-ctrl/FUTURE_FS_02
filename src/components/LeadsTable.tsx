import React from 'react';
import { 
  Eye, 
  Search, 
  LayoutList, 
  LayoutGrid, 
  Filter, 
  ChevronDown,
  DownloadCloud,
  UploadCloud,
  Plus
} from 'lucide-react';
import { Lead } from '../types';
import { Button, Badge, cn } from '../lib/utils';
import { format } from 'date-fns';

interface LeadsTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onAddLead: () => void;
  onExport: () => void;
  onImport: () => void;
  search: string;
  onSearchChange: (val: string) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ 
  leads, 
  onLeadClick, 
  onAddLead, 
  onExport, 
  onImport,
  search,
  onSearchChange
}) => {
  const [statusFilter, setStatusFilter] = React.useState('All Statuses');

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || 
                         l.email.toLowerCase().includes(search.toLowerCase()) ||
                         l.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-zinc-100 text-zinc-900 border-zinc-200';
      case 'Contacted': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'Qualified': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'In Progress': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Converted': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Lost': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-zinc-100 text-zinc-900';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header matching Image 1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Leads</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your leads and contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onExport} className="h-10 px-4 rounded-xl text-xs font-bold gap-2">
            <DownloadCloud size={14} />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onImport} className="h-10 px-4 rounded-xl text-xs font-bold gap-2">
            <UploadCloud size={14} />
            Import
          </Button>
          <Button size="sm" onClick={onAddLead} className="h-10 px-6 rounded-xl text-xs font-bold gap-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
            <Plus size={16} />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters matching Image 1 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search leads..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>

        <div className="relative group">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 pl-4 pr-10 bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold appearance-none cursor-pointer focus:outline-none"
          >
            <option>All Statuses</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>In Progress</option>
            <option>Converted</option>
            <option>Lost</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select className="h-11 pl-4 pr-10 bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold appearance-none cursor-pointer focus:outline-none">
            <option>All Users</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>

        <div className="flex bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1">
          <button className="p-2 rounded-lg bg-zinc-900 text-white shadow-sm transition-all"><LayoutList size={16} /></button>
          <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all"><LayoutGrid size={16} /></button>
          <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all"><Filter size={16} /></button>
        </div>
      </div>

      {/* Table matching Image 1 */}
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50/50 dark:bg-black/20 w-12">
                  <input type="checkbox" className="rounded border-zinc-300 dark:border-zinc-800 bg-transparent" />
                </th>
                <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50/50 dark:bg-black/20">Name</th>
                <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50/50 dark:bg-black/20">Email</th>
                <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50/50 dark:bg-black/20">Company</th>
                <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50/50 dark:bg-black/20 text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50/50 dark:bg-black/20">Source</th>
                <th className="px-6 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50/50 dark:bg-black/20">Created</th>
                <th className="px-8 py-5 bg-zinc-50/50 dark:bg-black/20 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors group cursor-pointer"
                  onClick={() => onLeadClick(lead)}
                >
                  <td className="px-8 py-5">
                    <input type="checkbox" onClick={(e) => e.stopPropagation()} className="rounded border-zinc-300 dark:border-zinc-800 bg-transparent" />
                  </td>
                  <td className="px-6 py-5 font-bold text-zinc-900 dark:text-zinc-100 text-sm">{lead.name}</td>
                  <td className="px-6 py-5 text-zinc-500 dark:text-zinc-400 text-sm font-mono">{lead.email}</td>
                  <td className="px-6 py-5 text-zinc-500 dark:text-zinc-400 text-sm">{lead.company || 'Private'}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      getStatusColor(lead.status)
                    )}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-zinc-500 dark:text-zinc-400 text-sm capitalize">{lead.source?.toLowerCase()}</td>
                  <td className="px-6 py-5 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                    {(() => {
                      try {
                        const date = new Date(lead.createdAt);
                        return isNaN(date.getTime()) ? 'Recently' : format(date, 'MMM dd, yyyy');
                      } catch {
                        return 'Recently';
                      }
                    })()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-zinc-300 group-hover:text-amber-500 transition-colors flex items-center justify-center">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-8 py-20 text-center italic text-zinc-400 dark:text-zinc-600">
                    No leads found matching your identity parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
