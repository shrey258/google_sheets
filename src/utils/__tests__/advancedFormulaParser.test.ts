import {
  parseCellReference,
  adjustFormula,
  hasCircularReference,
  ReferenceType,
  evaluateExpression
} from '../advancedFormulaParser';
import { CellType } from '../../types';

describe('Cell Reference Parser', () => {
  describe('parseCellReference', () => {
    it('parses relative cell reference', () => {
      const result = parseCellReference('A1');
      expect(result).toEqual({
        original: 'A1',
        col: 'A',
        row: 1,
        colAbsolute: false,
        rowAbsolute: false
      });
    });

    it('parses absolute column reference', () => {
      const result = parseCellReference('$A1');
      expect(result).toEqual({
        original: '$A1',
        col: 'A',
        row: 1,
        colAbsolute: true,
        rowAbsolute: false
      });
    });

    it('parses absolute row reference', () => {
      const result = parseCellReference('A$1');
      expect(result).toEqual({
        original: 'A$1',
        col: 'A',
        row: 1,
        colAbsolute: false,
        rowAbsolute: true
      });
    });

    it('parses absolute cell reference', () => {
      const result = parseCellReference('$A$1');
      expect(result).toEqual({
        original: '$A$1',
        col: 'A',
        row: 1,
        colAbsolute: true,
        rowAbsolute: true
      });
    });

    it('returns null for invalid references', () => {
      expect(parseCellReference('invalid')).toBeNull();
      expect(parseCellReference('123')).toBeNull();
      expect(parseCellReference('')).toBeNull();
    });
  });
});

describe('Formula Adjustment', () => {
  it('adjusts relative references', () => {
    const formula = '=A1+B2';
    const rowOffset = 1;
    const colOffset = 1;
    const adjusted = adjustFormula(formula, rowOffset, colOffset);
    expect(adjusted).toBe('=B2+C3');
  });

  it('preserves absolute column references', () => {
    const formula = '=$A1+$B2';
    const rowOffset = 1;
    const colOffset = 1;
    const adjusted = adjustFormula(formula, rowOffset, colOffset);
    expect(adjusted).toBe('=$A2+$B3');
  });

  it('preserves absolute row references', () => {
    const formula = '=A$1+B$2';
    const rowOffset = 1;
    const colOffset = 1;
    const adjusted = adjustFormula(formula, rowOffset, colOffset);
    expect(adjusted).toBe('=B$1+C$2');
  });

  it('preserves absolute cell references', () => {
    const formula = '=$A$1+$B$2';
    const rowOffset = 1;
    const colOffset = 1;
    const adjusted = adjustFormula(formula, rowOffset, colOffset);
    expect(adjusted).toBe('=$A$1+$B$2');
  });
});

describe('Circular Reference Detection', () => {
  it('detects direct circular reference', () => {
    const cells = {
      'A1': {
        id: 'A1',
        value: '',
        type: CellType.Formula,
        formula: '=B1',
        formatted: '',
        style: {}
      },
      'B1': {
        id: 'B1',
        value: '',
        type: CellType.Formula,
        formula: '=A1',
        formatted: '',
        style: {}
      }
    };

    expect(hasCircularReference('A1', cells)).toBe(true);
    expect(hasCircularReference('B1', cells)).toBe(true);
  });

  it('detects indirect circular reference', () => {
    const cells = {
      'A1': {
        id: 'A1',
        value: '',
        type: CellType.Formula,
        formula: '=B1',
        formatted: '',
        style: {}
      },
      'B1': {
        id: 'B1',
        value: '',
        type: CellType.Formula,
        formula: '=C1',
        formatted: '',
        style: {}
      },
      'C1': {
        id: 'C1',
        value: '',
        type: CellType.Formula,
        formula: '=D1',
        formatted: '',
        style: {}
      },
      'D1': {
        id: 'D1',
        value: '',
        type: CellType.Formula,
        formula: '=A1',
        formatted: '',
        style: {}
      }
    };

    expect(hasCircularReference('A1', cells)).toBe(true);
    expect(hasCircularReference('C1', cells)).toBe(true);
  });

  it('detects self-reference', () => {
    const cells = {
      'A1': {
        id: 'A1',
        value: '',
        type: CellType.Formula,
        formula: '=A1',
        formatted: '',
        style: {}
      }
    };

    expect(hasCircularReference('A1', cells)).toBe(true);
  });

  it('returns false for non-circular references', () => {
    const cells = {
      'A1': {
        id: 'A1',
        value: '',
        type: CellType.Formula,
        formula: '=B1',
        formatted: '',
        style: {}
      },
      'B1': {
        id: 'B1',
        value: '',
        type: CellType.Formula,
        formula: '=C1',
        formatted: '',
        style: {}
      },
      'C1': {
        id: 'C1',
        value: '10',
        type: CellType.Number,
        formula: '',
        formatted: '10',
        style: {}
      }
    };

    expect(hasCircularReference('A1', cells)).toBe(false);
    expect(hasCircularReference('B1', cells)).toBe(false);
  });
});
