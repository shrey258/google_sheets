import { useCallback } from 'react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';
import { evaluateFormula } from '../utils/formulaEvaluator';
import { CellData, FunctionType } from '../types';

export const useSpreadsheetFunctions = () => {
  const { cells, updateCellValue, updateCellFormula } = useSpreadsheetStore();
  
  // Evaluate a formula and update the cell
  const evaluateAndUpdateCell = useCallback((cellId: string, formula: string) => {
    // Verify cellId exists in the cells object
    if (!cells[cellId]) {
      console.error(`Cell ${cellId} not found in cells object`);
      return;
    }
    
    // If the formula hasn't changed, don't update
    if (cells[cellId].formula === formula) {
      return;
    }
    
    if (!formula.startsWith('=')) {
      updateCellValue(cellId, formula);
      updateCellFormula(cellId, '');
      return;
    }
    
    try {
      const result = evaluateFormula(formula, cells);
      // Only update if the value or formula has changed
      if (cells[cellId].value !== result.toString() || cells[cellId].formula !== formula) {
        updateCellValue(cellId, result.toString());
        updateCellFormula(cellId, formula);
      }
    } catch (error) {
      console.error(`Error evaluating formula in cell ${cellId}:`, error);
      updateCellValue(cellId, '#ERROR');
      updateCellFormula(cellId, formula);
    }
  }, [cells, updateCellValue, updateCellFormula]);
  
  // Apply a function to a range of cells
  const applyFunction = useCallback((
    functionType: FunctionType,
    targetCellId: string,
    rangeCellIds: string[]
  ) => {
    const values = rangeCellIds.map(id => cells[id]?.value || '');
    let result: string | number = '';
    let formula = '';
    
    try {
      switch (functionType) {
        case FunctionType.SUM:
          formula = `=SUM(${rangeCellIds.join(',')})`;
          break;
          
        case FunctionType.AVERAGE:
          formula = `=AVERAGE(${rangeCellIds.join(',')})`;
          break;
          
        case FunctionType.MAX:
          formula = `=MAX(${rangeCellIds.join(',')})`;
          break;
          
        case FunctionType.MIN:
          formula = `=MIN(${rangeCellIds.join(',')})`;
          break;
          
        case FunctionType.COUNT:
          formula = `=COUNT(${rangeCellIds.join(',')})`;
          break;
          
        case FunctionType.ROUND:
          // Get the value to round and prompt for decimal places
          const roundValue = rangeCellIds[0];
          const decimals = prompt('Enter number of decimal places:', '2');
          if (decimals === null) return;
          formula = `=ROUND(${roundValue},${decimals})`;
          break;
          
        case FunctionType.TRIM:
        case FunctionType.UPPER:
        case FunctionType.LOWER:
          if (rangeCellIds.length > 0) {
            const cellId = rangeCellIds[0];
            formula = `=${functionType}(${cellId})`;
            evaluateAndUpdateCell(targetCellId, formula);
          }
          break;
          
        case FunctionType.REMOVE_DUPLICATES:
          // This is more complex as it affects multiple cells
          // For simplicity, we'll just mark it as a formula
          if (rangeCellIds.length > 0) {
            const rangeStr = `${rangeCellIds[0]}:${rangeCellIds[rangeCellIds.length - 1]}`;
            formula = `=${functionType}(${rangeStr})`;
            evaluateAndUpdateCell(targetCellId, formula);
          }
          break;
          
        case FunctionType.FIND_AND_REPLACE:
          // Get find and replace values from user
          const findValue = prompt('Find:', '');
          const replaceValue = prompt('Replace with:', '');
          if (!findValue || !replaceValue) return;
          formula = `=FIND_AND_REPLACE(${rangeCellIds.join(',')}, "${findValue}", "${replaceValue}")`;
          break;
          
        case FunctionType.CONCATENATE:
          formula = `=CONCATENATE(${rangeCellIds.join(',')})`;
          break;
          
        case FunctionType.IF:
          // Get condition and values from user
          const condition = prompt('Enter condition (e.g., A1>10):', '');
          const trueValue = prompt('Value if true:', '');
          const falseValue = prompt('Value if false:', '');
          if (!condition || !trueValue || !falseValue) return;
          formula = `=IF(${condition}, "${trueValue}", "${falseValue}")`;
          break;
          
        case FunctionType.COUNTA:
          formula = `=COUNTA(${rangeCellIds.join(',')})`;
          break;
          
        case FunctionType.UNIQUE:
          formula = `=UNIQUE(${rangeCellIds.join(',')})`;
          break;
      }
      
      if (formula) {
        evaluateAndUpdateCell(targetCellId, formula);
      }
    } catch (error) {
      updateCellValue(targetCellId, '#ERROR');
    }
  }, [cells, evaluateAndUpdateCell, updateCellValue]);
  
  // Re-evaluate all formula cells
  const recalculateFormulas = useCallback(() => {
    try {
      const formulaCells: CellData[] = [];
      
      // Collect all formula cells
      Object.values(cells).forEach(cell => {
        if (cell && cell.formula && cell.formula.startsWith('=')) {
          formulaCells.push(cell);
        }
      });
      
      // Sort by dependencies (simple approach)
      // A more robust approach would involve topological sorting
      
      // Re-evaluate each formula
      formulaCells.forEach(cell => {
        try {
          evaluateAndUpdateCell(cell.id, cell.formula);
        } catch (cellError) {
          console.error(`Error recalculating formula for cell ${cell.id}:`, cellError);
        }
      });
    } catch (error) {
      console.error('Error in recalculateFormulas:', error);
    }
  }, [cells, evaluateAndUpdateCell]);
  
  return {
    evaluateAndUpdateCell,
    applyFunction,
    recalculateFormulas
  };
};

export default useSpreadsheetFunctions;
