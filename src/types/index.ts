// Cell data type
export interface CellData {
  id: string;
  value: string;
  formula: string;
  formatted: string;
  type: CellType;
  style: Partial<CellStyle>;
  dependencies?: string[];
  dependents?: string[];
}

// Cell type enum
export enum CellType {
  Empty = 'empty',
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Formula = 'formula',
  Error = 'error'
}

// Cell style interface
export interface CellStyle {
  textColor?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number;
  fontFamily?: string;
}

// Spreadsheet data structure
export interface SpreadsheetData {
  cells: Record<string, CellData>;
  columns: Column[];
  rows: Row[];
  selectedCell: string | null;
  selectedRange: string[] | null;
  activeFormula: string;
}

// Column interface
export interface Column {
  id: string;
  index: number;
  width: number;
  hidden?: boolean;
}

// Row interface
export interface Row {
  id: string;
  index: number;
  height: number;
  hidden?: boolean;
}

// Position interface for cell coordinates
export interface Position {
  row: number;
  col: number;
}

// Function type for supported spreadsheet functions
export enum FunctionType {
  // Mathematical
  SUM = 'SUM',
  AVERAGE = 'AVERAGE',
  MAX = 'MAX',
  MIN = 'MIN',
  COUNT = 'COUNT',
  ROUND = 'ROUND',
  
  // Statistical
  MEDIAN = 'MEDIAN',
  STDEV = 'STDEV',
  
  // Text
  TRIM = 'TRIM',
  UPPER = 'UPPER',
  LOWER = 'LOWER',
  LEN = 'LEN',
  SUBSTRING = 'SUBSTRING',
  CONCATENATE = 'CONCATENATE',
  
  // Data Quality
  REMOVE_DUPLICATES = 'REMOVE_DUPLICATES',
  FIND_AND_REPLACE = 'FIND_AND_REPLACE',
  
  // Logical
  IF = 'IF',
  
  // Advanced
  COUNTA = 'COUNTA',
  UNIQUE = 'UNIQUE'
}

// Cell reference type
export type CellReference = string; // e.g., "A1", "B2", etc.

// Range reference type
export type RangeReference = string; // e.g., "A1:B5"

// Cell reference types for advanced formula parsing
export interface ParsedCellReference {
  original: string;   // The original reference (e.g., "$A$1")
  col: string;        // Column letter (e.g., "A")
  row: number;        // Row number (e.g., 1)
  colAbsolute: boolean; // Whether column is absolute (has $ prefix)
  rowAbsolute: boolean; // Whether row is absolute (has $ prefix)
}

// Dependency graph for formula evaluation
export interface DependencyNode {
  cellId: string;
  dependencies: string[];
  formula: string;
  level: number;
}

// Chart types for data visualization
export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  SCATTER = 'scatter',
  AREA = 'area'
}

// Chart configuration
export interface ChartConfig {
  type: ChartType;
  title: string;
  dataRange: string;
  labelRange?: string;
  options?: {
    showLegend?: boolean;
    colors?: string[];
    stacked?: boolean;
  };
}

// Store interface for state management
export interface SpreadsheetStore {
  rows: Row[];
  columns: Column[];
  cells: Record<string, CellData>;
  selectedCell: string | null;
  selectedRange: string[] | null;
  visibleRange: {
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  };
  rowHeights: Record<number, number>;
  columnWidths: Record<number, number>;
  updateVisibleRange: (range: { startRow: number; endRow: number; startCol: number; endCol: number; }) => void;
  setSelectedCell: (cellId: string | null) => void;
  setSelectedRange: (range: string[] | null) => void;
  getCellIdFromPosition: (position: { row: number; col: number; }) => string;
  evaluateFormula: (formula: string, cells: Record<string, CellData>) => any;
  updateCellValue: (cellId: string, value: string) => void;
  updateCellFormula: (cellId: string, formula: string) => void;
  setActiveFormula: (formula: string | null) => void;
}
