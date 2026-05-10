import React from 'react';
import { X, User, Mail, Globe, Send } from 'lucide-react';
import { Button, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; company: string; source: string }) => void;
}

export function LeadForm({ isOpen, onClose, onSubmit }: LeadFormProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    company: '',
    source: 'Website'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', email: '', company: '', source: 'Website' });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-[#09090B] rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-colors duration-300"
        >
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-10 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-serif italic tracking-tight text-zinc-900 dark:text-amber-50">Capture Lead</h2>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-2 uppercase tracking-widest font-bold">Manual Entry Registry</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-[0.2em] pl-1">Target Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-5 text-sm focus:outline-none focus:border-amber-500/50 transition-all text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 shadow-sm dark:shadow-inner"
                    placeholder="Full identity name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-[0.2em] pl-1">Electronic Mail</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-5 text-sm focus:outline-none focus:border-amber-500/50 transition-all text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 shadow-sm dark:shadow-inner"
                    placeholder="contact@domain.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-[0.2em] pl-1">Organizational Entity</label>
                <div className="relative">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                  <input
                    required
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-5 text-sm focus:outline-none focus:border-amber-500/50 transition-all text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 shadow-sm dark:shadow-inner"
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-[0.2em] pl-1">Inflow Source</label>
                <div className="relative">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-5 text-sm focus:outline-none focus:border-amber-500/50 transition-all appearance-none text-zinc-900 dark:text-zinc-200 shadow-sm dark:shadow-inner"
                  >
                    <option value="Website">Digital Web Port</option>
                    <option value="LinkedIn">Social Network</option>
                    <option value="Referral">Direct Referral</option>
                    <option value="Cold Email">Outbound Signal</option>
                  </select>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full py-5 rounded-2xl shadow-xl shadow-amber-500/10" size="lg">
              <Send className="w-4 h-4 mr-3" />
              Register Lead
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
