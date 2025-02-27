import { renderHook, act } from '@testing-library/react';
import useCopyPaste from '../useCopyPaste';
import { useSpreadsheetStore } from '../../store/spreadsheetStore';
import { setupZustandMock } from '../../__tests__/helpers/mockZustand';

// Mock the spreadsheet store
jest.mock('../../store/spreadsheetStore');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useCopyPaste', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Setup mock store using our helper
    setupZustandMock();
  });

  it('should copy selected cells to localStorage', () => {
    const { result } = renderHook(() => useCopyPaste());
    
    act(() => {
      result.current.copySelectedCells();
    });
    
    // Check that localStorage was called with the right data
    expect(localStorageMock.setItem).toHaveBeenCalledWith('copiedCells', expect.any(String));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('copyOrigin', expect.any(String));
    
    // Verify the copied data
    const copiedCells = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(copiedCells.length).toBe(4);
    expect(copiedCells[0].cellId).toBe('A1');
    expect(copiedCells[3].cellId).toBe('B2');
  });

  it('should paste cells at the selected cell with adjusted formulas', () => {
    // Setup mock data in localStorage
    const copiedCells = [
      {
        cellId: 'A1',
        position: { row: 0, col: 0 },
        data: { value: 'Test A1', formula: '', style: {} }
      },
      {
        cellId: 'B2',
        position: { row: 1, col: 1 },
        data: { value: '=A1+A2', formula: '=A1+A2', style: {} }
      }
    ];
    
    localStorageMock.setItem('copiedCells', JSON.stringify(copiedCells));
    localStorageMock.setItem('copyOrigin', JSON.stringify({ row: 0, col: 0 }));
    
    // Mock the store to set the selected cell to C3
    setupZustandMock({
      selectedCell: 'C3'
    });
    
    const { result } = renderHook(() => useCopyPaste());
    
    act(() => {
      result.current.pasteCells();
    });
    
    // Check that the update functions were called with the right data
    const { updateCellValue, updateCellFormula } = useSpreadsheetStore() as any;
    
    // First cell (A1 -> C3)
    expect(updateCellValue).toHaveBeenCalledWith('C3', 'Test A1');
    
    // Second cell (B2 -> D4) with adjusted formula
    expect(updateCellFormula).toHaveBeenCalledWith('D4', '=C3+C4');
  });

  it('should cut selected cells (copy and clear)', () => {
    const { result } = renderHook(() => useCopyPaste());
    
    act(() => {
      result.current.cutSelectedCells();
    });
    
    // Check that localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('copiedCells', expect.any(String));
    
    // Check that cells were cleared
    const { updateCellValue, updateCellFormula, updateCellStyle } = useSpreadsheetStore() as any;
    expect(updateCellValue).toHaveBeenCalledTimes(4);
    expect(updateCellFormula).toHaveBeenCalledTimes(4);
    expect(updateCellStyle).toHaveBeenCalledTimes(4);
  });
});
