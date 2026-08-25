import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const baseStyles =
    'h-[44px] w-full rounded-full font-label-mono text-label-mono flex items-center justify-center gap-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant',
    secondary: 'bg-secondary text-on-secondary hover:opacity-90',
    outline: 'bg-transparent border border-outline text-on-surface hover:bg-surface-container',
  };

  const variantStyle = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
