import { CellData, CellType } from '../types';
import {
  findCellReferences,
  hasCircularReference,
  columnToIndex,
  indexToColumn
} from './helpers';

// Helper to check if a string is a valid cell reference (e.g., A1, B2)
export const isCellReference = (value: string): boolean => {
  return /^(\$?[A-Z]+\$?[1-9][0-9]*)$/.test(value);
};

// Helper to check if a string is a valid range reference (e.g., A1:B5)
export const isRangeReference = (value: string): boolean => {
  return /^(\$?[A-Z]+\$?[1-9][0-9]*):(\$?[A-Z]+\$?[1-9][0-9]*)$/.test(value);
};

// Parse a range reference into an array of cell references
export const parseRangeReference = (range: string): string[] => {
  const [start, end] = range.split(':');
  
  // Extract column letters and row numbers
  const startMatch = start.match(/(\$?)([A-Z]+)(\$?)([1-9][0-9]*)/);
  const endMatch = end.match(/(\$?)([A-Z]+)(\$?)([1-9][0-9]*)/);
  
  if (!startMatch || !endMatch) {
    throw new Error(`Invalid range reference: ${range}`);
  }
  
  const startCol = startMatch[2];
  const startRow = parseInt(startMatch[4], 10);
  const endCol = endMatch[2];
  const endRow = parseInt(endMatch[4], 10);
  
  // Convert column letters to indices
  const startColIndex = columnToIndex(startCol);
  const endColIndex = columnToIndex(endCol);
  
  const cellRefs: string[] = [];
  
  // Generate all cell references in the range
  for (let row = Math.min(startRow, endRow); row <= Math.max(startRow, endRow); row++) {
    for (let colIndex = Math.min(startColIndex, endColIndex); colIndex <= Math.max(startColIndex, endColIndex); colIndex++) {
      const colLetter = indexToColumn(colIndex);
      cellRefs.push(`${colLetter}${row}`);
    }
  }
  
  return cellRefs;
};

// Mathematical functions
export function evaluateSUM(values: (string | number)[]): number {
  const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
  return numbers.reduce((sum, n) => sum + n, 0);
}

export function evaluateAVERAGE(values: (string | number)[]): number {
  const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

export function evaluateMAX(values: (string | number)[]): number {
  const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
}

export function evaluateMIN(values: (string | number)[]): number {
  const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
  if (numbers.length === 0) return 0;
  return Math.min(...numbers);
}

export function evaluateCOUNT(values: (string | number)[]): number {
  return values.map(v => Number(v)).filter(n => !isNaN(n)).length;
}

export function evaluateMEDIAN(values: (string | number)[]): number {
  const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
  if (numbers.length === 0) return 0;
  
  numbers.sort((a, b) => a - b);
  const mid = Math.floor(numbers.length / 2);
  
  return numbers.length % 2 === 0
    ? (numbers[mid - 1] + numbers[mid]) / 2
    : numbers[mid];
}

export function evaluateSTDEV(values: (string | number)[]): number {
  const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
  if (numbers.length <= 1) return 0;
  
  const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
  const variance = squaredDiffs.reduce((sum, n) => sum + n, 0) / (numbers.length - 1);
  
  return Math.sqrt(variance);
}

export function evaluateTRIM(value: string): string {
  return value.trim();
}

export function evaluateUPPER(value: string): string {
  return value.toUpperCase();
}

export function evaluateLOWER(value: string): string {
  return value.toLowerCase();
}

export function evaluateLEN(value: string): number {
  return value.length;
}

export function evaluateSUBSTRING(value: string, start: number, end?: number): string {
  return end !== undefined ? value.substring(start, end) : value.substring(start);
}

export function evaluateCONCATENATE(values: (string | number)[]): string {
  return values.join('');
}

export function evaluateREMOVE_DUPLICATES(values: (string | number)[]): (string | number)[] {
  return [...new Set(values)];
}

export function evaluateFIND_AND_REPLACE(
  values: (string | number)[],
  find: string,
  replace: string
): (string | number)[] {
  return values.map(v => String(v).replace(new RegExp(find, 'g'), replace));
}

export function evaluateIF(
  condition: string | number | boolean,
  trueValue: string | number | (string | number)[],
  falseValue: string | number | (string | number)[]
): string | number | (string | number)[] {
  const isTrue = typeof condition === 'boolean' ? condition :
    typeof condition === 'number' ? condition !== 0 :
    condition.toLowerCase() !== 'false' && condition !== '0' && condition !== '';
  
  return isTrue ? trueValue : falseValue;
}

export function evaluateCOUNTA(values: (string | number)[]): number {
  return values.filter(v => v !== null && v !== undefined && v !== '').length;
}

export function evaluateUNIQUE(values: (string | number)[]): (string | number)[] {
  return [...new Set(values)];
}

export function evaluateROUND(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// Helper function to check if a value is a number
export const isNumber = (value: any): boolean => {
  return !isNaN(Number(value)) && value !== null && value !== undefined && value !== '';
};

// Helper function to convert array results to single values for IF conditions
function convertArrayToValue(value: string | number | (string | number)[]): string | number | boolean {
  if (Array.isArray(value)) {
    if (value.length === 0) return false;
    if (value.length === 1) return value[0];
    // For multiple values, convert to string and evaluate as boolean
    return value.join(', ').length > 0;
  }
  return value;
}

// Main formula evaluator
export const evaluateFormula = (formula: string, cells: Record<string, CellData>): string | number => {
  try {
    if (!formula.startsWith('=')) {
      return formula;
    }

    // Check for circular references
    const cellRefs = findCellReferences(formula);
    if (hasCircularReference(cellRefs, cells)) {
      return '#CIRCULAR!';
    }

    const expression = formula.substring(1);
    const result = evaluateExpression(expression, cells);
    
    // Convert array results to a single value
    if (Array.isArray(result)) {
      if (result.length === 0) return '';
      if (result.length === 1) return result[0];
      return result.join(', ');
    }
    
    return result;
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return '#ERROR!';
  }
};

/**
 * Parse a formula into components
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
 */
export function evaluateExpression(expression: string, cells: Record<string, CellData>): string | number | (string | number)[] {
  try {
    // Handle function calls
    if (expression.includes('(')) {
      const functionMatch = expression.match(/^([A-Z_]+)\((.*)\)$/);
      if (functionMatch) {
        const [, functionName, args] = functionMatch;
        const evaluatedArgs = args.split(',').map(arg => evaluateExpression(arg.trim(), cells));
        
        // Flatten array arguments for functions that expect flat values
        const flattenedArgs = evaluatedArgs.map(arg => Array.isArray(arg) ? arg : [arg]).flat();
        
        switch (functionName) {
          case 'SUM':
            return evaluateSUM(flattenedArgs.map(String));
          case 'AVERAGE':
            return evaluateAVERAGE(flattenedArgs.map(String));
          case 'MAX':
            return evaluateMAX(flattenedArgs.map(String));
          case 'MIN':
            return evaluateMIN(flattenedArgs.map(String));
          case 'COUNT':
            return evaluateCOUNT(flattenedArgs.map(String));
          case 'MEDIAN':
            return evaluateMEDIAN(flattenedArgs.map(String));
          case 'STDEV':
            return evaluateSTDEV(flattenedArgs.map(String));
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
            return evaluateCONCATENATE(flattenedArgs.map(String));
          case 'REMOVE_DUPLICATES':
            return evaluateREMOVE_DUPLICATES(flattenedArgs.map(String));
          case 'FIND_AND_REPLACE':
            return evaluateFIND_AND_REPLACE(
              flattenedArgs.slice(0, -2).map(String),
              String(flattenedArgs[flattenedArgs.length - 2]),
              String(flattenedArgs[flattenedArgs.length - 1])
            );
          case 'IF':
            return evaluateIF(
              convertArrayToValue(evaluatedArgs[0]),
              evaluatedArgs[1],
              evaluatedArgs[2]
            );
          case 'COUNTA':
            return evaluateCOUNTA(flattenedArgs.map(String));
          case 'UNIQUE':
            return evaluateUNIQUE(flattenedArgs.map(String));
          case 'ROUND':
            return evaluateROUND(Number(evaluatedArgs[0]), Number(evaluatedArgs[1]));
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
      return refs.map(ref => {
        const cell = cells[ref];
        if (!cell) return '';
        return cell.type === CellType.Formula
          ? evaluateFormula(cell.formula, cells)
          : cell.value;
      });
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

      // Convert array values to numbers for arithmetic
      const leftNumber = Array.isArray(leftValue) 
        ? evaluateSUM(leftValue.map(String)) 
        : Number(leftValue);
      const rightNumber = Array.isArray(rightValue) 
        ? evaluateSUM(rightValue.map(String)) 
        : Number(rightValue);

      if (!isNaN(leftNumber) && !isNaN(rightNumber)) {
        switch (operator) {
          case '+': return leftNumber + rightNumber;
          case '-': return leftNumber - rightNumber;
          case '*': return leftNumber * rightNumber;
          case '/': return rightNumber === 0 ? '#DIV/0!' : leftNumber / rightNumber;
        }
      }
    }

    return expression;
  } catch (error) {
    console.error('Expression evaluation error:', error);
    return '#ERROR!';
  }
}
