import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-3xl border border-white/10 bg-card/80 p-4 shadow-glow backdrop-blur', className)} {...props} />;
}
