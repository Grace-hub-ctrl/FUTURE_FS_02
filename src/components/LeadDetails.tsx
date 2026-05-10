import React from 'react';
import { Lead, Activity } from '../types';
import { X, Send, User, Mail, Globe, Calendar, Zap, MessageSquare } from 'lucide-react';
import { Button, Badge, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

interface LeadDetailsProps {
  lead: Lead | null;
  onClose: () => void;
  onAddNote: (leadId: string, note: string) => void;
}

export function LeadDetails({ lead, onClose, onAddNote }: LeadDetailsProps) {
  const [note, setNote] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || isSubmitting) return;
    
    const noteToSubmit = note;
    setNote('');
    setIsSubmitting(true);
    try {
      await onAddNote(lead.id, noteToSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#09090B] h-full shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 transition-colors duration-300"
        >
          {/* Header */}
          <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/20">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-amber-600 dark:text-amber-500 font-serif italic text-2xl shadow-sm dark:shadow-xl">
                {lead.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-serif italic text-zinc-900 dark:text-zinc-50">{lead.name}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <Badge variant={lead.status === 'Converted' ? 'success' : lead.status === 'Lost' ? 'error' : 'warning'}>
                    {lead.status}
                  </Badge>
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">ID: {lead.id}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 transition-colors">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-xl">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mb-1">Interest Level</p>
                  <p className="text-xl font-mono font-bold text-amber-600 dark:text-amber-500">{lead.heatScore}%</p>
                  <p className="text-[8px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-tight">Likelihood of conversion</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 transition-colors">
                <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-xl">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mb-1">Source</p>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{lead.source}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-[0.2em]">Lead Information</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 text-sm p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">{lead.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">Captured {new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-[0.2em]">Activity Feed</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-700 font-bold">{lead.activities.length} Entries</span>
              </div>
              
              <div className="relative pl-6 border-l border-zinc-100 dark:border-zinc-800 space-y-8">
                {lead.activities.map((activity, idx) => (
                  <div key={activity.id} className="relative group">
                    <div className={cn(
                      "absolute -left-[31px] top-1.5 w-2 h-2 rounded-full border-2 border-white dark:border-[#09090B] shadow-sm",
                      ['Status Update', 'Note Added', 'Creation'].includes(activity.action) ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    )} />
                    <div className="flex flex-col gap-2 transition-transform group-hover:translate-x-1 duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{activity.action}</span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono italic">
                          {formatDistanceToNow(new Date(activity.timestamp))} ago
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 group-hover:border-amber-500/30 dark:group-hover:border-zinc-700 transition-colors">
                        {activity.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Note Input */}
          <div className="p-8 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log a call or add a note..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 pr-14 text-sm focus:outline-none focus:border-amber-500/50 transition-all resize-none h-28 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm dark:shadow-inner"
              />
              <button
                type="submit"
                disabled={!note.trim() || isSubmitting}
                className="absolute right-5 bottom-5 p-2.5 bg-amber-500 text-zinc-900 rounded-xl hover:bg-amber-400 disabled:opacity-30 transition-all shadow-lg shadow-amber-500/10"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
