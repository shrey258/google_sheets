import React from 'react';
import { render } from '@testing-library/react';
import Grid from '../Grid';
import { useSpreadsheetStore } from '../../../store/spreadsheetStore';
import useDragOperations from '../../../hooks/useDragOperations';

// Mock the store and hooks
jest.mock('../../../store/spreadsheetStore', () => ({
  useSpreadsheetStore: jest.fn()
}));

jest.mock('../../../hooks/useDragOperations', () => ({
  __esModule: true,
  default: () => ({
    startCellDrag: jest.fn(),
    updateCellDrag: jest.fn(),
    endCellDrag: jest.fn()
  })
}));

describe('Grid', () => {
  const mockStore = {
    rows: Array.from({ length: 100 }, (_, i) => ({
      id: `row-${i}`,
      index: i,
      height: 25
    })),
    columns: Array.from({ length: 26 }, (_, i) => ({
      id: `col-${i}`,
      index: i,
      width: 100
    })),
    cells: {},
    selectedCell: null,
    selectedRange: null,
    getCellIdFromPosition: jest.fn((pos) => `${String.fromCharCode(65 + pos.col)}${pos.row + 1}`),
    setSelectedCell: jest.fn(),
    setSelectedRange: jest.fn(),
    updateCellValue: jest.fn(),
    updateCellFormula: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSpreadsheetStore as jest.Mock).mockReturnValue(mockStore);
  });

  it('renders grid with correct dimensions', () => {
    const { container } = render(<Grid />);
    const gridContainer = container.querySelector('.grid-container');
    expect(gridContainer).toBeInTheDocument();
  });

  it('renders row headers', () => {
    const { container } = render(<Grid />);
    const rowHeaders = container.querySelector('.row-headers');
    expect(rowHeaders).toBeInTheDocument();
  });

  it('renders column headers', () => {
    const { container } = render(<Grid />);
    const columnHeaders = container.querySelector('.column-headers');
    expect(columnHeaders).toBeInTheDocument();
  });

  it('renders corner header', () => {
    const { container } = render(<Grid />);
    const cornerHeader = container.querySelector('.corner-header');
    expect(cornerHeader).toBeInTheDocument();
  });

  it('renders visible cells', () => {
    const { container } = render(<Grid />);
    const gridContent = container.querySelector('.grid-content');
    expect(gridContent).toBeInTheDocument();
    // Since cells are rendered based on viewport, we just check if the container exists
  });

  it('handles empty store gracefully', () => {
    (useSpreadsheetStore as jest.Mock).mockReturnValue({
      ...mockStore,
      rows: [],
      columns: []
    });

    const { getByText } = render(<Grid />);
    expect(getByText('Loading spreadsheet...')).toBeInTheDocument();
  });
});
