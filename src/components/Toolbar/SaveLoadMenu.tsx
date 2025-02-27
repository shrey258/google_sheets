import React, { useState, useEffect } from 'react';
import useSaveLoad from '../../hooks/useSaveLoad';

const SaveLoadMenu: React.FC = () => {
  const {
    savedSheets,
    currentSheetName,
    saveCurrentSheet,
    loadSheet,
    deleteSheet,
    exportToFile,
    importFromFile,
    error,
    loadSavedList
  } = useSaveLoad();

  const [isOpen, setIsOpen] = useState(false);
  const [newSheetName, setNewSheetName] = useState(currentSheetName);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);

  // Load the saved sheets list when the component mounts
  useEffect(() => {
    loadSavedList();
  }, [loadSavedList]);

  // Create a file input element for importing
  useEffect(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    input.addEventListener('change', handleFileSelect);
    document.body.appendChild(input);
    setFileInput(input);

    return () => {
      input.removeEventListener('change', handleFileSelect);
      document.body.removeChild(input);
    };
  }, []);

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      await importFromFile(target.files[0]);
      target.value = ''; // Reset the input
    }
  };

  const handleSave = () => {
    if (newSheetName.trim()) {
      saveCurrentSheet(newSheetName.trim());
      setShowSaveDialog(false);
    }
  };

  const handleLoad = (name: string) => {
    loadSheet(name);
    setShowLoadDialog(false);
    setIsOpen(false);
  };

  const handleDelete = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteSheet(name);
    }
  };

  const handleImport = () => {
    fileInput?.click();
  };

  const handleExport = () => {
    exportToFile(currentSheetName);
  };

  return (
    <div className="relative">
      <button
        className="px-3 py-1 text-sm bg-white hover:bg-gray-100 border border-gray-300 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        File
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
          <ul className="py-1">
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setShowSaveDialog(true);
                setIsOpen(false);
              }}
            >
              Save
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setShowLoadDialog(true);
                setIsOpen(false);
              }}
            >
              Load
            </li>
            <li className="border-t border-gray-200"></li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={handleExport}
            >
              Export
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={handleImport}
            >
              Import
            </li>
          </ul>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Save Spreadsheet</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Spreadsheet Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                placeholder="Enter a name for your spreadsheet"
              />
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded mr-2"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Load Spreadsheet</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {savedSheets.length === 0 ? (
              <p className="text-gray-500 mb-4">No saved spreadsheets found.</p>
            ) : (
              <ul className="mb-4 max-h-60 overflow-y-auto">
                {savedSheets.map((name) => (
                  <li
                    key={name}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => handleLoad(name)}
                  >
                    <span>{name}</span>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => handleDelete(name, e)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                onClick={() => setShowLoadDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveLoadMenu;
