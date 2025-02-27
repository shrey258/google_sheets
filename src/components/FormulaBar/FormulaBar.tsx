import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';
import useSpreadsheetFunctions from '../../hooks/useSpreadsheetFunctions';
import FormulaHelp from '../FormulaHelp/FormulaHelp';

const FormulaBar: React.FC = () => {
  const { 
    selectedCell, 
    cells, 
    activeFormula, 
    setActiveFormula 
  } = useSpreadsheetStore();
  
  const { evaluateAndUpdateCell } = useSpreadsheetFunctions();
  
  const [formula, setFormula] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update formula when selected cell changes
  useEffect(() => {
    if (selectedCell && cells[selectedCell]) {
      const cell = cells[selectedCell];
      const newFormula = cell.formula || cell.value;
      if (formula !== newFormula) {
        setFormula(newFormula);
      }
    } else {
      setFormula('');
    }
  }, [selectedCell, cells, formula]);
  
  // Update formula when activeFormula changes
  useEffect(() => {
    if (activeFormula && formula !== activeFormula) {
      setFormula(activeFormula);
    }
  }, [activeFormula, formula]);
  
  // Handle formula change
  const handleFormulaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormula = e.target.value;
    if (formula !== newFormula) {
      setFormula(newFormula);
      setActiveFormula(newFormula);
    }
  }, [setActiveFormula, formula]);
  
  // Handle formula submit
  const handleFormulaSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCell) {
      evaluateAndUpdateCell(selectedCell, formula);
    }
  }, [selectedCell, formula, evaluateAndUpdateCell]);
  
  // Handle key down
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (selectedCell && cells[selectedCell]) {
        const cell = cells[selectedCell];
        setFormula(cell.formula || cell.value);
      }
      
      // Blur the input
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }, [selectedCell, cells]);
  
  // Get selected cell label
  const getSelectedCellLabel = () => {
    if (!selectedCell) return '';
    return selectedCell;
  };
  
  return (
    <div className="formula-bar flex items-center border-b border-gray-300 px-2 py-1">
      <div className="cell-label font-medium text-gray-600 mr-2 w-10">
        {getSelectedCellLabel()}
      </div>
      
      <form className="flex-1" onSubmit={handleFormulaSubmit}>
        <input
          ref={inputRef}
          className="w-full h-full outline-none border-none p-1"
          placeholder="Enter a value or formula (e.g., =SUM(A1:A5))"
          value={formula}
          onChange={handleFormulaChange}
          onKeyDown={handleKeyDown}
          disabled={!selectedCell}
        />
      </form>
      
      <button 
        className="ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        disabled={!selectedCell}
        onClick={handleFormulaSubmit}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      <div className="ml-2">
        <FormulaHelp />
      </div>
    </div>
  );
};

export default FormulaBar;
