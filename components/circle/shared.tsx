'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.28 }}
      className="flex flex-1 flex-col gap-4 pb-4"
    >
      {children}
    </motion.section>
  );
}

export function Header({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="rounded-full bg-white/10 p-2 active:scale-95">
            <ArrowLeft size={18} />
          </button>
        )}
        <h2 className="text-xl font-black tracking-tight">{title}</h2>
      </div>
      {right}
    </div>
  );
}
