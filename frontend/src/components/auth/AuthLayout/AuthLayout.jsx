import React from 'react';
import BrandPanel from '../BrandPanel';

export default function AuthLayout({ children }) {
  return (
    <div className="bg-background text-on-surface h-screen w-full flex flex-col md:flex-row overflow-hidden font-body-default text-body-default">
      {/* Left Panel: Graphic / Brand */}
      <BrandPanel />

      {/* Right Panel: Auth Content (Login Form) */}
      <div className="flex-1 flex flex-col justify-center items-center bg-surface-container-lowest p-margin md:p-xl relative overflow-y-auto">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="md:hidden absolute top-0 left-0 w-full p-margin flex justify-between items-center border-b border-outline-variant bg-surface-container-lowest z-10">
          <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            CollabBoard
          </h1>
        </div>

        {children}
      </div>
    </div>
  );
}
