# Advanced Features Documentation

This document provides detailed information about the advanced features implemented in our Google Sheets clone.

## Advanced Formula Parsing

### Overview

The advanced formula parser enables support for both relative and absolute cell references, similar to how Excel and Google Sheets work. This allows formulas to be copied between cells while maintaining the correct references.

### Types of Cell References

1. **Relative References** (e.g., `A1`)
   - Both row and column change when copied to a new location
   - Example: If `=A1` is in cell B2 and copied to C3, it becomes `=B2`

2. **Absolute Column References** (e.g., `$A1`)
   - Column stays fixed when copied, row changes
   - Example: If `=$A1` is in cell B2 and copied to C3, it becomes `=$A2`

3. **Absolute Row References** (e.g., `A$1`)
   - Row stays fixed when copied, column changes
   - Example: If `=A$1` is in cell B2 and copied to C3, it becomes `=B$1`

4. **Absolute References** (e.g., `$A$1`)
   - Both row and column stay fixed when copied
   - Example: If `=$A$1` is in cell B2 and copied to C3, it remains `=$A$1`

### Implementation Details

The advanced formula parser consists of several key components:

1. **parseCellReference**: Parses a cell reference and identifies if it's absolute or relative
   ```typescript
   // Example: parseCellReference('$A$1')
   // Returns: { original: '$A$1', col: 'A', row: 1, colAbsolute: true, rowAbsolute: true }
   ```

2. **findCellReferences**: Extracts all cell references from a formula
   ```typescript
   // Example: findCellReferences('=A1+$B$2')
   // Returns: ['A1', '$B$2']
   ```

3. **adjustFormula**: Adjusts formulas when copied to a new location
   ```typescript
   // Example: adjustFormula('=A1+$B$2', 1, 1)
   // Returns: '=B2+$B$2'
   ```

4. **hasCircularReference**: Detects circular references in formulas
   ```typescript
   // Example: hasCircularReference('=A1', 'A1', cells)
   // Returns: true if A1 references itself directly or indirectly
   ```

## Copy, Cut, and Paste Functionality

### Overview

The copy/paste functionality allows users to copy cells and their content (including formulas) and paste them to a new location. When formulas are copied, their cell references are adjusted according to the rules of relative and absolute references.

### Features

1. **Copy Cells**: Copy selected cells to an internal clipboard
   - Keyboard shortcut: `Ctrl+C`
   - Toolbar button available

2. **Cut Cells**: Copy selected cells and clear their content
   - Keyboard shortcut: `Ctrl+X`
   - Toolbar button available

3. **Paste Cells**: Paste copied cells to a new location
   - Keyboard shortcut: `Ctrl+V`
   - Toolbar button available
   - Formulas are adjusted based on relative/absolute references

### Implementation Details

The copy/paste functionality is implemented using:

1. **useCopyPaste Hook**: Custom React hook that provides copy, cut, and paste functions
   ```typescript
   const { copySelectedCells, pasteCells, cutSelectedCells } = useCopyPaste();
   ```

2. **localStorage**: Used to store copied cells between operations
   ```typescript
   // Stores copied cells
   localStorage.setItem('copiedCells', JSON.stringify(copiedCells));
   // Stores origin for relative positioning
   localStorage.setItem('copyOrigin', JSON.stringify({ row: minRow, col: minCol }));
   ```

3. **Formula Adjustment**: When pasting, formulas are adjusted using the `adjustFormula` function
   ```typescript
   const adjustedFormula = adjustFormula(data.formula, rowOffset, colOffset);
   ```

## Data Visualization with Charts

### Overview

The charting functionality allows users to create visual representations of their data. Users can select a range of cells and create different types of charts.

### Chart Types

1. **Bar Chart**: For comparing values across categories
2. **Line Chart**: For showing trends over time
3. **Pie Chart**: For showing proportions of a whole
4. **Scatter Chart**: For showing correlation between two variables
5. **Area Chart**: For showing cumulative totals over time

### Usage

1. Select the data range you want to visualize
2. Click the "Create Chart" button in the toolbar
3. Choose the chart type and configure options in the dialog
4. Click "Create" to insert the chart

### Implementation Details

Charts are implemented using:

1. **Chart Component**: Renders different types of charts based on configuration
2. **ChartDialog Component**: Provides UI for creating and configuring charts
3. **Chart Configuration**: Stored in the spreadsheet state
   ```typescript
   interface ChartConfig {
     type: ChartType;
     title: string;
     dataRange: string;
     labelRange?: string;
     options?: {
       showLegend?: boolean;
       colors?: string[];
       stacked?: boolean;
     };
   }
   ```

## Formula Help

The Formula Help component provides users with guidance on:

1. Available functions and their syntax
2. How to use cell references (relative and absolute)
3. Examples of common formulas
4. Keyboard shortcuts

Access the Formula Help by clicking the "Formula Help" button in the formula bar.

## Testing

All advanced features are covered by comprehensive unit tests:

1. **advancedFormulaParser.test.ts**: Tests for the advanced formula parser
2. **useCopyPaste.test.tsx**: Tests for the copy/paste functionality
3. **formulaEvaluator.test.ts**: Tests for formula evaluation with advanced references

Run tests using:
```bash
npm test
```

For test coverage:
```bash
npm run test:coverage
```
