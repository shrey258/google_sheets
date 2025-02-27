import React, { useState, useEffect, useRef } from 'react';
import useSaveLoad from '../hooks/useSaveLoad';

/**
 * Component for saving and loading spreadsheets
 */
const SaveLoadMenu: React.FC = () => {
  const {
    savedSheets,
    currentSheetName,
    error,
    loadSavedList,
    saveCurrentSheet,
    loadSheet,
    deleteSheet,
    exportToFile,
    importFromFile,
    setCurrentSheetName
  } = useSaveLoad();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newSheetName, setNewSheetName] = useState(currentSheetName);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load the saved sheets list when the component mounts
  useEffect(() => {
    loadSavedList();
  }, [loadSavedList]);

  // Handle save button click
  const handleSave = () => {
    setNewSheetName(currentSheetName);
    setIsSaveDialogOpen(true);
  };

  // Handle save confirmation
  const handleSaveConfirm = () => {
    if (newSheetName.trim() === '') {
      return;
    }
    
    saveCurrentSheet(newSheetName);
    setIsSaveDialogOpen(false);
    setIsMenuOpen(false);
  };

  // Handle load button click
  const handleLoad = (name: string) => {
    loadSheet(name);
    setIsMenuOpen(false);
  };

  // Handle delete button click
  const handleDelete = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteSheet(name);
    }
  };

  // Handle export button click
  const handleExport = () => {
    exportToFile();
    setIsMenuOpen(false);
  };

  // Handle import button click
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection for import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await importFromFile(files[0]);
      setIsMenuOpen(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      {/* File menu button */}
      <button
        className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        File
      </button>

      {/* File menu dropdown */}
      {isMenuOpen && (
        <div className="absolute left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleExport}
            >
              Export
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleImportClick}
            >
              Import
            </button>
            
            {/* Hidden file input for import */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".sheet"
              onChange={handleFileChange}
            />
            
            {/* Saved sheets list */}
            {savedSheets.length > 0 && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <div className="px-4 py-1 text-xs font-semibold text-gray-500">
                  Saved Spreadsheets
                </div>
                {savedSheets.map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleLoad(name)}
                  >
                    <span>{name}</span>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => handleDelete(name, e)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Save dialog */}
      {isSaveDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80">
            <h3 className="text-lg font-medium mb-4">Save Spreadsheet</h3>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              placeholder="Spreadsheet name"
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => setIsSaveDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                onClick={handleSaveConfirm}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default SaveLoadMenu;
