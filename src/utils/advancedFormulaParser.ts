import { CellData, CellType } from '../types';
import {
  evaluateSUM,
  evaluateAVERAGE,
  evaluateMAX,
  evaluateMIN,
  evaluateCOUNT,
  evaluateMEDIAN,
  evaluateSTDEV,
  evaluateTRIM,
  evaluateUPPER,
  evaluateLOWER,
  evaluateLEN,
  evaluateSUBSTRING,
  evaluateCONCATENATE,
  evaluateIF,
  evaluateROUND,
  evaluateCOUNTA,
  evaluateUNIQUE,
  evaluateREMOVE_DUPLICATES,
  evaluateFIND_AND_REPLACE,
  isCellReference,
  isRangeReference,
  parseRangeReference,
  evaluateFormula
} from './formulaEvaluator';

/**
 * Represents a cell reference type
 */
export enum ReferenceType {
  RELATIVE, // A1
  ABSOLUTE_ROW, // A$1
  ABSOLUTE_COLUMN, // $A1
  ABSOLUTE // $A$1
}

/**
 * Represents a parsed cell reference
 */
export interface ParsedCellReference {
  original: string;
  col: string;
  row: number;
  colAbsolute: boolean;
  rowAbsolute: boolean;
}

/**
 * Parse a cell reference string into its components
 * @param reference Cell reference string (e.g., A1, $A1, A$1, $A$1)
 * @returns Parsed cell reference object or null if invalid
 */
export function parseCellReference(reference: string): ParsedCellReference | null {
  // Regular expression to match cell references
  // Group 1: Optional $ for absolute column
  // Group 2: Column letters
  // Group 3: Optional $ for absolute row
  // Group 4: Row number
  const regex = /^(\$?)([A-Z]+)(\$?)(\d+)$/;
  const match = reference.match(regex);
  
  if (!match) {
    return null;
  }
  
  const [, absCol, column, absRow, rowStr] = match;
  const row = parseInt(rowStr, 10);
  
  return {
    original: reference,
    col: column,
    row,
    colAbsolute: absCol === '$',
    rowAbsolute: absRow === '$'
  };
}

/**
 * Convert column index to column letter (A, B, C, ..., Z, AA, AB, ...)
 * @param index Column index (0-based)
 * @returns Column letter
 */
export function indexToColumn(index: number): string {
  let column = '';
  let temp = index;
  
  while (temp >= 0) {
    column = String.fromCharCode(65 + (temp % 26)) + column;
    temp = Math.floor(temp / 26) - 1;
  }
  
  return column;
}

/**
 * Convert column letter to column index (0-based)
 * @param column Column letter (A, B, C, ..., Z, AA, AB, ...)
 * @returns Column index
 */
export function columnToIndex(column: string): number {
  let index = 0;
  
  for (let i = 0; i < column.length; i++) {
    index = index * 26 + column.charCodeAt(i) - 64;
  }
  
  return index - 1;
}

/**
 * Adjust a cell reference when copying formulas
 * @param reference Original cell reference
 * @param rowOffset Number of rows to offset
 * @param colOffset Number of columns to offset
 * @returns Adjusted cell reference
 */
export function adjustCellReference(
  reference: ParsedCellReference,
  rowOffset: number,
  colOffset: number
): string {
  const { col, row, colAbsolute, rowAbsolute } = reference;
  
  // If absolute, don't adjust
  const newCol = colAbsolute ? col : indexToColumn(columnToIndex(col) + colOffset);
  const newRow = rowAbsolute ? row : row + rowOffset;
  
  // Reconstruct the reference
  const colPrefix = colAbsolute ? '$' : '';
  const rowPrefix = rowAbsolute ? '$' : '';
  
  return `${colPrefix}${newCol}${rowPrefix}${newRow}`;
}

/**
 * Find all cell references in a formula
 * @param formula Formula string
 * @returns Array of cell references
 */
export function findCellReferences(formula: string): string[] {
  // Regular expression to match cell references
  const regex = /(\$?[A-Z]+\$?\d+)/g;
  return formula.match(regex) || [];
}

/**
 * Adjust a formula when copying to a new location
 * @param formula Original formula
 * @param rowOffset Number of rows to offset
 * @param colOffset Number of columns to offset
 * @returns Adjusted formula
 */
export function adjustFormula(
  formula: string,
  rowOffset: number,
  colOffset: number
): string {
  // If not a formula, return as is
  if (!formula.startsWith('=')) {
    return formula;
  }
  
  // Find all cell references
  const cellRefs = findCellReferences(formula);
  let adjustedFormula = formula;
  
  // Adjust each reference
  for (const ref of cellRefs) {
    const parsedRef = parseCellReference(ref);
    if (parsedRef) {
      const adjustedRef = adjustCellReference(parsedRef, rowOffset, colOffset);
      
      // Replace the reference in the formula
      adjustedFormula = adjustedFormula.replace(ref, adjustedRef);
    }
  }
  
  return adjustedFormula;
}

/**
 * Check if a formula contains circular references
 * @param startCell Cell ID to start checking from
 * @param cells All cells data
 * @param visited Set of visited cells (for recursion)
 * @returns True if circular reference is detected
 */
export function hasCircularReference(
  startCell: string,
  cells: Record<string, CellData>,
  visited = new Set<string>()
): boolean {
  // If cell has been visited, we have a circular reference
  if (visited.has(startCell)) {
    return true;
  }

  // Add current cell to visited set
  visited.add(startCell);

  // Get the cell's formula
  const cell = cells[startCell];
  if (!cell || !cell.formula || !cell.formula.startsWith('=')) {
    return false;
  }

  // Find all references in the formula
  const refs = findCellReferences(cell.formula);
  
  // Check each reference for circular dependencies
  for (const ref of refs) {
    if (hasCircularReference(ref, cells, visited)) {
      return true;
    }
  }

  return false;
}

/**
 * Get all dependent cells for a given cell
 * @param cellId Cell ID to find dependents for
 * @param cells All cells data
 * @returns Array of cell IDs that depend on the given cell
 */
export function getDependentCells(
  cellId: string,
  cells: Record<string, CellData>
): string[] {
  const dependents: string[] = [];
  
  // Check each cell to see if it references our cell
  for (const [id, cell] of Object.entries(cells)) {
    if (cell.formula && findCellReferences(cell.formula).includes(cellId)) {
      dependents.push(id);
    }
  }
  
  return dependents;
}

/**
 * Build a dependency graph for all cells
 * @param cells All cells data
 * @returns Map of cell IDs to their dependent cells
 */
export function buildDependencyGraph(
  cells: Record<string, CellData>
): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  
  // For each cell with a formula
  for (const [id, cell] of Object.entries(cells)) {
    if (cell.formula) {
      // Find all references in the formula
      const refs = findCellReferences(cell.formula);
      
      // Add edges from each referenced cell to this cell
      for (const ref of refs) {
        if (!graph.has(ref)) {
          graph.set(ref, []);
        }
        graph.get(ref)!.push(id);
      }
    }
  }
  
  return graph;
}

/**
 * Get cells to recalculate in the correct order
 * @param changedCellId Cell ID that was changed
 * @param cells All cells data
 * @returns Array of cell IDs to recalculate in the correct order
 */
export function getCellsToRecalculate(
  changedCellId: string,
  cells: Record<string, CellData>
): string[] {
  const graph = buildDependencyGraph(cells);
  const result: string[] = [];
  const visited = new Set<string>();
  
  function visit(cellId: string) {
    // If already visited, skip
    if (visited.has(cellId)) {
      return;
    }
    
    visited.add(cellId);
    
    // Visit all dependents
    const dependents = graph.get(cellId) || [];
    for (const dependent of dependents) {
      visit(dependent);
    }
    
    result.push(cellId);
  }
  
  visit(changedCellId);
  
  // Remove the changed cell from the result
  return result.filter(id => id !== changedCellId);
}

/**
 * Parse a formula string into its components
 * @param formula Formula string
 * @returns Array of formula components
 */
export function parseFormula(formula: string): string[] {
  const components: string[] = [];
  let currentComponent = '';
  let inString = false;
  let parenCount = 0;

  for (let i = 0; i < formula.length; i++) {
    const char = formula[i];

    // Handle string literals
    if (char === '"' || char === "'") {
      if (!inString) {
        if (currentComponent) {
          components.push(currentComponent);
          currentComponent = '';
        }
        inString = true;
      } else {
        inString = false;
        components.push(currentComponent);
        currentComponent = '';
        continue;
      }
    }

    // If we're in a string, just add the character
    if (inString) {
      currentComponent += char;
      continue;
    }

    // Handle parentheses
    if (char === '(') {
      parenCount++;
      if (parenCount === 1 && currentComponent) {
        components.push(currentComponent.trim());
        currentComponent = '';
      }
      currentComponent += char;
      continue;
    }

    if (char === ')') {
      parenCount--;
      currentComponent += char;
      if (parenCount === 0) {
        components.push(currentComponent.trim());
        currentComponent = '';
      }
      continue;
    }

    // Handle operators
    if (parenCount === 0 && /[\+\-\*\/\=\<\>\&\|]/.test(char)) {
      if (currentComponent) {
        components.push(currentComponent.trim());
      }
      components.push(char);
      currentComponent = '';
      continue;
    }

    currentComponent += char;
  }

  if (currentComponent) {
    components.push(currentComponent.trim());
  }

  return components;
}

/**
 * Evaluate an expression
 * @param expression Expression string
 * @param cells All cells data
 * @returns Evaluated result
 */
export function evaluateExpression(expression: string, cells: Record<string, CellData>): string | number {
  try {
    // Handle function calls
    if (expression.includes('(')) {
      const functionMatch = expression.match(/^([A-Z_]+)\((.*)\)$/);
      if (functionMatch) {
        const [, functionName, args] = functionMatch;
        const evaluatedArgs = args.split(',').map(arg => evaluateExpression(arg.trim(), cells));
        
        switch (functionName) {
          case 'SUM':
            return evaluateSUM(evaluatedArgs);
          case 'AVERAGE':
            return evaluateAVERAGE(evaluatedArgs);
          case 'MAX':
            return evaluateMAX(evaluatedArgs);
          case 'MIN':
            return evaluateMIN(evaluatedArgs);
          case 'COUNT':
            return evaluateCOUNT(evaluatedArgs);
          case 'MEDIAN':
            return evaluateMEDIAN(evaluatedArgs);
          case 'STDEV':
            return evaluateSTDEV(evaluatedArgs);
          case 'TRIM':
            return evaluateTRIM(String(evaluatedArgs[0]));
          case 'UPPER':
            return evaluateUPPER(String(evaluatedArgs[0]));
          case 'LOWER':
            return evaluateLOWER(String(evaluatedArgs[0]));
          case 'LEN':
            return evaluateLEN(String(evaluatedArgs[0]));
          case 'SUBSTRING':
            return evaluateSUBSTRING(
              String(evaluatedArgs[0]),
              Number(evaluatedArgs[1]),
              evaluatedArgs[2] !== undefined ? Number(evaluatedArgs[2]) : undefined
            );
          case 'CONCATENATE':
            return evaluateCONCATENATE(evaluatedArgs);
          case 'REMOVE_DUPLICATES':
            return evaluateREMOVE_DUPLICATES(evaluatedArgs.map(String));
          case 'FIND_AND_REPLACE':
            return evaluateFIND_AND_REPLACE(
              evaluatedArgs.slice(0, -2).map(String),
              String(evaluatedArgs[evaluatedArgs.length - 2]),
              String(evaluatedArgs[evaluatedArgs.length - 1])
            );
          case 'IF':
            return evaluateIF(evaluatedArgs[0], evaluatedArgs[1], evaluatedArgs[2]);
          case 'COUNTA':
            return evaluateCOUNTA(evaluatedArgs);
          case 'UNIQUE':
            return evaluateUNIQUE(evaluatedArgs);
          case 'ROUND':
            return evaluateROUND(evaluatedArgs[0], evaluatedArgs[1]);
          default:
            throw new Error(`Unknown function: ${functionName}`);
        }
      }
    }

    // Handle cell references
    if (isCellReference(expression)) {
      const cell = cells[expression];
      if (!cell) return '';
      return cell.type === CellType.Formula
        ? evaluateFormula(cell.formula, cells)
        : cell.value;
    }

    // Handle range references
    if (isRangeReference(expression)) {
      const refs = parseRangeReference(expression);
      const values = refs.map(ref => {
        const cell = cells[ref];
        if (!cell) return '';
        return cell.type === CellType.Formula
          ? evaluateFormula(cell.formula, cells)
          : cell.value;
      });
      return values;
    }

    // Handle numbers
    if (!isNaN(Number(expression))) {
      return Number(expression);
    }

    // Handle strings
    if (expression.startsWith('"') || expression.startsWith("'")) {
      return expression.slice(1, -1);
    }

    // Handle basic arithmetic
    const arithmeticMatch = expression.match(/^(.+?)([\+\-\*\/])(.+)$/);
    if (arithmeticMatch) {
      const [, left, operator, right] = arithmeticMatch;
      const leftValue = evaluateExpression(left.trim(), cells);
      const rightValue = evaluateExpression(right.trim(), cells);

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        switch (operator) {
          case '+': return leftValue + rightValue;
          case '-': return leftValue - rightValue;
          case '*': return leftValue * rightValue;
          case '/': return rightValue === 0 ? '#DIV/0!' : leftValue / rightValue;
        }
      }
    }

    return expression;
  } catch (error) {
    console.error('Expression evaluation error:', error);
    return '#ERROR!';
  }
}

// ... rest of the code remains the same ...
