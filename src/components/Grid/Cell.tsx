import React, { useState, useCallback } from 'react';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';
import { CellType, CellData } from '../../types';

interface CellProps {
  id: string;
  style: React.CSSProperties;
  onDragStart?: (cellId: string) => void;
  onDrag?: (cellId: string) => void;
  onDragEnd?: () => void;
}

const Cell: React.FC<CellProps> = ({ id, style, onDragStart, onDrag, onDragEnd }) => {
  const { 
    cells,
    selectedCell,
    selectedRange,
    setSelectedCell,
    updateCellValue,
    updateCellFormula,
    setActiveFormula
  } = useSpreadsheetStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Get cell data
  const cellData: CellData = cells[id] || { value: '', type: CellType.Empty, formula: '', style: {} };
  const isSelected = selectedCell === id;
  const isInRange = selectedRange?.includes(id);

  // Handle cell selection
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (e.shiftKey && selectedCell) {
      // Handle range selection
      onDrag?.(id);
    } else {
      setSelectedCell(id);
      if (cellData.type === CellType.Formula) {
        setActiveFormula(cellData.formula);
      } else {
        setActiveFormula('');
      }
    }
  }, [id, selectedCell, cellData, setSelectedCell, setActiveFormula, onDrag]);

  // Handle double click to edit
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setEditValue(cellData.type === CellType.Formula ? cellData.formula : cellData.value);
  }, [cellData]);

  // Handle edit finish
  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editValue.startsWith('=')) {
      updateCellFormula(id, editValue);
    } else {
      updateCellValue(id, editValue);
    }
  }, [id, editValue, updateCellValue, updateCellFormula]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
  }, [handleBlur]);

  // Handle drag operations
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', id);
    onDragStart?.(id);
  }, [id, onDragStart]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDrag?.(id);
  }, [id, onDrag]);

  const handleDragEnd = useCallback(() => {
    onDragEnd?.();
  }, [onDragEnd]);

  // Render cell content
  const displayValue = cellData.type === CellType.Formula ? cellData.value : cellData.value;

  return (
    <div
      className={`cell ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''}`}
      style={{
        ...style,
        ...cellData.style,
        position: 'absolute',
        border: '1px solid #e0e0e0',
        padding: '4px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        backgroundColor: isSelected ? '#e8f0fe' : isInRange ? '#f8f9fa' : 'white',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          autoFocus
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            padding: 0,
            font: 'inherit'
          }}
        />
      ) : (
        displayValue
      )}
    </div>
  );
};

export default React.memo(Cell);
