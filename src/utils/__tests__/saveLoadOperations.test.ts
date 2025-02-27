import {
  saveSpreadsheet,
  loadSpreadsheet,
  getSavedSpreadsheetList,
  deleteSpreadsheet
} from '../saveLoadOperations';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Save and Load Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  const mockCells: Record<string, any> = {
    'A1': {
      value: 'Test',
      formula: '',
      formatted: 'Test',
      style: { bold: true }
    },
    'B2': {
      value: '10',
      formula: '',
      formatted: '10',
      style: {}
    }
  };

  it('should save a spreadsheet to localStorage', () => {
    saveSpreadsheet(mockCells, 'TestSheet');
    
    // Check that localStorage was called with the right data
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'spreadsheet_TestSheet',
      expect.any(String)
    );
    
    // Check that the spreadsheet list was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'spreadsheet_list',
      JSON.stringify(['TestSheet'])
    );
    
    // Verify the saved data
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.cells).toEqual(mockCells);
    expect(savedData.name).toBe('TestSheet');
    expect(savedData.version).toBe('1.0.0');
    expect(savedData.lastModified).toBeDefined();
  });

  it('should load a spreadsheet from localStorage', () => {
    // First save a spreadsheet
    const spreadsheetData = {
      cells: mockCells,
      name: 'TestSheet',
      lastModified: new Date().toISOString(),
      version: '1.0.0'
    };
    
    localStorageMock.setItem('spreadsheet_TestSheet', JSON.stringify(spreadsheetData));
    
    // Then load it
    const loadedCells = loadSpreadsheet('TestSheet');
    
    // Verify the loaded data
    expect(loadedCells).toEqual(mockCells);
  });

  it('should throw an error when loading a non-existent spreadsheet', () => {
    expect(() => loadSpreadsheet('NonExistentSheet')).toThrow(
      'Spreadsheet "NonExistentSheet" not found'
    );
  });

  it('should get a list of saved spreadsheets', () => {
    // Save a couple of spreadsheets
    localStorageMock.setItem('spreadsheet_list', JSON.stringify(['Sheet1', 'Sheet2']));
    
    // Get the list
    const list = getSavedSpreadsheetList();
    
    // Verify the list
    expect(list).toEqual(['Sheet1', 'Sheet2']);
  });

  it('should return an empty array when no spreadsheets are saved', () => {
    const list = getSavedSpreadsheetList();
    expect(list).toEqual([]);
  });

  it('should delete a spreadsheet', () => {
    // First save a spreadsheet and add it to the list
    localStorageMock.setItem('spreadsheet_TestSheet', JSON.stringify({ cells: mockCells }));
    localStorageMock.setItem('spreadsheet_list', JSON.stringify(['TestSheet', 'OtherSheet']));
    
    // Then delete it
    deleteSpreadsheet('TestSheet');
    
    // Verify that it was deleted
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('spreadsheet_TestSheet');
    
    // Verify that the list was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'spreadsheet_list',
      JSON.stringify(['OtherSheet'])
    );
  });
});
