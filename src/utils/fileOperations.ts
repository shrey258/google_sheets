import { SpreadsheetData } from '../types';

/**
 * Save spreadsheet data to a JSON file
 * @param spreadsheetData The spreadsheet data to save
 * @param fileName Optional custom filename
 */
export const saveSpreadsheet = (spreadsheetData: SpreadsheetData, fileName: string = 'spreadsheet'): void => {
  try {
    // Create a blob with the spreadsheet data
    const dataStr = JSON.stringify(spreadsheetData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error saving spreadsheet:', error);
    throw new Error('Failed to save spreadsheet');
  }
};

/**
 * Load spreadsheet data from a JSON file
 * @returns Promise that resolves with the loaded spreadsheet data
 */
export const loadSpreadsheet = (): Promise<SpreadsheetData> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      // Handle file selection
      input.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const result = e.target?.result as string;
            const data = JSON.parse(result) as SpreadsheetData;
            resolve(data);
          } catch (error) {
            reject(new Error('Invalid spreadsheet file'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
      };
      
      // Trigger file selection dialog
      input.click();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export spreadsheet as CSV
 * @param spreadsheetData The spreadsheet data to export
 * @param fileName Optional custom filename
 */
export const exportAsCsv = (spreadsheetData: SpreadsheetData, fileName: string = 'spreadsheet'): void => {
  try {
    const { cells, rows, columns } = spreadsheetData;
    
    // Determine the range of data
    const maxRow = rows.length;
    const maxCol = columns.length;
    
    // Create CSV content
    let csvContent = '';
    
    for (let rowIndex = 0; rowIndex < maxRow; rowIndex++) {
      const rowValues = [];
      
      for (let colIndex = 0; colIndex < maxCol; colIndex++) {
        const cellId = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
        const cell = cells[cellId];
        let cellValue = cell?.formatted || cell?.value || '';
        
        // Escape quotes and wrap in quotes if contains comma
        if (cellValue.includes('"') || cellValue.includes(',')) {
          cellValue = `"${cellValue.replace(/"/g, '""')}"`;
        }
        
        rowValues.push(cellValue);
      }
      
      csvContent += rowValues.join(',') + '\n';
    }
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting as CSV:', error);
    throw new Error('Failed to export as CSV');
  }
};

/**
 * Convert a file to JSON
 * @param file The file to convert
 * @returns Promise that resolves with the parsed JSON data
 */
export const fileToJSON = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const jsonData = JSON.parse(result);
          resolve(jsonData);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Save JSON data to a file
 * @param data The data to save
 * @param fileName The name of the file
 */
export const jsonToFile = (data: any, fileName: string): void => {
  try {
    // Create a blob with the data
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error saving to file:', error);
    throw new Error('Failed to save file');
  }
};
