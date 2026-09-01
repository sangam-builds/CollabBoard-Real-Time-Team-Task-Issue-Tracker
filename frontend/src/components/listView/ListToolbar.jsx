import React, { useState } from 'react';
import { useRole } from '../../context/RoleContext';

export default function ListToolbar({ selectedCount = 0, onBulkAction, onExportCsv }) {
  const { isOwnerOrAdmin, canBulkEdit } = useRole();
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  function handleExport() {
    if (onExportCsv) {
      onExportCsv();
    } else {
      alert('Exporting current table view to CSV...');
    }
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-t-lg p-3 flex justify-between items-center relative">
      {/* Left Actions */}
      <div className="flex items-center space-x-2">
        <button className="flex items-center space-x-2 px-3 py-1.5 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors font-body-sm text-body-sm cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          <span>Filter</span>
        </button>
        <button className="flex items-center space-x-2 px-3 py-1.5 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors font-body-sm text-body-sm cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">sort</span>
          <span>Sort</span>
        </button>
        <div className="w-px h-4 bg-outline-variant mx-2" />
        {/* Export to CSV: All roles have access per Section 7 */}
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-3 py-1.5 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors font-body-sm text-body-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Right Bulk Actions (Owner & Admin only per Section 7; disabled entirely for Members) */}
      {canBulkEdit && selectedCount > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowBulkMenu((prev) => !prev)}
            className="flex items-center space-x-2 px-4 py-1.5 rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors font-body-sm text-body-sm cursor-pointer shadow-xs animate-in fade-in duration-150"
          >
            <span>Bulk actions ({selectedCount})</span>
            <span className="material-symbols-outlined text-[18px]">arrow_drop_down</span>
          </button>

          {showBulkMenu && (
            <div className="absolute right-0 top-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg py-1 w-44 z-30 animate-in fade-in duration-150">
              <button
                onClick={() => {
                  setShowBulkMenu(false);
                  if (onBulkAction) onBulkAction('complete');
                }}
                className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                Mark as Done
              </button>
              <button
                onClick={() => {
                  setShowBulkMenu(false);
                  if (onBulkAction) onBulkAction('delete');
                }}
                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container/30 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete Selected
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
