import React, { useEffect } from 'react';
import Toolbar from '../Toolbar/Toolbar';
import FormulaBar from '../FormulaBar/FormulaBar';
import Grid from '../Grid/Grid';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';
import useSpreadsheetFunctions from '../../hooks/useSpreadsheetFunctions';

const Spreadsheet: React.FC = () => {
  const { 
    cells,
    selectedCell,
    selectedRange
  } = useSpreadsheetStore();
  
  const { recalculateFormulas } = useSpreadsheetFunctions();
  
  // Recalculate formulas when cells change
  useEffect(() => {
    const cellsWithFormulas = Object.entries(cells).filter(([_, cell]) => cell.type === 'formula');
    if (cellsWithFormulas.length > 0) {
      recalculateFormulas();
    }
  }, [cells, recalculateFormulas]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      
      const { getCellPosition, getCellIdFromPosition, selectCell } = useSpreadsheetStore.getState();
      const position = getCellPosition(selectedCell);
      
      let newPosition = { ...position };
      
      switch (e.key) {
        case 'ArrowUp':
          newPosition.row = Math.max(0, position.row - 1);
          break;
        case 'ArrowDown':
          newPosition.row = position.row + 1;
          break;
        case 'ArrowLeft':
          newPosition.col = Math.max(0, position.col - 1);
          break;
        case 'ArrowRight':
          newPosition.col = position.col + 1;
          break;
        default:
          return;
      }
      
      const newCellId = getCellIdFromPosition(newPosition);
      selectCell(newCellId);
      e.preventDefault();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell]);
  
  return (
    <div className="flex flex-col h-screen">
      <Toolbar />
      <FormulaBar />
      <div className="flex-1 overflow-hidden">
        <Grid />
      </div>
      <div className="status-bar flex items-center justify-between p-1 text-xs text-gray-600 border-t border-gray-300 bg-gray-50">
        <div>
          {selectedCell && (
            <span>Selected: {selectedCell}</span>
          )}
          {selectedRange && selectedRange.length > 1 && (
            <span> (Range: {selectedRange.length} cells)</span>
          )}
        </div>
        <div>
          Ready
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;
