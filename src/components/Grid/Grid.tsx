import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';
import Cell from './Cell';
import RowHeader from './RowHeader';
import ColumnHeader from './ColumnHeader';
import useDragOperations from '../../hooks/useDragOperations';
import ErrorBoundary from '../ErrorBoundary';
import FallbackCell from './FallbackCell';
import { Row, Column } from '../../types';

const BUFFER_SIZE = 5; // Number of extra rows/columns to render outside viewport
const DEFAULT_ROW_HEIGHT = 24;
const DEFAULT_COL_WIDTH = 100;
const HEADER_WIDTH = 50; // Width of row headers
const HEADER_HEIGHT = 25; // Height of column headers

const Grid: React.FC = () => {
  const { 
    rows, 
    columns,
    getCellIdFromPosition,
    selectedCell,
    selectedRange,
    setSelectedCell,
    setSelectedRange
  } = useSpreadsheetStore();
  
  const { 
    startCellDrag, 
    updateCellDrag, 
    endCellDrag 
  } = useDragOperations();
  
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleRangeState, setVisibleRangeState] = useState({
    startRow: 0,
    endRow: 20,
    startCol: 0,
    endCol: 10
  });
  
  // Safety check for rows and columns
  if (!rows?.length || !columns?.length) {
    return <div>Loading spreadsheet...</div>;
  }
  
  // Calculate visible range based on scroll position
  const calculateVisibleRange = useCallback(() => {
    if (!gridRef.current || !rows.length || !columns.length) return;
    
    const grid = gridRef.current;
    const gridRect = grid.getBoundingClientRect();
    const scrollTop = grid.scrollTop;
    const scrollLeft = grid.scrollLeft;
    
    // Calculate visible rows
    const defaultRowHeight = rows[0]?.height || DEFAULT_ROW_HEIGHT;
    let startRow = Math.floor(scrollTop / defaultRowHeight);
    let endRow = Math.ceil((scrollTop + gridRect.height) / defaultRowHeight);
    
    // Calculate visible columns
    const defaultColWidth = columns[0]?.width || DEFAULT_COL_WIDTH;
    let startCol = Math.floor(scrollLeft / defaultColWidth);
    let endCol = Math.ceil((scrollLeft + gridRect.width) / defaultColWidth);
    
    // Add buffer
    startRow = Math.max(0, startRow - BUFFER_SIZE);
    endRow = Math.min(rows.length - 1, endRow + BUFFER_SIZE);
    startCol = Math.max(0, startCol - BUFFER_SIZE);
    endCol = Math.min(columns.length - 1, endCol + BUFFER_SIZE);
    
    setVisibleRangeState({ startRow, endRow, startCol, endCol });
  }, [rows, columns]);
  
  // Handle scroll events
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    
    const handleScroll = () => {
      requestAnimationFrame(calculateVisibleRange);
    };
    
    grid.addEventListener('scroll', handleScroll);
    return () => grid.removeEventListener('scroll', handleScroll);
  }, [calculateVisibleRange]);
  
  // Calculate total grid dimensions with safety checks
  const totalWidth = columns.reduce((sum, col) => sum + (col?.width || DEFAULT_COL_WIDTH), 0);
  const totalHeight = rows.reduce((sum, row) => sum + (row?.height || DEFAULT_ROW_HEIGHT), 0);
  
  // Handle cell drag start
  const handleCellDragStart = useCallback((cellId: string) => {
    startCellDrag(cellId);
  }, [startCellDrag]);
  
  // Handle cell drag
  const handleCellDrag = useCallback((cellId: string) => {
    updateCellDrag(cellId);
  }, [updateCellDrag]);
  
  // Handle cell drag end
  const handleCellDragEnd = useCallback(() => {
    endCellDrag();
  }, [endCellDrag]);
  
  // Helper function to safely get row height
  const getRowHeight = (index: number) => rows[index]?.height || DEFAULT_ROW_HEIGHT;
  
  // Helper function to safely get column width
  const getColumnWidth = (index: number) => columns[index]?.width || DEFAULT_COL_WIDTH;
  
  // Helper function to calculate position
  const calculatePosition = (index: number, items: (Row | Column)[], defaultSize: number) => {
    return items
      .slice(0, index)
      .reduce((sum, item) => sum + (item?.width || item?.height || defaultSize), 0);
  };
  
  // Render only visible cells
  const renderCells = () => {
    const visibleCells = [];
    
    for (let row = visibleRangeState.startRow; row <= visibleRangeState.endRow; row++) {
      for (let col = visibleRangeState.startCol; col <= visibleRangeState.endCol; col++) {
        const cellId = getCellIdFromPosition({ row, col });
        visibleCells.push(
          <ErrorBoundary 
            key={cellId} 
            fallback={<FallbackCell cellId={cellId} />}
          >
            <Cell
              id={cellId}
              onDragStart={handleCellDragStart}
              onDrag={handleCellDrag}
              onDragEnd={handleCellDragEnd}
              style={{
                position: 'absolute',
                top: calculatePosition(row, rows, DEFAULT_ROW_HEIGHT) + HEADER_HEIGHT,
                left: calculatePosition(col, columns, DEFAULT_COL_WIDTH) + HEADER_WIDTH,
                width: getColumnWidth(col),
                height: getRowHeight(row)
              }}
            />
          </ErrorBoundary>
        );
      }
    }
    
    return visibleCells;
  };
  
  return (
    <div 
      ref={gridRef}
      className="grid-container relative overflow-auto"
      style={{ 
        width: '100%', 
        height: 'calc(100vh - 120px)',
        overflowX: 'auto',
        overflowY: 'auto'
      }}
    >
      {/* Corner cell for intersection of row and column headers */}
      <div 
        className="corner-header absolute top-0 left-0 bg-gray-100 border-r border-b z-30"
        style={{
          width: HEADER_WIDTH,
          height: HEADER_HEIGHT,
          borderColor: '#e1e1e1'
        }}
      />

      {/* Grid content */}
      <div 
        className="grid-content relative"
        style={{ 
          width: totalWidth + HEADER_WIDTH, 
          height: totalHeight + HEADER_HEIGHT,
          paddingTop: HEADER_HEIGHT,
          paddingLeft: HEADER_WIDTH
        }}
      >
        {renderCells()}
      </div>
      
      {/* Row Headers */}
      <div 
        className="row-headers absolute left-0 top-0 bg-gray-50 z-20"
        style={{
          marginTop: HEADER_HEIGHT
        }}
      >
        {rows.slice(visibleRangeState.startRow, visibleRangeState.endRow + 1).map((row, index) => (
          <RowHeader
            key={row.id}
            index={row.index}
            row={row}
            height={getRowHeight(row.index)}
            style={{
              position: 'absolute',
              top: calculatePosition(row.index, rows, DEFAULT_ROW_HEIGHT),
              width: HEADER_WIDTH
            }}
          />
        ))}
      </div>
      
      {/* Column Headers */}
      <div 
        className="column-headers absolute top-0 left-0 bg-gray-50 z-20"
        style={{
          marginLeft: HEADER_WIDTH
        }}
      >
        {columns.slice(visibleRangeState.startCol, visibleRangeState.endCol + 1).map((column, index) => (
          <ColumnHeader
            key={column.id}
            index={column.index}
            column={column}
            width={getColumnWidth(column.index)}
            style={{
              position: 'absolute',
              left: calculatePosition(column.index, columns, DEFAULT_COL_WIDTH),
              height: HEADER_HEIGHT
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Grid;
