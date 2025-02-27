import React, { useCallback, useState } from 'react';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';
import { CellStyle, FunctionType } from '../../types';
import useSpreadsheetFunctions from '../../hooks/useSpreadsheetFunctions';
import useCopyPaste from '../../hooks/useCopyPaste';
import ChartDialog from '../Chart/ChartDialog';
import SaveLoadMenu from './SaveLoadMenu';

const Toolbar: React.FC = () => {
  const { 
    selectedCell, 
    selectedRange, 
    cells, 
    updateCellStyle,
    resetSpreadsheet,
    saveSpreadsheet,
    loadSpreadsheet,
    exportAsCsv
  } = useSpreadsheetStore();
  
  const { applyFunction } = useSpreadsheetFunctions();
  
  // Use copy/paste hook
  const { copySelectedCells, pasteCells, cutSelectedCells } = useCopyPaste();
  
  // Chart dialog state
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false);
  
  // Get the currently selected cell
  const getSelectedCellData = () => {
    if (!selectedCell || !cells[selectedCell]) return null;
    return cells[selectedCell];
  };
  
  // Apply style to selected cells
  const applyStyle = useCallback((style: Partial<CellStyle>) => {
    if (selectedCell) {
      updateCellStyle(selectedCell, style);
    }
    
    if (selectedRange) {
      selectedRange.forEach(cellId => {
        updateCellStyle(cellId, style);
      });
    }
  }, [selectedCell, selectedRange, updateCellStyle]);
  
  // Toggle bold
  const toggleBold = useCallback(() => {
    const cell = getSelectedCellData();
    if (!cell) return;
    
    applyStyle({ bold: !cell.style.bold });
  }, [applyStyle]);
  
  // Toggle italic
  const toggleItalic = useCallback(() => {
    const cell = getSelectedCellData();
    if (!cell) return;
    
    applyStyle({ italic: !cell.style.italic });
  }, [applyStyle]);
  
  // Toggle underline
  const toggleUnderline = useCallback(() => {
    const cell = getSelectedCellData();
    if (!cell) return;
    
    applyStyle({ underline: !cell.style.underline });
  }, [applyStyle]);
  
  // Set text color
  const setTextColor = useCallback((color: string) => {
    applyStyle({ color });
  }, [applyStyle]);
  
  // Set background color
  const setBackgroundColor = useCallback((color: string) => {
    applyStyle({ backgroundColor: color });
  }, [applyStyle]);
  
  // Set horizontal alignment
  const setHorizontalAlign = useCallback((align: 'left' | 'center' | 'right') => {
    applyStyle({ horizontalAlign: align });
  }, [applyStyle]);
  
  // Apply function to selected range
  const handleApplyFunction = useCallback((functionType: FunctionType) => {
    if (!selectedCell) return;
    
    const rangeCells = selectedRange || [selectedCell];
    applyFunction(functionType, selectedCell, rangeCells);
  }, [selectedCell, selectedRange, applyFunction]);
  
  // Reset spreadsheet
  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the spreadsheet? All data will be lost.')) {
      resetSpreadsheet();
    }
  }, [resetSpreadsheet]);
  
  // Check if a style is active
  const isStyleActive = (styleKey: keyof CellStyle, value?: any) => {
    const cell = getSelectedCellData();
    if (!cell) return false;
    
    if (value !== undefined) {
      return cell.style[styleKey] === value;
    }
    
    return !!cell.style[styleKey];
  };
  
  return (
    <div className="toolbar flex items-center border-b border-gray-300 p-1 bg-gray-50">
      {/* File operations */}
      <div className="toolbar-group flex mr-4">
        <SaveLoadMenu />
        
        <button 
          className="toolbar-button"
          onClick={handleReset}
          title="New Spreadsheet"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Reset Spreadsheet */}
      <div className="toolbar-group">
        <button 
          className="toolbar-button"
          onClick={resetSpreadsheet}
          title="Reset Spreadsheet"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 8.586V16a1 1 0 11-2 0V8.586l-1.293 1.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* File Operations */}
      <div className="toolbar-group border-l pl-2">
        <button 
          className="toolbar-button"
          onClick={() => saveSpreadsheet()}
          title="Save Spreadsheet"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={() => {
            loadSpreadsheet().catch(error => {
              console.error('Error loading spreadsheet:', error);
              alert('Error loading spreadsheet: ' + error.message);
            });
          }}
          title="Load Spreadsheet"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 8.586V16a1 1 0 11-2 0V8.586l-1.293 1.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={() => exportAsCsv()}
          title="Export as CSV"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={() => setIsChartDialogOpen(true)}
          title="Create Chart"
          disabled={!selectedRange || selectedRange.length <= 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
        </button>
      </div>
      
      {/* Edit Operations */}
      <div className="toolbar-group border-l pl-2">
        <button 
          className="toolbar-button"
          onClick={copySelectedCells}
          title="Copy (Ctrl+C)"
          disabled={!selectedCell && (!selectedRange || selectedRange.length === 0)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={cutSelectedCells}
          title="Cut (Ctrl+X)"
          disabled={!selectedCell && (!selectedRange || selectedRange.length === 0)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 101.665 6.58L8.585 10l-1.42 1.42a3.5 3.5 0 101.414 1.414l8.128-8.127a1 1 0 00-1.414-1.414L10 8.586V16a1 1 0 11-2 0V8.586l-1.293 1.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
            <path d="M12.828 11.414a1 1 0 00-1.414 1.414l3.879 3.88a1 1 0 001.414-1.415l-3.879-3.88z" />
          </svg>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={pasteCells}
          title="Paste (Ctrl+V)"
          disabled={!selectedCell}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
      
      {/* Text formatting */}
      <div className="toolbar-group flex mr-4">
        <button 
          className={`toolbar-button ${isStyleActive('bold') ? 'bg-gray-200' : ''}`}
          onClick={toggleBold}
          title="Bold"
          disabled={!selectedCell}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.5 10a3.5 3.5 0 01-3.5 3.5H5V6h5a3.5 3.5 0 013.5 3.5v.5z" />
            <path d="M15 10a5 5 0 01-5 5H4V5h6a5 5 0 015 5z" />
          </svg>
        </button>
        
        <button 
          className={`toolbar-button ${isStyleActive('italic') ? 'bg-gray-200' : ''}`}
          onClick={toggleItalic}
          title="Italic"
          disabled={!selectedCell}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 5v10h2V5H6zM4 4a1 1 0 011-1h4a1 1 0 110 2H5a1 1 0 01-1-1zm1 11a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1z" />
          </svg>
        </button>
        
        <button 
          className={`toolbar-button ${isStyleActive('underline') ? 'bg-gray-200' : ''}`}
          onClick={toggleUnderline}
          title="Underline"
          disabled={!selectedCell}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 14a1 1 0 00-1 1v-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm3-7a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1zm3 0a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1z" />
          </svg>
        </button>
      </div>
      
      {/* Alignment */}
      <div className="toolbar-group flex mr-4">
        <button 
          className={`toolbar-button ${isStyleActive('horizontalAlign', 'left') ? 'bg-gray-200' : ''}`}
          onClick={() => setHorizontalAlign('left')}
          title="Align Left"
          disabled={!selectedCell}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 8.586V16a1 1 0 11-2 0V8.586l-1.293 1.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button 
          className={`toolbar-button ${isStyleActive('horizontalAlign', 'center') ? 'bg-gray-200' : ''}`}
          onClick={() => setHorizontalAlign('center')}
          title="Align Center"
          disabled={!selectedCell}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 8.586V16a1 1 0 11-2 0V8.586l-1.293 1.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button 
          className={`toolbar-button ${isStyleActive('horizontalAlign', 'right') ? 'bg-gray-200' : ''}`}
          onClick={() => setHorizontalAlign('right')}
          title="Align Right"
          disabled={!selectedCell}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm9 10a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Functions */}
      <div className="toolbar-group flex">
        <select 
          className="px-2 py-1 border border-gray-300 rounded"
          onChange={(e) => handleApplyFunction(e.target.value as FunctionType)}
          disabled={!selectedCell}
          defaultValue=""
        >
          <option value="" disabled>Functions</option>
          <optgroup label="Math Functions">
            <option value={FunctionType.SUM}>SUM</option>
            <option value={FunctionType.AVERAGE}>AVERAGE</option>
            <option value={FunctionType.MAX}>MAX</option>
            <option value={FunctionType.MIN}>MIN</option>
            <option value={FunctionType.COUNT}>COUNT</option>
            <option value={FunctionType.ROUND}>ROUND</option>
          </optgroup>
          <optgroup label="Data Quality Functions">
            <option value={FunctionType.TRIM}>TRIM</option>
            <option value={FunctionType.UPPER}>UPPER</option>
            <option value={FunctionType.LOWER}>LOWER</option>
            <option value={FunctionType.REMOVE_DUPLICATES}>REMOVE_DUPLICATES</option>
            <option value={FunctionType.FIND_AND_REPLACE}>FIND_AND_REPLACE</option>
          </optgroup>
          <optgroup label="Advanced Functions">
            <option value={FunctionType.CONCATENATE}>CONCATENATE</option>
            <option value={FunctionType.IF}>IF</option>
            <option value={FunctionType.COUNTA}>COUNTA</option>
            <option value={FunctionType.UNIQUE}>UNIQUE</option>
          </optgroup>
        </select>
      </div>
      
      {/* Chart Button */}
      <div className="toolbar-group flex ml-4">
        <button 
          className="toolbar-button"
          onClick={() => setIsChartDialogOpen(true)}
          title="Create Chart"
          disabled={!selectedRange || selectedRange.length < 2}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
          <span className="ml-1">Chart</span>
        </button>
      </div>
      {isChartDialogOpen && <ChartDialog isOpen={isChartDialogOpen} onClose={() => setIsChartDialogOpen(false)} />}
    </div>
  );
};

export default Toolbar;
