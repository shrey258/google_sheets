import { useState, useCallback } from 'react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';
import { Position } from '../types';

export const useDragOperations = () => {
  const { 
    getCellPosition, 
    getCellIdFromPosition, 
    selectCell, 
    selectRange,
    cells,
    updateCellValue,
    updateCellFormula,
    updateCellStyle
  } = useSpreadsheetStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<string | null>(null);
  const [dragEndCell, setDragEndCell] = useState<string | null>(null);
  
  // Start cell selection drag
  const startCellDrag = useCallback((cellId: string) => {
    setIsDragging(true);
    setDragStartCell(cellId);
    setDragEndCell(cellId);
    selectCell(cellId);
  }, [selectCell]);
  
  // Update drag selection
  const updateCellDrag = useCallback((cellId: string) => {
    if (!isDragging || !dragStartCell) return;
    
    setDragEndCell(cellId);
    selectRange(dragStartCell, cellId);
  }, [isDragging, dragStartCell, selectRange]);
  
  // End drag selection
  const endCellDrag = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Handle cell fill drag (e.g., dragging the bottom-right corner to fill values)
  const handleCellFill = useCallback((sourceCellId: string, targetCellIds: string[]) => {
    const sourceCell = cells[sourceCellId];
    if (!sourceCell) return;
    
    // Apply source cell value/formula to target cells
    targetCellIds.forEach(targetId => {
      updateCellValue(targetId, sourceCell.value);
      if (sourceCell.formula) {
        updateCellFormula(targetId, sourceCell.formula);
      }
      
      // Copy style
      updateCellStyle(targetId, sourceCell.style);
    });
  }, [cells, updateCellValue, updateCellFormula, updateCellStyle]);
  
  // Handle cell content drag (moving cell content)
  const handleCellMove = useCallback((sourceCellId: string, targetCellId: string) => {
    const sourceCell = cells[sourceCellId];
    const targetCell = cells[targetCellId];
    
    if (!sourceCell || !targetCell) return;
    
    // Move content from source to target
    updateCellValue(targetCellId, sourceCell.value);
    updateCellFormula(targetCellId, sourceCell.formula);
    updateCellStyle(targetCellId, sourceCell.style);
    
    // Clear source cell
    updateCellValue(sourceCellId, '');
    updateCellFormula(sourceCellId, '');
  }, [cells, updateCellValue, updateCellFormula, updateCellStyle]);
  
  return {
    isDragging,
    dragStartCell,
    dragEndCell,
    startCellDrag,
    updateCellDrag,
    endCellDrag,
    handleCellFill,
    handleCellMove
  };
};

export default useDragOperations;
