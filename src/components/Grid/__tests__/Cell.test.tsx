import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Cell from '../Cell';
import { useSpreadsheetStore } from '../../../store/spreadsheetStore';
import { CellType } from '../../../types';

// Mock the store
jest.mock('../../../store/spreadsheetStore', () => ({
  useSpreadsheetStore: jest.fn()
}));

describe('Cell', () => {
  const mockStore = {
    cells: {
      'A1': {
        id: 'A1',
        value: 'Test Value',
        type: CellType.Text,
        formula: '',
        formatted: 'Test Value',
        style: {}
      }
    },
    selectedCell: '',
    selectedRange: [],
    setSelectedCell: jest.fn(),
    updateCellValue: jest.fn(),
    updateCellFormula: jest.fn(),
    evaluateFormula: jest.fn(),
    setActiveFormula: jest.fn(),
    getCellIdFromPosition: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSpreadsheetStore as jest.Mock).mockReturnValue(mockStore);
  });

  it('renders with correct value', () => {
    const { getByTestId } = render(<Cell id="A1" style={{}} />);
    const cell = getByTestId('cell-A1');
    expect(cell).toHaveTextContent('Test Value');
  });

  it('becomes selected when clicked', () => {
    const { getByTestId } = render(<Cell id="A1" style={{}} />);
    const cell = getByTestId('cell-A1');
    
    fireEvent.click(cell);
    expect(mockStore.setSelectedCell).toHaveBeenCalledWith('A1');
  });

  it('enters edit mode on double click', () => {
    const { getByTestId } = render(<Cell id="A1" style={{}} />);
    const cell = getByTestId('cell-A1');
    
    fireEvent.doubleClick(cell);
    const input = cell.querySelector('input');
    expect(input).toBeTruthy();
    expect(input).toHaveValue('Test Value');
  });

  it('handles formula input', () => {
    mockStore.cells = {
      'A1': { 
        id: 'A1', 
        value: '=SUM(B1:B3)', 
        type: CellType.Formula, 
        formula: '=SUM(B1:B3)', 
        formatted: '30', 
        style: {} 
      }
    };

    const { getByTestId } = render(<Cell id="A1" style={{}} />);
    const cell = getByTestId('cell-A1');
    expect(cell).toHaveTextContent('30');
  });

  it('handles cell editing', () => {
    const { getByTestId } = render(
      <Cell
        id="A1"
        style={{ width: 100, height: 25 }}
      />
    );

    // Double click to start editing
    fireEvent.doubleClick(getByTestId('cell-A1'));
    const input = getByTestId('cell-A1').querySelector('input');
    expect(input).toBeInTheDocument();

    // Type and blur to save
    fireEvent.change(input!, { target: { value: 'test' } });
    fireEvent.blur(input!);
    expect(mockStore.updateCellValue).toHaveBeenCalledWith('A1', 'test');
  });

  it('handles formula editing', () => {
    const { getByTestId } = render(
      <Cell
        id="A1"
        style={{ width: 100, height: 25 }}
      />
    );

    // Double click to start editing
    fireEvent.doubleClick(getByTestId('cell-A1'));
    const input = getByTestId('cell-A1').querySelector('input');
    expect(input).toBeInTheDocument();

    // Type formula and blur to save
    fireEvent.change(input!, { target: { value: '=SUM(B1:B5)' } });
    fireEvent.blur(input!);
    expect(mockStore.updateCellFormula).toHaveBeenCalledWith('A1', '=SUM(B1:B5)');
  });

  it('updates value when edited', () => {
    const { getByTestId } = render(<Cell id="A1" style={{}} />);
    const cell = getByTestId('cell-A1');
    
    fireEvent.click(cell);
    fireEvent.change(cell, { target: { value: 'New Value' } });
    
    expect(mockStore.updateCellValue).toHaveBeenCalledWith('A1', 'New Value');
  });

  it('updates formula when formula is entered', () => {
    const { getByTestId } = render(<Cell id="A1" style={{}} />);
    const cell = getByTestId('cell-A1');
    
    fireEvent.click(cell);
    fireEvent.change(cell, { target: { value: '=SUM(A1:A5)' } });
    
    expect(mockStore.updateCellFormula).toHaveBeenCalledWith('A1', '=SUM(A1:A5)');
    expect(mockStore.evaluateFormula).toHaveBeenCalled();
  });
});
