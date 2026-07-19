import React from 'react';

interface Props {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export default function Skeleton({ className = '', variant = 'rect' }: Props) {
  const baseClasses = "animate-pulse bg-[#1c1d21] border border-white/5";
  const variantClasses =
    variant === 'circle' ? 'rounded-full' :
    variant === 'text' ? 'rounded-md h-4 w-full' :
    'rounded-[2rem]';

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`} />
  );
}
