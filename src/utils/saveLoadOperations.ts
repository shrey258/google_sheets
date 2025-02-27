import { fileToJSON, jsonToFile } from './fileOperations';

/**
 * Save the current spreadsheet state to localStorage
 * @param cells The current cells state
 * @param name The name of the spreadsheet
 */
export const saveSpreadsheet = (cells: Record<string, any>, name: string): void => {
  try {
    const timestamp = new Date().toISOString();
    const spreadsheetData = {
      cells,
      name,
      lastModified: timestamp,
      version: '1.0.0'
    };
    
    // Save to localStorage
    localStorage.setItem(`spreadsheet_${name}`, JSON.stringify(spreadsheetData));
    
    // Update the list of saved spreadsheets
    const savedList = getSavedSpreadsheetList();
    if (!savedList.includes(name)) {
      savedList.push(name);
      localStorage.setItem('spreadsheet_list', JSON.stringify(savedList));
    }
  } catch (error) {
    console.error('Error saving spreadsheet:', error);
    throw new Error('Failed to save spreadsheet');
  }
};

/**
 * Load a spreadsheet from localStorage
 * @param name The name of the spreadsheet to load
 * @returns The cells state of the loaded spreadsheet
 */
export const loadSpreadsheet = (name: string): Record<string, any> => {
  try {
    const data = localStorage.getItem(`spreadsheet_${name}`);
    if (!data) {
      throw new Error(`Spreadsheet "${name}" not found`);
    }
    
    const spreadsheetData = JSON.parse(data);
    return spreadsheetData.cells;
  } catch (error) {
    console.error('Error loading spreadsheet:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      throw error; // Re-throw the original error for "not found" cases
    }
    throw new Error('Failed to load spreadsheet');
  }
};

/**
 * Get a list of all saved spreadsheets
 * @returns Array of spreadsheet names
 */
export const getSavedSpreadsheetList = (): string[] => {
  try {
    const list = localStorage.getItem('spreadsheet_list');
    return list ? JSON.parse(list) : [];
  } catch (error) {
    console.error('Error getting spreadsheet list:', error);
    return [];
  }
};

/**
 * Delete a saved spreadsheet
 * @param name The name of the spreadsheet to delete
 */
export const deleteSpreadsheet = (name: string): void => {
  try {
    // Remove the spreadsheet data
    localStorage.removeItem(`spreadsheet_${name}`);
    
    // Update the list
    const savedList = getSavedSpreadsheetList();
    const updatedList = savedList.filter(item => item !== name);
    localStorage.setItem('spreadsheet_list', JSON.stringify(updatedList));
  } catch (error) {
    console.error('Error deleting spreadsheet:', error);
    throw new Error('Failed to delete spreadsheet');
  }
};

/**
 * Export spreadsheet to a file
 * @param cells The current cells state
 * @param name The name to use for the exported file
 */
export const exportSpreadsheetToFile = (cells: Record<string, any>, name: string): void => {
  try {
    const spreadsheetData = {
      cells,
      name,
      lastModified: new Date().toISOString(),
      version: '1.0.0'
    };
    
    jsonToFile(spreadsheetData, `${name}.sheet`);
  } catch (error) {
    console.error('Error exporting spreadsheet:', error);
    throw new Error('Failed to export spreadsheet');
  }
};

/**
 * Import spreadsheet from a file
 * @param file The file to import
 * @returns A promise that resolves to the imported cells state
 */
export const importSpreadsheetFromFile = async (file: File): Promise<Record<string, any>> => {
  try {
    const data = await fileToJSON(file);
    
    // Validate the imported data
    if (!data || !data.cells) {
      throw new Error('Invalid spreadsheet file');
    }
    
    return data.cells;
  } catch (error) {
    console.error('Error importing spreadsheet:', error);
    throw new Error('Failed to import spreadsheet');
  }
};
