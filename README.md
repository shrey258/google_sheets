# Google Sheets Clone

A web application that mimics Google Sheets, featuring a spreadsheet interface with mathematical and data quality functions.

## Tech Stack & Data Structures

### Frontend
- **React with TypeScript**: For building the UI components with type safety
- **Tailwind CSS**: For styling with utility-first approach
- **Zustand**: For lightweight state management
- **React-Draggable**: For implementing drag-and-drop functionality

### Data Structures

#### Cell Data Model
The core data structure is a cell-based model where:
- Each cell is uniquely identified by a column letter and row number (e.g., A1, B2)
- Cells are stored in a hashmap for O(1) lookup time
- Cell dependencies are tracked for formula evaluation

```typescript
interface CellData {
  id: string;           // Unique identifier (e.g., "A1")
  value: string;        // Displayed value
  formula: string;      // Formula if present (e.g., "=SUM(A1:A5)")
  formatted: string;    // Formatted display value
  type: CellType;       // Type of cell (text, number, date, formula)
  style: CellStyle;     // Styling information
  dependencies?: string[]; // Cells this cell depends on
  dependents?: string[];   // Cells that depend on this cell
}
```

#### Spreadsheet State
The application uses a normalized state structure:
- Cells are stored in a map for efficient access and updates
- Rows and columns are stored separately to manage dimensions
- Selection state is tracked for user interactions

```typescript
interface SpreadsheetData {
  cells: Record<string, CellData>;  // Map of cell ID to cell data
  columns: Column[];                // Column definitions
  rows: Row[];                      // Row definitions
  selectedCell: string | null;      // Currently selected cell
  selectedRange: string[] | null;   // Selected range of cells
  activeFormula: string;            // Current formula being edited
}
```

### Formula Evaluation
- Formulas are parsed using a recursive descent parser
- Cell references are resolved before evaluation
- Circular dependencies are detected and prevented
- Mathematical and data quality functions are implemented with appropriate type handling
- Support for absolute and relative cell references (e.g., $A$1, A$1, $A1)

## Features

### Spreadsheet Interface
- Google Sheets-like UI with toolbar, formula bar, and grid layout
- Cell selection, editing, and formatting
- Drag-and-drop functionality for content and formulas
- Row and column resizing, adding, and deleting

### Mathematical Functions
- SUM: Calculate the sum of a range of cells
- AVERAGE: Calculate the average of a range of cells
- MAX: Find the maximum value in a range
- MIN: Find the minimum value in a range
- COUNT: Count the number of numeric values in a range

### Data Quality Functions
- TRIM: Remove leading and trailing whitespace
- UPPER: Convert text to uppercase
- LOWER: Convert text to lowercase
- REMOVE_DUPLICATES: Remove duplicate values from a range
- FIND_AND_REPLACE: Find and replace text within cells

### Cell Formatting
- Text styling (bold, italic, underline)
- Text alignment
- Font color and background color

### Advanced Features
- Copy, cut, and paste cells with keyboard shortcuts (Ctrl+C, Ctrl+X, Ctrl+V)
- Intelligent formula adjustment when copying formulas (respecting absolute/relative references)
- File operations (save, load, export to CSV)
- Data visualization with charts (bar, line, pie)
- Formula help with reference guide

## Performance Considerations
- Cell rendering is optimized with React.memo
- Formula evaluation is optimized to only recalculate affected cells
- Virtualized rendering for large spreadsheets
- Efficient state updates with Zustand

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/shrey258/google_sheets.git

# Navigate to the project directory
cd google_sheets

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Deployment

### Deploying to Vercel

1. **Prerequisites**
   - A [Vercel](https://vercel.com) account
   - [Vercel CLI](https://vercel.com/cli) installed (optional)

2. **Automatic Deployment (Recommended)**
   ```bash
   # Login to your Vercel account
   vercel login

   # Deploy the application
   vercel
   ```

   Or simply connect your GitHub repository to Vercel:
   1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
   2. Click "New Project"
   3. Import your GitHub repository
   4. Configure project settings:
      - Framework Preset: Vite
      - Build Command: `npm run build`
      - Output Directory: `dist`
   5. Click "Deploy"

3. **Environment Variables**
   If you're using environment variables, make sure to add them in your Vercel project settings:
   1. Go to Project Settings
   2. Navigate to Environment Variables
   3. Add your variables

4. **Custom Domain (Optional)**
   1. Go to Project Settings
   2. Navigate to Domains
   3. Add your custom domain
   4. Follow the DNS configuration instructions

5. **Monitoring**
   - View deployment status in the Vercel Dashboard
   - Check build logs for any issues
   - Monitor performance analytics

The application is now deployed and will automatically redeploy on every push to the main branch.

## Usage
1. Navigate to the application in your browser
2. Click on cells to select and edit them
3. Use the formula bar to enter values or formulas
4. Apply formatting using the toolbar
5. Use mathematical and data quality functions by typing formulas (e.g., =SUM(A1:A5))

## Testing
- Unit tests for mathematical and data quality functions
- Integration tests for the spreadsheet interface
- End-to-end tests for user workflows

## Assignment Checker Guide

This section provides guidance for testing and validating the formula evaluation system.

### Formula Evaluation System

The formula evaluation system is implemented in the following key files:
- `src/utils/formulaEvaluator.ts`: Core formula parsing and evaluation logic
- `src/utils/helpers.ts`: Helper functions for cell references and type conversion
- `src/store/spreadsheetStore.ts`: State management and formula integration

### Testing the Formula System

1. **Basic Formula Testing**
```typescript
// Test basic arithmetic
expect(evaluateFormula("=1+2", {})).toBe(3)
expect(evaluateFormula("=10-5", {})).toBe(5)
expect(evaluateFormula("=4*3", {})).toBe(12)
expect(evaluateFormula("=15/3", {})).toBe(5)

// Test cell references
const cells = {
  "A1": { value: "10", type: CellType.Number },
  "A2": { value: "20", type: CellType.Number }
}
expect(evaluateFormula("=A1+A2", cells)).toBe(30)
```

2. **Mathematical Functions**
```typescript
// Test SUM function
expect(evaluateFormula("=SUM(A1:A3)", {
  "A1": { value: "1", type: CellType.Number },
  "A2": { value: "2", type: CellType.Number },
  "A3": { value: "3", type: CellType.Number }
})).toBe(6)

// Test AVERAGE function
expect(evaluateFormula("=AVERAGE(B1:B2)", {
  "B1": { value: "10", type: CellType.Number },
  "B2": { value: "20", type: CellType.Number }
})).toBe(15)
```

3. **String Functions**
```typescript
// Test CONCATENATE
expect(evaluateFormula('=CONCATENATE("Hello", " ", "World")', {})).toBe("Hello World")

// Test string manipulation
expect(evaluateFormula('=UPPER("test")', {})).toBe("TEST")
expect(evaluateFormula('=LOWER("TEST")', {})).toBe("test")
expect(evaluateFormula('=TRIM("  spaces  ")', {})).toBe("spaces")
```

4. **Array Operations**
```typescript
// Test array handling
expect(evaluateFormula("=SUM(A1:A3)", {
  "A1": { value: "1,2,3", type: CellType.Array }
})).toBe(6)

// Test UNIQUE function
expect(evaluateFormula("=UNIQUE(A1:A3)", {
  "A1": { value: "1", type: CellType.Number },
  "A2": { value: "1", type: CellType.Number },
  "A3": { value: "2", type: CellType.Number }
})).toEqual(["1", "2"])
```

5. **Error Handling**
```typescript
// Test division by zero
expect(evaluateFormula("=1/0", {})).toBe("#DIV/0!")

// Test circular reference
expect(evaluateFormula("=A1", {
  "A1": { value: "=A1", type: CellType.Formula }
})).toBe("#CIRCULAR!")

// Test invalid function
expect(evaluateFormula("=INVALID()", {})).toBe("#ERROR!")
```

### Key Features to Validate

1. **Type Safety**
- All functions properly handle mixed string/number inputs
- Array values are correctly processed
- Type conversions are handled safely

2. **Error Handling**
- Division by zero
- Circular references
- Invalid function names
- Invalid arguments
- Range reference errors

3. **Array Support**
- Functions work with single values and arrays
- Range references return proper arrays
- Array results are properly formatted

4. **Formula Parsing**
- Correct operator precedence
- Proper handling of parentheses
- String literal support
- Cell reference parsing
- Range reference parsing

5. **Performance**
- Large range operations (1000+ cells)
- Complex nested formulas
- Multiple dependent cells

### Common Edge Cases

1. **Empty Values**
```typescript
expect(evaluateFormula("=SUM(A1:A3)", {
  "A1": { value: "", type: CellType.Number },
  "A2": { value: "2", type: CellType.Number },
  "A3": { value: "", type: CellType.Number }
})).toBe(2)
```

2. **Non-numeric Values in Mathematical Functions**
```typescript
expect(evaluateFormula("=SUM(A1:A3)", {
  "A1": { value: "text", type: CellType.Text },
  "A2": { value: "2", type: CellType.Number },
  "A3": { value: "3", type: CellType.Number }
})).toBe(5)
```

3. **Mixed Types in Arrays**
```typescript
expect(evaluateFormula("=CONCATENATE(A1:A3)", {
  "A1": { value: "1", type: CellType.Number },
  "A2": { value: "text", type: CellType.Text },
  "A3": { value: "2", type: CellType.Number }
})).toBe("1text2")
```

### Running Tests

```bash
# Run all tests
npm test

# Run formula evaluator tests specifically
npm test formulaEvaluator

# Run with coverage
npm test -- --coverage
```

For detailed test coverage and reports, check the `coverage` directory after running tests with coverage enabled.

## Future Enhancements
- Advanced formula parsing with relative and absolute cell references
- Save and load spreadsheets
- Data visualization with charts and graphs
- Collaborative editing
- Mobile responsiveness
