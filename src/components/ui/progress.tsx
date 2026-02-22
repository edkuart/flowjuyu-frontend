'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const getColor = (val: number) => {
    if (val < 25) return 'bg-rose-500';
    if (val < 50) return 'bg-amber-500';
    if (val < 75) return 'bg-lime-500';
    return 'bg-sky-500';
  };

  return (
    <div
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-muted',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full transition-all duration-500 ease-in-out rounded-full',
          getColor(value)
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}