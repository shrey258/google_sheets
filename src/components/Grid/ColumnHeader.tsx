import React, { useCallback } from 'react';
import { Column } from '../../types';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';

export interface ColumnHeaderProps {
  index: number;
  column: Column;
  width: number;
  style: React.CSSProperties;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ index, column, width, style }) => {
  const { 
    resizeColumn, 
    addColumn, 
    deleteColumn 
  } = useSpreadsheetStore();

  if (!column) {
    return null;
  }
  
  // Convert column index to letter (A, B, C, ..., Z, AA, AB, ...)
  const getColumnLabel = (index: number): string => {
    let label = '';
    let temp = index;
    while (temp >= 0) {
      label = String.fromCharCode(65 + (temp % 26)) + label;
      temp = Math.floor(temp / 26) - 1;
    }
    return label;
  };
  
  // Handle right-click for context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // In a real implementation, you would show a context menu here
    // For simplicity, we'll just alert the options
    const action = window.confirm(
      `Column ${getColumnLabel(index)}\n\nChoose an action:\n- OK to insert column\n- Cancel to delete column`
    );
    
    if (action) {
      // Insert column
      addColumn(index);
    } else {
      // Delete column
      deleteColumn(index);
    }
  }, [index, addColumn, deleteColumn]);
  
  // Handle resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    const startX = e.clientX;
    const startWidth = width;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(40, startWidth + deltaX);
      resizeColumn(index, newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [index, width, resizeColumn]);
  
  return (
    <div 
      className="column-header header-cell relative flex items-center justify-center"
      onContextMenu={handleContextMenu}
      style={{ width: `${column.width}px`, ...style }}
    >
      <span className="text-xs text-gray-700">{column.id}</span>
      
      {/* Resize handle */}
      <div 
        className="absolute top-0 right-0 bottom-0 w-1 bg-transparent hover:bg-gray-400 cursor-col-resize"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default React.memo(ColumnHeader);
