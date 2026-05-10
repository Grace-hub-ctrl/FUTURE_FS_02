import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '../types';
import { Badge, cn } from '../lib/utils';
import { Mail, Clock, MessageSquare, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getHeatClass = (score: number) => {
    if (lead.status === 'Converted') return 'heat-converted';
    if (score >= 80) return 'heat-hot';
    if (score >= 40) return 'heat-warm';
    return 'heat-cold';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(lead)}
      className={cn(
        "bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm dark:shadow-xl cursor-grab active:cursor-grabbing hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group",
        isDragging && "z-50 shadow-2xl border-amber-500/50 rotate-1 ring-1 ring-amber-500/20"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2.5">
          <div className={cn("heat-dot", getHeatClass(lead.heatScore))} />
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-white transition-colors">{lead.name}</h3>
        </div>
        <button className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2 mb-5">
        <p className="text-[10px] text-zinc-500 font-medium tracking-tight">Source: {lead.source}</p>
        <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-mono">
          <Mail className="w-3 h-3 opacity-50" />
          <span className="truncate">{lead.email}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-1 flex-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${lead.heatScore}%` }}
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              lead.status === 'Converted' ? 'bg-emerald-500' :
              lead.heatScore > 75 ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'
            )}
          />
        </div>
        <span className="text-[9px] font-bold font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-tighter">
          {lead.heatScore}%
        </span>
      </div>
    </div>
  );
}
