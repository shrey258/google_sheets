import { create } from 'zustand';
import { 
  CellData, 
  CellType, 
  SpreadsheetData, 
  Column, 
  Row,
  CellStyle,
  Position
} from '../types';
import { saveSpreadsheet, loadSpreadsheet, exportAsCsv } from '../utils/fileOperations';
import { evaluateFormula } from '../utils/formulaEvaluator';

// Helper functions
const generateColumnId = (index: number): string => {
  let columnId = '';
  while (index >= 0) {
    columnId = String.fromCharCode(65 + (index % 26)) + columnId;
    index = Math.floor(index / 26) - 1;
  }
  return columnId;
};

const generateCellId = (rowIndex: number, colIndex: number): string => {
  const colId = generateColumnId(colIndex);
  return `${colId}${rowIndex + 1}`;
};

const parseCellId = (cellId: string): Position => {
  const match = cellId.match(/([A-Z]+)(\d+)/);
  if (!match) {
    throw new Error(`Invalid cell ID: ${cellId}`);
  }
  
  const colId = match[1];
  const rowIndex = parseInt(match[2], 10) - 1;
  
  let colIndex = 0;
  for (let i = 0; i < colId.length; i++) {
    colIndex = colIndex * 26 + colId.charCodeAt(i) - 64;
  }
  colIndex -= 1;
  
  return { row: rowIndex, col: colIndex };
};

// Initial state
const DEFAULT_ROWS = 100;
const DEFAULT_COLS = 26;
const DEFAULT_CELL_HEIGHT = 24;
const DEFAULT_CELL_WIDTH = 100;

const createInitialState = (): SpreadsheetData => {
  const cells: Record<string, CellData> = {};
  const columns: Column[] = [];
  const rows: Row[] = [];

  // Create columns
  for (let i = 0; i < DEFAULT_COLS; i++) {
    const columnId = generateColumnId(i);
    columns.push({
      id: columnId,
      index: i,
      width: DEFAULT_CELL_WIDTH
    });
  }

  // Create rows
  for (let i = 0; i < DEFAULT_ROWS; i++) {
    rows.push({
      id: (i + 1).toString(),
      index: i,
      height: DEFAULT_CELL_HEIGHT
    });
  }

  // Create empty cells
  for (let rowIndex = 0; rowIndex < DEFAULT_ROWS; rowIndex++) {
    for (let colIndex = 0; colIndex < DEFAULT_COLS; colIndex++) {
      const cellId = generateCellId(rowIndex, colIndex);
      cells[cellId] = {
        id: cellId,
        value: '',
        formula: '',
        formatted: '',
        type: CellType.Empty,
        style: {}
      };
    }
  }

  return {
    cells,
    columns,
    rows,
    selectedCell: null,
    selectedRange: null,
    activeFormula: ''
  };
};

// Create the store
interface SpreadsheetStore {
  cells: Record<string, CellData>;
  selectedCell: string | null;
  selectedRange: string[] | null;
  rows: Row[];
  columns: Column[];
  activeFormula: string;
  
  updateCellValue: (cellId: string, value: string) => void;
  updateCellFormula: (cellId: string, formula: string) => void;
  updateCellStyle: (cellId: string, style: Partial<CellStyle>) => void;
  setSelectedCell: (cellId: string | null) => void;
  selectRange: (startCellId: string, endCellId: string) => void;
  clearSelection: () => void;
  addRow: (index: number) => void;
  deleteRow: (index: number) => void;
  addColumn: (index: number) => void;
  deleteColumn: (index: number) => void;
  resizeRow: (index: number, height: number) => void;
  resizeColumn: (index: number, width: number) => void;
  setActiveFormula: (formula: string) => void;
  getCellPosition: (cellId: string) => Position;
  getCellIdFromPosition: (position: Position) => string;
  getCellsInRange: (startCellId: string, endCellId: string) => string[];
  saveSpreadsheet: (fileName?: string) => void;
  loadSpreadsheet: () => Promise<void>;
  exportAsCsv: (fileName?: string) => void;
  resetSpreadsheet: () => void;
}

export const useSpreadsheetStore = create<SpreadsheetStore>((set, get) => ({
  ...createInitialState(),
  
  // Update cell value
  updateCellValue: (cellId: string, value: string) => {
    set(state => {
      const newCells = { ...state.cells };
      newCells[cellId] = {
        ...newCells[cellId],
        value,
        type: CellType.Text
      };
      return { cells: newCells };
    });
  },

  // Update cell formula
  updateCellFormula: (cellId: string, formula: string) => {
    set(state => {
      const newCells = { ...state.cells };
      const evaluatedValue = evaluateFormula(formula, state.cells);
      
      newCells[cellId] = {
        ...newCells[cellId],
        formula,
        value: String(evaluatedValue),
        type: CellType.Formula
      };
      
      return { cells: newCells };
    });
  },

  // Update cell style
  updateCellStyle: (cellId: string, style: Partial<CellStyle>) => {
    set(state => {
      const newCells = { ...state.cells };
      newCells[cellId] = {
        ...newCells[cellId],
        style: {
          ...newCells[cellId].style,
          ...style
        }
      };
      return { cells: newCells };
    });
  },
  
  // Set selected cell
  setSelectedCell: (cellId: string | null) => {
    set({ selectedCell: cellId, selectedRange: null });
  },
  
  // Select range
  selectRange: (startCellId: string, endCellId: string) => {
    const cellsInRange = get().getCellsInRange(startCellId, endCellId);
    set({
      selectedCell: startCellId,
      selectedRange: cellsInRange,
      activeFormula: get().cells[startCellId]?.formula || ''
    });
  },
  
  // Clear selection
  clearSelection: () => {
    set({
      selectedCell: null,
      selectedRange: null,
      activeFormula: ''
    });
  },
  
  // Add row
  addRow: (index: number) => {
    set(state => {
      const newRows = [...state.rows];
      const newCells = { ...state.cells };
      
      // Shift existing rows down
      for (let i = state.rows.length - 1; i >= index; i--) {
        newRows[i + 1] = {
          ...newRows[i],
          index: i + 1,
          id: (i + 2).toString()
        };
      }
      
      // Insert new row
      newRows[index] = {
        id: (index + 1).toString(),
        index,
        height: DEFAULT_CELL_HEIGHT
      };
      
      // Create new cells for the row
      for (let colIndex = 0; colIndex < state.columns.length; colIndex++) {
        const cellId = generateCellId(index, colIndex);
        newCells[cellId] = {
          id: cellId,
          value: '',
          formula: '',
          formatted: '',
          type: CellType.Empty,
          style: {}
        };
      }
      
      return {
        ...state,
        rows: newRows,
        cells: newCells
      };
    });
  },
  
  // Delete row
  deleteRow: (index: number) => {
    set(state => {
      if (index < 0 || index >= state.rows.length) return state;
      
      const newRows = state.rows.filter((_, i) => i !== index);
      const newCells = { ...state.cells };
      
      // Update row indices
      for (let i = index; i < newRows.length; i++) {
        newRows[i] = {
          ...newRows[i],
          index: i,
          id: (i + 1).toString()
        };
      }
      
      // Remove cells in the deleted row
      for (let colIndex = 0; colIndex < state.columns.length; colIndex++) {
        const cellId = generateCellId(index, colIndex);
        delete newCells[cellId];
      }
      
      return {
        ...state,
        rows: newRows,
        cells: newCells
      };
    });
  },
  
  // Add column
  addColumn: (index: number) => {
    set(state => {
      const newColumns = [...state.columns];
      const newCells = { ...state.cells };
      
      // Shift existing columns right
      for (let i = state.columns.length - 1; i >= index; i--) {
        const oldColId = generateColumnId(i);
        const newColId = generateColumnId(i + 1);
        
        newColumns[i + 1] = {
          ...newColumns[i],
          index: i + 1,
          id: newColId
        };
        
        // Update cell IDs
        for (let rowIndex = 0; rowIndex < state.rows.length; rowIndex++) {
          const oldCellId = `${oldColId}${rowIndex + 1}`;
          const newCellId = `${newColId}${rowIndex + 1}`;
          
          if (state.cells[oldCellId]) {
            newCells[newCellId] = {
              ...state.cells[oldCellId],
              id: newCellId
            };
          }
        }
      }
      
      // Insert new column
      const newColId = generateColumnId(index);
      newColumns[index] = {
        id: newColId,
        index,
        width: DEFAULT_CELL_WIDTH
      };
      
      // Create new cells for the column
      for (let rowIndex = 0; rowIndex < state.rows.length; rowIndex++) {
        const cellId = `${newColId}${rowIndex + 1}`;
        newCells[cellId] = {
          id: cellId,
          value: '',
          formula: '',
          formatted: '',
          type: CellType.Empty,
          style: {}
        };
      }
      
      return {
        ...state,
        columns: newColumns,
        cells: newCells
      };
    });
  },
  
  // Delete column
  deleteColumn: (index: number) => {
    set(state => {
      if (index < 0 || index >= state.columns.length) return state;
      
      const newColumns = state.columns.filter((_, i) => i !== index);
      const newCells = { ...state.cells };
      
      // Update column indices
      for (let i = index; i < newColumns.length; i++) {
        const oldColId = generateColumnId(i + 1);
        const newColId = generateColumnId(i);
        
        newColumns[i] = {
          ...newColumns[i],
          index: i,
          id: newColId
        };
        
        // Update cell IDs
        for (let rowIndex = 0; rowIndex < state.rows.length; rowIndex++) {
          const oldCellId = `${oldColId}${rowIndex + 1}`;
          const newCellId = `${newColId}${rowIndex + 1}`;
          
          if (state.cells[oldCellId]) {
            newCells[newCellId] = {
              ...state.cells[oldCellId],
              id: newCellId
            };
            
            delete newCells[oldCellId];
          }
        }
      }
      
      // Remove cells in the deleted column
      const colId = generateColumnId(index);
      for (let rowIndex = 0; rowIndex < state.rows.length; rowIndex++) {
        const cellId = `${colId}${rowIndex + 1}`;
        delete newCells[cellId];
      }
      
      return {
        ...state,
        columns: newColumns,
        cells: newCells
      };
    });
  },
  
  // Resize row
  resizeRow: (index: number, height: number) => {
    set(state => {
      const newRows = [...state.rows];
      if (index < 0 || index >= newRows.length) return state;
      
      newRows[index] = {
        ...newRows[index],
        height
      };
      
      return {
        ...state,
        rows: newRows
      };
    });
  },
  
  // Resize column
  resizeColumn: (index: number, width: number) => {
    set(state => {
      const newColumns = [...state.columns];
      if (index < 0 || index >= newColumns.length) return state;
      
      newColumns[index] = {
        ...newColumns[index],
        width
      };
      
      return {
        ...state,
        columns: newColumns
      };
    });
  },
  
  // Set active formula
  setActiveFormula: (formula: string) => {
    set({ activeFormula: formula });
  },
  
  // Get cell position
  getCellPosition: (cellId: string) => {
    return parseCellId(cellId);
  },
  
  // Get cell ID from position
  getCellIdFromPosition: (position: Position) => {
    return generateCellId(position.row, position.col);
  },
  
  // Get cells in range
  getCellsInRange: (startCellId: string, endCellId: string) => {
    const startPos = parseCellId(startCellId);
    const endPos = parseCellId(endCellId);
    
    const startRow = Math.min(startPos.row, endPos.row);
    const endRow = Math.max(startPos.row, endPos.row);
    const startCol = Math.min(startPos.col, endPos.col);
    const endCol = Math.max(startPos.col, endPos.col);
    
    const cellsInRange: string[] = [];
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        cellsInRange.push(generateCellId(row, col));
      }
    }
    
    return cellsInRange;
  },
  
  // Save spreadsheet
  saveSpreadsheet: (fileName?: string) => {
    saveSpreadsheet(get(), fileName);
  },
  
  // Load spreadsheet
  loadSpreadsheet: async () => {
    await loadSpreadsheet();
  },
  
  // Export as CSV
  exportAsCsv: (fileName?: string) => {
    exportAsCsv(get(), fileName);
  },
  
  // Reset spreadsheet
  resetSpreadsheet: () => {
    set(createInitialState());
  }
}));
