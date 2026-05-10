import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Badge({ children, className, variant = 'default' }: { 
  children: React.ReactNode; 
  className?: string;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'error' | 'info';
}) {
  const variants = {
    default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    outline: 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20',
    error: 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20',
  };

  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-widest transition-colors duration-300",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}) {
  const variants = {
    primary: 'bg-amber-500 text-zinc-900 hover:bg-amber-400 font-bold shadow-lg shadow-amber-500/20',
    secondary: 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm transition-all',
    ghost: 'bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px] uppercase tracking-wider',
    md: 'px-4 py-2 text-xs uppercase tracking-wider',
    lg: 'px-6 py-3 text-sm uppercase tracking-wider',
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
