import React, { useCallback } from 'react';
import { Row } from '../../types';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';

export interface RowHeaderProps {
  index: number;
  row: Row;
  height: number;
  style: React.CSSProperties;
}

const RowHeader: React.FC<RowHeaderProps> = ({ index, row, height, style }) => {
  const { 
    resizeRow, 
    addRow, 
    deleteRow 
  } = useSpreadsheetStore();

  if (!row) {
    return null;
  }
  
  // Handle right-click for context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // In a real implementation, you would show a context menu here
    // For simplicity, we'll just alert the options
    const action = window.confirm(
      `Row ${index + 1}\n\nChoose an action:\n- OK to insert row\n- Cancel to delete row`
    );
    
    if (action) {
      // Insert row
      addRow(index);
    } else {
      // Delete row
      deleteRow(index);
    }
  }, [index, addRow, deleteRow]);
  
  // Handle resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    const startY = e.clientY;
    const startHeight = height;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(24, startHeight + deltaY);
      resizeRow(index, newHeight);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [index, height, resizeRow]);
  
  return (
    <div
      className="row-header header-cell relative flex items-center justify-center"
      style={{ height: `${height}px`, ...style }}
      onContextMenu={handleContextMenu}
    >
      <span className="text-xs text-gray-700">{index + 1}</span>
      
      {/* Resize handle */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-transparent hover:bg-gray-400 cursor-row-resize"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default React.memo(RowHeader);
