import React, { useState } from 'react';

/**
 * Component that provides help information about formulas and cell references
 */
const FormulaHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="formula-help relative">
      <button 
        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        Formula Help
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded p-4 z-50 w-96 border border-gray-200">
          <h3 className="text-lg font-bold mb-2">Formula Reference</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold">Basic Functions</h4>
            <ul className="list-disc pl-5 text-sm">
              <li><code>=SUM(A1:A10)</code> - Sum values in range</li>
              <li><code>=AVERAGE(B1:B10)</code> - Average of values</li>
              <li><code>=MAX(C1:C10)</code> - Maximum value</li>
              <li><code>=MIN(D1:D10)</code> - Minimum value</li>
              <li><code>=COUNT(E1:E10)</code> - Count non-empty cells</li>
            </ul>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold">Text Functions</h4>
            <ul className="list-disc pl-5 text-sm">
              <li><code>=TRIM(A1)</code> - Remove extra spaces</li>
              <li><code>=UPPER(B1)</code> - Convert to uppercase</li>
              <li><code>=LOWER(C1)</code> - Convert to lowercase</li>
              <li><code>=REMOVE_DUPLICATES(A1:A10)</code> - Remove duplicates</li>
              <li><code>=FIND_AND_REPLACE(A1, "find", "replace")</code> - Replace text</li>
            </ul>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold">Cell References</h4>
            <ul className="list-disc pl-5 text-sm">
              <li><code>A1</code> - Relative reference (changes when copied)</li>
              <li><code>$A1</code> - Column absolute (column won't change when copied)</li>
              <li><code>A$1</code> - Row absolute (row won't change when copied)</li>
              <li><code>$A$1</code> - Absolute reference (won't change when copied)</li>
            </ul>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold">Examples</h4>
            <ul className="list-disc pl-5 text-sm">
              <li><code>=A1+B1</code> - Add values from cells A1 and B1</li>
              <li><code>=SUM($A$1:$A$10)</code> - Sum values in fixed range</li>
              <li><code>=B1*$C$1</code> - Multiply B1 by fixed value in C1</li>
              <li><code>=AVERAGE(A$1:A$5)</code> - Average with fixed rows</li>
            </ul>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold">Keyboard Shortcuts</h4>
            <ul className="list-disc pl-5 text-sm">
              <li><code>Ctrl+C</code> - Copy selected cells</li>
              <li><code>Ctrl+X</code> - Cut selected cells</li>
              <li><code>Ctrl+V</code> - Paste at current cell</li>
              <li><code>F2 or Enter</code> - Edit cell</li>
              <li><code>Esc</code> - Cancel editing</li>
            </ul>
          </div>
          
          <button 
            className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm mt-2"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default FormulaHelp;
