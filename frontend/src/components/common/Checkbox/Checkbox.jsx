import React from 'react';

export default function Checkbox({ id, checked, onChange, label, className = '' }) {
  return (
    <div className={`flex items-center gap-xs mt-xs ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 border-outline-variant rounded text-primary focus:ring-primary accent-primary cursor-pointer"
      />
      {label && (
        <label
          htmlFor={id}
          className="font-body-default text-body-default text-on-surface-variant cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}
