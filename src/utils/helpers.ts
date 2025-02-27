import { CellData, CellType } from '../types';

/**
 * Convert a column letter (A, B, C...) to a zero-based index
 */
export function columnToIndex(column: string): number {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result *= 26;
    result += column.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
  }
  return result - 1;
}

/**
 * Convert a zero-based index to a column letter (A, B, C...)
 */
export function indexToColumn(index: number): string {
  let result = '';
  index++;
  while (index > 0) {
    const remainder = (index - 1) % 26;
    result = String.fromCharCode('A'.charCodeAt(0) + remainder) + result;
    index = Math.floor((index - 1) / 26);
  }
  return result;
}

/**
 * Find all cell references in a formula
 */
export function findCellReferences(formula: string): string[] {
  const cellPattern = /(\$?[A-Z]+\$?[1-9][0-9]*)/g;
  const matches = formula.match(cellPattern);
  return matches ? matches : [];
}

/**
 * Check if there is a circular reference in the formula
 */
export function hasCircularReference(
  cellRefs: string[],
  cells: Record<string, CellData>,
  visited: Set<string> = new Set()
): boolean {
  for (const ref of cellRefs) {
    if (visited.has(ref)) {
      return true;
    }

    const cell = cells[ref];
    if (cell?.type === CellType.Formula) {
      visited.add(ref);
      const nestedRefs = findCellReferences(cell.formula);
      if (hasCircularReference(nestedRefs, cells, visited)) {
        return true;
      }
      visited.delete(ref);
    }
  }

  return false;
}
