import React from 'react';

export default function BrandPanel() {
  return (
    <div className="relative hidden md:flex flex-1 flex-col justify-between bg-surface-container-low p-xl overflow-hidden border-r border-outline-variant">
      <div className="z-10">
        <h1 className="font-section-headline text-section-headline text-on-surface">
          CollabBoard
        </h1>
      </div>

      <div className="z-10 max-w-md">
        <p className="font-section-headline text-section-headline text-on-surface mb-lg">
          See what's next, not just what's due.
        </p>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Kinetic precision for modern technical teams. Plan, execute, and visualize dependencies
          without the clutter.
        </p>
      </div>

      <div className="z-10">
        <span className="font-label-mono text-label-mono text-on-surface-variant">
          v2.4.0 System Build
        </span>
      </div>
    </div>
  );
}
