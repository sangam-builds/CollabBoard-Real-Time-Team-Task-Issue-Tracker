import React from 'react';

export default function InputField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  rightLink,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-[8px] ${className}`}>
      <div className="flex justify-between items-center">
        {label && (
          <label className="font-label-mono text-label-mono text-on-surface" htmlFor={id}>
            {label}
          </label>
        )}
        {rightLink}
      </div>
      <input
        id={id}
        name={name || id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="h-[44px] px-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors text-on-surface font-body-default"
        {...props}
      />
    </div>
  );
}
