import { useState, useCallback } from 'react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';
import {
  saveSpreadsheet,
  loadSpreadsheet,
  getSavedSpreadsheetList,
  deleteSpreadsheet,
  exportSpreadsheetToFile,
  importSpreadsheetFromFile
} from '../utils/saveLoadOperations';

/**
 * Custom hook for saving and loading spreadsheets
 */
const useSaveLoad = () => {
  const { cells, updateCellValue, updateCellFormula, updateCellStyle } = useSpreadsheetStore();
  const [savedSheets, setSavedSheets] = useState<string[]>([]);
  const [currentSheetName, setCurrentSheetName] = useState<string>('Untitled');
  const [error, setError] = useState<string | null>(null);

  // Load the list of saved spreadsheets
  const loadSavedList = useCallback(() => {
    try {
      const list = getSavedSpreadsheetList();
      setSavedSheets(list);
      return list;
    } catch (err) {
      setError('Failed to load saved spreadsheets list');
      return [];
    }
  }, []);

  // Save the current spreadsheet
  const saveCurrentSheet = useCallback((name: string) => {
    try {
      saveSpreadsheet(cells, name);
      setCurrentSheetName(name);
      loadSavedList();
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to save spreadsheet');
      return false;
    }
  }, [cells, loadSavedList]);

  // Load a spreadsheet
  const loadSheet = useCallback((name: string) => {
    try {
      const loadedCells = loadSpreadsheet(name);
      
      // Clear existing cells and load new ones
      Object.entries(loadedCells).forEach(([cellId, cellData]) => {
        if (cellData.value) {
          updateCellValue(cellId, cellData.value);
        }
        if (cellData.formula) {
          updateCellFormula(cellId, cellData.formula);
        }
        if (cellData.style) {
          updateCellStyle(cellId, cellData.style);
        }
      });
      
      setCurrentSheetName(name);
      setError(null);
      return true;
    } catch (err) {
      setError(`Failed to load spreadsheet "${name}"`);
      return false;
    }
  }, [updateCellValue, updateCellFormula, updateCellStyle]);

  // Delete a spreadsheet
  const deleteSheet = useCallback((name: string) => {
    try {
      deleteSpreadsheet(name);
      loadSavedList();
      setError(null);
      return true;
    } catch (err) {
      setError(`Failed to delete spreadsheet "${name}"`);
      return false;
    }
  }, [loadSavedList]);

  // Export the current spreadsheet to a file
  const exportToFile = useCallback(() => {
    try {
      exportSpreadsheetToFile(cells, currentSheetName);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to export spreadsheet');
      return false;
    }
  }, [cells, currentSheetName]);

  // Import a spreadsheet from a file
  const importFromFile = useCallback(async (file: File) => {
    try {
      const importedCells = await importSpreadsheetFromFile(file);
      
      // Clear existing cells and load new ones
      Object.entries(importedCells).forEach(([cellId, cellData]) => {
        if (cellData.value) {
          updateCellValue(cellId, cellData.value);
        }
        if (cellData.formula) {
          updateCellFormula(cellId, cellData.formula);
        }
        if (cellData.style) {
          updateCellStyle(cellId, cellData.style);
        }
      });
      
      // Set the sheet name from the file name (without extension)
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setCurrentSheetName(fileName);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to import spreadsheet');
      return false;
    }
  }, [updateCellValue, updateCellFormula, updateCellStyle]);

  return {
    savedSheets,
    currentSheetName,
    error,
    cells,
    loadSavedList,
    saveCurrentSheet,
    loadSheet,
    deleteSheet,
    exportToFile,
    importFromFile,
    setCurrentSheetName
  };
};

export default useSaveLoad;
