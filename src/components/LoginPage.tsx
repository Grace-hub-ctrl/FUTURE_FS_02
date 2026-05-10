import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../lib/utils';

interface LoginPageProps {
  onLogin: (token: string, user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.token, data.user);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#09090B] p-6 transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[2rem] bg-amber-500 text-zinc-900 mb-6 shadow-2xl shadow-amber-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif italic text-zinc-900 dark:text-zinc-50 mb-2">LeadVault CRM</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-[0.2em] font-bold">Secure Access Gateway</p>
        </div>

        <div className="bg-white dark:bg-[#18181B] rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-10 shadow-2xl transition-all duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-[0.2em] pl-1">Administrator Identity</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-5 text-sm focus:outline-none focus:border-amber-500/50 transition-all text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                  placeholder="Username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-[0.2em] pl-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-5 text-sm focus:outline-none focus:border-amber-500/50 transition-all text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-500 font-bold text-center py-2 bg-red-500/10 rounded-lg border border-red-500/20"
              >
                {error}
              </motion.p>
            )}

            <Button 
              type="submit" 
              className="w-full py-4 rounded-2xl"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Authorize Access'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">
              Default Admin: admin / admin123
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-zinc-400 dark:text-zinc-600 text-[9px] uppercase tracking-[0.3em]">
          Powered by LeadVault™ Security Protocol
        </p>
      </motion.div>
    </div>
  );
};
