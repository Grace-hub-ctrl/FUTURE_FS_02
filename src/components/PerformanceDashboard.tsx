import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Lead } from '../types';
import { 
  Users, 
  UserPlus, 
  PhoneCall, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Timer 
} from 'lucide-react';

interface PerformanceDashboardProps {
  leads: Lead[];
}

const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }: any) => (
  <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-40">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{title}</p>
        {subtitle && <p className="text-[10px] text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <div className="mt-auto">
      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 font-mono">{value}</p>
    </div>
  </div>
);

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ leads }) => {
  const stats = [
    { 
      title: 'New Leads', 
      value: leads.filter(l => l.status === 'New').length, 
      icon: UserPlus, 
      colorClass: 'bg-blue-500/10 text-blue-500' 
    },
    { 
      title: 'Contacted', 
      value: leads.filter(l => l.status === 'Contacted').length, 
      icon: PhoneCall, 
      colorClass: 'bg-purple-500/10 text-purple-600' 
    },
    { 
      title: 'Qualified', 
      value: leads.filter(l => l.status === 'Qualified').length, 
      icon: ShieldCheck, 
      colorClass: 'bg-emerald-500/10 text-emerald-500' 
    },
    { 
      title: 'In Progress', 
      value: leads.filter(l => l.status === 'In Progress').length, 
      icon: Timer, 
      colorClass: 'bg-amber-500/10 text-amber-600' 
    },
    { 
      title: 'Converted', 
      value: leads.filter(l => l.status === 'Converted').length, 
      icon: TrendingUp, 
      colorClass: 'bg-green-500/10 text-green-600' 
    },
    { 
      title: 'Lost', 
      value: leads.filter(l => l.status === 'Lost').length, 
      icon: XCircle, 
      colorClass: 'bg-red-500/10 text-red-500' 
    },
    { 
      title: 'Total Leads', 
      value: leads.length, 
      icon: Users, 
      colorClass: 'bg-zinc-500/10 text-zinc-600' 
    },
    { 
      title: 'Conversion Rate', 
      value: leads.length ? `${Math.round((leads.filter(l => l.status === 'Converted').length / leads.length) * 100)}%` : '0%', 
      icon: Zap, 
      colorClass: 'bg-amber-500/10 text-amber-500' 
    },
    { 
      title: 'Active Leads', 
      value: leads.filter(l => !['Converted', 'Lost'].includes(l.status)).length, 
      icon: Timer, 
      colorClass: 'bg-orange-500/10 text-orange-600' 
    },
  ];

  // Unified Data for Charts
  const allStatusesData = [
    { name: 'New', value: leads.filter(l => l.status === 'New').length, color: '#3b82f6' },
    { name: 'Contacted', value: leads.filter(l => l.status === 'Contacted').length, color: '#a855f7' },
    { name: 'Qualified', value: leads.filter(l => l.status === 'Qualified').length, color: '#10b981' },
    { name: 'In Progress', value: leads.filter(l => l.status === 'In Progress').length, color: '#f59e0b' },
    { name: 'Converted', value: leads.filter(l => l.status === 'Converted').length, color: '#22c55e' },
    { name: 'Lost', value: leads.filter(l => l.status === 'Lost').length, color: '#ef4444' },
  ].filter(d => d.value >= 0); // Include zeros to show empty buckets if desired, or set to > 0

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-8">Leads by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allStatusesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }}
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                />
                <Bar dataKey="value">
                  {allStatusesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-8">Lead Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allStatusesData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                >
                  {allStatusesData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
