import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn('inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition active:scale-95 disabled:opacity-50', className)}
    {...props}
  />
));

Button.displayName = 'Button';
