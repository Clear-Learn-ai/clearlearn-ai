'use client';

import { ReactNode } from 'react';

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return (
    <div className="smooth-scroll-container">
      {children}
    </div>
  );
}