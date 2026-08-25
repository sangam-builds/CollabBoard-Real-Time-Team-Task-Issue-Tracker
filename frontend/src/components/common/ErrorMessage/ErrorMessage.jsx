import React from 'react';

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="bg-error-container text-on-error-container border border-error/20 rounded-DEFAULT p-3 text-sm flex items-center gap-2 animate-fadeIn">
      <span className="material-symbols-outlined text-error text-lg flex-shrink-0">
        error
      </span>
      <span>{message}</span>
    </div>
  );
}
