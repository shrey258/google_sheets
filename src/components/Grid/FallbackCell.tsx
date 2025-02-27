import React from 'react';

interface FallbackCellProps {
  cellId?: string;
  error?: Error;
}

const FallbackCell: React.FC<FallbackCellProps> = ({ cellId, error }) => {
  return (
    <div 
      className="cell fallback-cell bg-red-50 border border-red-200" 
      data-cell-id={cellId}
    >
      <span className="text-xs text-red-500">
        {error ? error.message : 'Error'}
      </span>
    </div>
  );
};

export default FallbackCell;
