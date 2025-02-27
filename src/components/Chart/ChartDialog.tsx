import React, { useState, useEffect } from 'react';
import Chart from './Chart';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';

interface ChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChartDialog: React.FC<ChartDialogProps> = ({ isOpen, onClose }) => {
  const { cells, selectedRange } = useSpreadsheetStore();
  
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter' | 'area'>('bar');
  const [chartTitle, setChartTitle] = useState('Chart');
  const [useFirstRowAsLabels, setUseFirstRowAsLabels] = useState(true);
  const [useFirstColumnAsLabels, setUseFirstColumnAsLabels] = useState(false);
  const [chartData, setChartData] = useState<{ labels: string[], values: number[] }>({
    labels: [],
    values: []
  });
  
  // Extract data from selected range
  useEffect(() => {
    if (!selectedRange || selectedRange.length === 0) return;
    
    // Get cell positions for the selected range
    const { getCellPosition } = useSpreadsheetStore.getState();
    const positions = selectedRange.map(cellId => getCellPosition(cellId));
    
    // Find min/max row and column indices
    const minRow = Math.min(...positions.map(pos => pos.row));
    const maxRow = Math.max(...positions.map(pos => pos.row));
    const minCol = Math.min(...positions.map(pos => pos.col));
    const maxCol = Math.max(...positions.map(pos => pos.col));
    
    // Determine if selection is a row or column
    const isRow = minRow === maxRow;
    const isColumn = minCol === maxCol;
    
    let labels: string[] = [];
    let values: number[] = [];
    
    if (isRow) {
      // Row selection - each cell is a data point
      for (let col = minCol; col <= maxCol; col++) {
        const { getCellIdFromPosition } = useSpreadsheetStore.getState();
        const cellId = getCellIdFromPosition({ row: minRow, col });
        const cell = cells[cellId];
        
        labels.push(String.fromCharCode(65 + col)); // A, B, C, ...
        values.push(cell && !isNaN(Number(cell.value)) ? Number(cell.value) : 0);
      }
    } else if (isColumn) {
      // Column selection - each cell is a data point
      for (let row = minRow; row <= maxRow; row++) {
        const { getCellIdFromPosition } = useSpreadsheetStore.getState();
        const cellId = getCellIdFromPosition({ row, col: minCol });
        const cell = cells[cellId];
        
        labels.push(`Row ${row + 1}`);
        values.push(cell && !isNaN(Number(cell.value)) ? Number(cell.value) : 0);
      }
    } else {
      // Rectangular selection
      if (useFirstRowAsLabels) {
        // Use first row as labels
        for (let col = minCol; col <= maxCol; col++) {
          const { getCellIdFromPosition } = useSpreadsheetStore.getState();
          const labelCellId = getCellIdFromPosition({ row: minRow, col });
          const labelCell = cells[labelCellId];
          
          labels.push(labelCell ? String(labelCell.value) : String.fromCharCode(65 + col));
        }
        
        // Get values from second row
        for (let col = minCol; col <= maxCol; col++) {
          const { getCellIdFromPosition } = useSpreadsheetStore.getState();
          const valueCellId = getCellIdFromPosition({ row: minRow + 1, col });
          const valueCell = cells[valueCellId];
          
          values.push(valueCell && !isNaN(Number(valueCell.value)) ? Number(valueCell.value) : 0);
        }
      } else if (useFirstColumnAsLabels) {
        // Use first column as labels
        for (let row = minRow; row <= maxRow; row++) {
          const { getCellIdFromPosition } = useSpreadsheetStore.getState();
          const labelCellId = getCellIdFromPosition({ row, col: minCol });
          const labelCell = cells[labelCellId];
          
          labels.push(labelCell ? String(labelCell.value) : `Row ${row + 1}`);
        }
        
        // Get values from second column
        for (let row = minRow; row <= maxRow; row++) {
          const { getCellIdFromPosition } = useSpreadsheetStore.getState();
          const valueCellId = getCellIdFromPosition({ row, col: minCol + 1 });
          const valueCell = cells[valueCellId];
          
          values.push(valueCell && !isNaN(Number(valueCell.value)) ? Number(valueCell.value) : 0);
        }
      } else {
        // Default behavior - use column letters as labels and first row as values
        for (let col = minCol; col <= maxCol; col++) {
          labels.push(String.fromCharCode(65 + col));
        }
        
        for (let col = minCol; col <= maxCol; col++) {
          const { getCellIdFromPosition } = useSpreadsheetStore.getState();
          const cellId = getCellIdFromPosition({ row: minRow, col });
          const cell = cells[cellId];
          
          values.push(cell && !isNaN(Number(cell.value)) ? Number(cell.value) : 0);
        }
      }
    }
    
    setChartData({ labels, values });
  }, [selectedRange, cells, useFirstRowAsLabels, useFirstColumnAsLabels]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">Create Chart</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Chart Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Chart Type</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="scatter">Scatter Chart</option>
            <option value="area">Area Chart</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="flex items-center text-gray-700">
            <input
              type="checkbox"
              className="mr-2"
              checked={useFirstRowAsLabels}
              onChange={(e) => {
                setUseFirstRowAsLabels(e.target.checked);
                if (e.target.checked) setUseFirstColumnAsLabels(false);
              }}
            />
            Use first row as labels
          </label>
        </div>
        
        <div className="mb-4">
          <label className="flex items-center text-gray-700">
            <input
              type="checkbox"
              className="mr-2"
              checked={useFirstColumnAsLabels}
              onChange={(e) => {
                setUseFirstColumnAsLabels(e.target.checked);
                if (e.target.checked) setUseFirstRowAsLabels(false);
              }}
            />
            Use first column as labels
          </label>
        </div>
        
        <div className="mb-4 flex justify-center">
          <Chart
            type={chartType}
            data={chartData}
            title={chartTitle}
            width={500}
            height={300}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => {
              // In a real implementation, we would insert the chart into the spreadsheet
              // For now, we'll just close the dialog
              onClose();
            }}
          >
            Insert Chart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartDialog;
