import { useCallback } from 'react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';
import { adjustFormula } from '../utils/advancedFormulaParser';

/**
 * Custom hook for copy and paste operations in the spreadsheet
 */
const useCopyPaste = () => {
  const {
    cells,
    selectedCell,
    selectedRange,
    updateCellValue,
    updateCellFormula,
    updateCellStyle,
    getCellPosition,
    getCellIdFromPosition
  } = useSpreadsheetStore();

  /**
   * Copy selected cells to clipboard
   */
  const copySelectedCells = useCallback(() => {
    if (!selectedRange || selectedRange.length === 0) return;

    // Store cell data for internal use
    const copiedCells = selectedRange.map(cellId => ({
      cellId,
      position: getCellPosition(cellId),
      data: cells[cellId] || { value: '', formula: '', style: {} }
    }));

    // Store in localStorage for persistence
    localStorage.setItem('copiedCells', JSON.stringify(copiedCells));

    // Find min row and column for relative positioning
    const positions = copiedCells.map(cell => cell.position);
    const minRow = Math.min(...positions.map(pos => pos.row));
    const minCol = Math.min(...positions.map(pos => pos.col));

    // Store origin for relative positioning
    localStorage.setItem('copyOrigin', JSON.stringify({ row: minRow, col: minCol }));

    return copiedCells;
  }, [cells, selectedRange, getCellPosition]);

  /**
   * Paste cells at the selected cell
   */
  const pasteCells = useCallback(() => {
    if (!selectedCell) return;

    // Get copied cells from localStorage
    const copiedCellsJson = localStorage.getItem('copiedCells');
    const copyOriginJson = localStorage.getItem('copyOrigin');

    if (!copiedCellsJson || !copyOriginJson) return;

    const copiedCells = JSON.parse(copiedCellsJson);
    const copyOrigin = JSON.parse(copyOriginJson);
    const targetPosition = getCellPosition(selectedCell);

    // Calculate offset from origin
    const rowOffset = targetPosition.row - copyOrigin.row;
    const colOffset = targetPosition.col - copyOrigin.col;

    // Paste each cell with adjusted position
    copiedCells.forEach(({ position, data }: { position: { row: number, col: number }, data: any }) => {
      const newRow = position.row + rowOffset;
      const newCol = position.col + colOffset;
      const newCellId = getCellIdFromPosition({ row: newRow, col: newCol });

      // Copy value
      if (data.value) {
        updateCellValue(newCellId, data.value);
      }

      // Copy and adjust formula if present
      if (data.formula) {
        const adjustedFormula = adjustFormula(data.formula, rowOffset, colOffset);
        updateCellFormula(newCellId, adjustedFormula);
      }

      // Copy style
      if (data.style && Object.keys(data.style).length > 0) {
        updateCellStyle(newCellId, data.style);
      }
    });
  }, [selectedCell, getCellPosition, getCellIdFromPosition, updateCellValue, updateCellFormula, updateCellStyle]);

  /**
   * Cut selected cells (copy and clear)
   */
  const cutSelectedCells = useCallback(() => {
    if (!selectedRange || selectedRange.length === 0) return;

    // Copy first
    const copiedCells = copySelectedCells();

    // Then clear the cells
    selectedRange.forEach(cellId => {
      updateCellValue(cellId, '');
      updateCellFormula(cellId, '');
      updateCellStyle(cellId, {});
    });

    return copiedCells;
  }, [selectedRange, copySelectedCells, updateCellValue, updateCellFormula, updateCellStyle]);

  return {
    copySelectedCells,
    pasteCells,
    cutSelectedCells
  };
};

export default useCopyPaste;
