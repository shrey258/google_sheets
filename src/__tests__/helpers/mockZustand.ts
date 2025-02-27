import { useSpreadsheetStore } from '../../store/spreadsheetStore';
import { CellData, CellType, Position } from '../../types';

// Default mock data
const defaultCells: Record<string, CellData> = {
  'A1': { id: 'A1', value: 'Test A1', formula: '', formatted: '', type: CellType.Text, style: {} },
  'A2': { id: 'A2', value: 'Test A2', formula: '', formatted: '', type: CellType.Text, style: {} },
  'B1': { id: 'B1', value: 'Test B1', formula: '', formatted: '', type: CellType.Text, style: {} },
  'B2': { id: 'B2', value: '=A1+A2', formula: '=A1+A2', formatted: '', type: CellType.Formula, style: {} }
};

// Helper functions for position conversion
const getCellPosition = (cellId: string): Position => {
  const col = cellId.charAt(0).charCodeAt(0) - 65; // A=0, B=1, etc.
  const row = parseInt(cellId.substring(1)) - 1;
  return { row, col };
};

const getCellIdFromPosition = (position: Position): string => {
  const colLetter = String.fromCharCode(65 + position.col);
  return `${colLetter}${position.row + 1}`;
};

// Mock implementation of the Zustand store
export const mockUseSpreadsheetStore = (
  customState: Partial<ReturnType<typeof useSpreadsheetStore>> = {}
) => {
  const mockStore = {
    // Default state
    cells: defaultCells,
    selectedCell: 'A1',
    selectedRange: ['A1', 'A2', 'B1', 'B2'],
    activeFormula: '',
    columns: [],
    rows: [],
    
    // Mock actions
    updateCellValue: jest.fn(),
    updateCellFormula: jest.fn(),
    updateCellStyle: jest.fn(),
    selectCell: jest.fn(),
    selectRange: jest.fn(),
    clearSelection: jest.fn(),
    setActiveFormula: jest.fn(),
    
    // Helper functions
    getCellPosition,
    getCellIdFromPosition,
    getCellsInRange: jest.fn((startCellId, endCellId) => {
      // Simple implementation for tests
      const startPos = getCellPosition(startCellId);
      const endPos = getCellPosition(endCellId);
      
      const minRow = Math.min(startPos.row, endPos.row);
      const maxRow = Math.max(startPos.row, endPos.row);
      const minCol = Math.min(startPos.col, endPos.col);
      const maxCol = Math.max(startPos.col, endPos.col);
      
      const cellIds: string[] = [];
      
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          cellIds.push(getCellIdFromPosition({ row, col }));
        }
      }
      
      return cellIds;
    }),
    
    // Override with custom state
    ...customState
  };
  
  return mockStore;
};

// Setup mock for useSpreadsheetStore
export const setupZustandMock = (
  customState: Partial<ReturnType<typeof useSpreadsheetStore>> = {}
) => {
  const mockStore = mockUseSpreadsheetStore(customState);
  // Fix TypeScript error by using type assertion to any
  (useSpreadsheetStore as unknown as jest.Mock).mockReturnValue(mockStore);
  return mockStore;
};
