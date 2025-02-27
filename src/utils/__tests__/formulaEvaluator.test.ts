import {
  evaluateSUM,
  evaluateAVERAGE,
  evaluateMAX,
  evaluateMIN,
  evaluateCOUNT,
  evaluateMEDIAN,
  evaluateSTDEV,
  evaluateTRIM,
  evaluateUPPER,
  evaluateLOWER,
  evaluateLEN,
  evaluateSUBSTRING,
  evaluateCONCATENATE,
  evaluateIF,
  evaluateROUND,
  evaluateCOUNTA,
  evaluateUNIQUE,
  evaluateREMOVE_DUPLICATES,
  evaluateFIND_AND_REPLACE,
  evaluateFormula,
  evaluateExpression,
  parseFormula
} from '../formulaEvaluator';
import { CellData, CellType } from '../../types';

describe('Formula Functions', () => {
  describe('Mathematical Functions', () => {
    it('evaluates SUM correctly', () => {
      expect(evaluateSUM(['1', '2', '3'])).toBe(6);
      expect(evaluateSUM(['1', '', '3'])).toBe(4);
      expect(evaluateSUM([])).toBe(0);
    });

    it('evaluates AVERAGE correctly', () => {
      expect(evaluateAVERAGE(['1', '2', '3'])).toBe(2);
      expect(evaluateAVERAGE(['1', '', '3'])).toBe(2);
      expect(evaluateAVERAGE([])).toBe(0);
    });

    it('evaluates MAX correctly', () => {
      expect(evaluateMAX(['1', '2', '3'])).toBe(3);
      expect(evaluateMAX(['1', '', '3'])).toBe(3);
      expect(evaluateMAX([])).toBe(0);
    });

    it('evaluates MIN correctly', () => {
      expect(evaluateMIN(['1', '2', '3'])).toBe(1);
      expect(evaluateMIN(['1', '', '3'])).toBe(1);
      expect(evaluateMIN([])).toBe(0);
    });

    it('evaluates COUNT correctly', () => {
      expect(evaluateCOUNT(['1', '2', '3'])).toBe(3);
      expect(evaluateCOUNT(['1', '', '3'])).toBe(2);
      expect(evaluateCOUNT([])).toBe(0);
    });

    it('evaluates ROUND correctly', () => {
      expect(evaluateROUND(1.234, 2)).toBe(1.23);
      expect(evaluateROUND(1.235, 2)).toBe(1.24);
      expect(() => evaluateROUND('invalid', 2)).toThrow();
    });
  });

  describe('Statistical Functions', () => {
    it('evaluates MEDIAN correctly', () => {
      expect(evaluateMEDIAN(['1', '2', '3'])).toBe(2);
      expect(evaluateMEDIAN(['1', '2', '3', '4'])).toBe(2.5);
      expect(evaluateMEDIAN([])).toBe(0);
    });

    it('evaluates STDEV correctly', () => {
      expect(evaluateSTDEV(['2', '4', '4', '4', '5', '5', '7', '9'])).toBeCloseTo(2.138, 3);
      expect(evaluateSTDEV(['1'])).toBe(0);
      expect(evaluateSTDEV([])).toBe(0);
    });
  });

  describe('Text Functions', () => {
    it('evaluates TRIM correctly', () => {
      expect(evaluateTRIM('  hello  ')).toBe('hello');
      expect(evaluateTRIM('hello')).toBe('hello');
    });

    it('evaluates UPPER correctly', () => {
      expect(evaluateUPPER('hello')).toBe('HELLO');
      expect(evaluateUPPER('Hello World')).toBe('HELLO WORLD');
    });

    it('evaluates LOWER correctly', () => {
      expect(evaluateLOWER('HELLO')).toBe('hello');
      expect(evaluateLOWER('Hello World')).toBe('hello world');
    });

    it('evaluates LEN correctly', () => {
      expect(evaluateLEN('hello')).toBe(5);
      expect(evaluateLEN('')).toBe(0);
    });

    it('evaluates SUBSTRING correctly', () => {
      expect(evaluateSUBSTRING('hello', 1, 3)).toBe('ell');
      expect(evaluateSUBSTRING('hello', 1)).toBe('ello');
    });

    it('evaluates CONCATENATE correctly', () => {
      expect(evaluateCONCATENATE(['Hello', ' ', 'World'])).toBe('Hello World');
      expect(evaluateCONCATENATE(['A', 1, 'B', 2])).toBe('A1B2');
    });
  });

  describe('Data Quality Functions', () => {
    it('evaluates REMOVE_DUPLICATES correctly', () => {
      expect(evaluateREMOVE_DUPLICATES(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
      expect(evaluateREMOVE_DUPLICATES(['1', '2', '2', '3'])).toEqual(['1', '2', '3']);
    });

    it('evaluates FIND_AND_REPLACE correctly', () => {
      expect(evaluateFIND_AND_REPLACE(['hello world', 'hello there'], 'hello', 'hi')).toEqual(['hi world', 'hi there']);
      expect(evaluateFIND_AND_REPLACE(['test'], 'e', 'a')).toEqual(['tast']);
    });
  });

  describe('Logical Functions', () => {
    it('evaluates IF correctly', () => {
      expect(evaluateIF(true, 'yes', 'no')).toBe('yes');
      expect(evaluateIF(false, 'yes', 'no')).toBe('no');
      expect(evaluateIF(1, 'yes', 'no')).toBe('yes');
      expect(evaluateIF(0, 'yes', 'no')).toBe('no');
    });
  });

  describe('Advanced Functions', () => {
    it('evaluates COUNTA correctly', () => {
      expect(evaluateCOUNTA(['1', '2', '', '3'])).toBe(3);
      expect(evaluateCOUNTA(['', '', ''])).toBe(0);
    });

    it('evaluates UNIQUE correctly', () => {
      expect(evaluateUNIQUE(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
      expect(evaluateUNIQUE(['1', '2', '2', '3'])).toEqual(['1', '2', '3']);
    });
  });
});

describe('Formula Evaluation', () => {
  const testCells: Record<string, CellData> = {
    'A1': { value: '1', type: CellType.Number },
    'A2': { value: '2', type: CellType.Number },
    'A3': { value: '3', type: CellType.Number },
    'B1': { value: 'Hello', type: CellType.Text },
    'B2': { formula: '=A1+A2', type: CellType.Formula },
    'B3': { formula: '=SUM(A1:A3)', type: CellType.Formula },
    'C1': { formula: '=AVERAGE(A1:A3)', type: CellType.Formula },
    'C2': { formula: '=CONCATENATE(B1, " World")', type: CellType.Formula },
    'C3': { formula: '=IF(A1>0, "Positive", "Negative")', type: CellType.Formula }
  };

  describe('evaluateFormula', () => {
    it('evaluates basic formulas correctly', () => {
      expect(evaluateFormula('=1+2', {})).toBe(3);
      expect(evaluateFormula('="Hello"', {})).toBe('Hello');
      expect(evaluateFormula('=1+2*3', {})).toBe(7);
    });

    it('evaluates cell references correctly', () => {
      expect(evaluateFormula('=A1', testCells)).toBe(1);
      expect(evaluateFormula('=B1', testCells)).toBe('Hello');
      expect(evaluateFormula('=B2', testCells)).toBe(3);
    });

    it('evaluates functions correctly', () => {
      expect(evaluateFormula('=SUM(A1:A3)', testCells)).toBe(6);
      expect(evaluateFormula('=AVERAGE(A1:A3)', testCells)).toBe(2);
      expect(evaluateFormula('=CONCATENATE(B1, " World")', testCells)).toBe('Hello World');
    });

    it('handles nested formulas correctly', () => {
      expect(evaluateFormula('=SUM(A1:A3) + AVERAGE(A1:A3)', testCells)).toBe(8);
      expect(evaluateFormula('=IF(SUM(A1:A3)>5, "High", "Low")', testCells)).toBe('High');
    });

    it('handles errors correctly', () => {
      expect(evaluateFormula('=1/0', {})).toBe('#DIV/0!');
      expect(evaluateFormula('=UNKNOWN(1,2)', {})).toBe('#ERROR!');
      expect(evaluateFormula('=', {})).toBe('');
    });

    it('detects circular references', () => {
      const circularCells: Record<string, CellData> = {
        'A1': { formula: '=B1', type: CellType.Formula },
        'B1': { formula: '=A1', type: CellType.Formula }
      };
      expect(evaluateFormula('=A1', circularCells)).toBe('#CIRCULAR!');
    });
  });

  describe('parseFormula', () => {
    it('parses basic arithmetic correctly', () => {
      expect(parseFormula('1+2')).toEqual(['1', '+', '2']);
      expect(parseFormula('1+2*3')).toEqual(['1', '+', '2', '*', '3']);
    });

    it('parses functions correctly', () => {
      expect(parseFormula('SUM(A1:A3)')).toEqual(['SUM(A1:A3)']);
      expect(parseFormula('SUM(A1:A3) + 1')).toEqual(['SUM(A1:A3)', '+', '1']);
    });

    it('handles nested functions correctly', () => {
      expect(parseFormula('SUM(A1:A3, AVERAGE(B1:B3))')).toEqual(['SUM(A1:A3, AVERAGE(B1:B3))']);
    });

    it('handles strings correctly', () => {
      expect(parseFormula('"Hello World"')).toEqual(['"Hello World"']);
      expect(parseFormula('"Hello" + " World"')).toEqual(['"Hello"', '+', '" World"']);
    });
  });

  describe('evaluateExpression', () => {
    it('evaluates basic expressions correctly', () => {
      expect(evaluateExpression('1+2', {})).toBe(3);
      expect(evaluateExpression('2*3', {})).toBe(6);
      expect(evaluateExpression('6/2', {})).toBe(3);
    });

    it('evaluates functions correctly', () => {
      expect(evaluateExpression('SUM(1,2,3)', {})).toBe(6);
      expect(evaluateExpression('AVERAGE(1,2,3)', {})).toBe(2);
      expect(evaluateExpression('MAX(1,2,3)', {})).toBe(3);
    });

    it('evaluates cell references correctly', () => {
      expect(evaluateExpression('A1', testCells)).toBe(1);
      expect(evaluateExpression('B1', testCells)).toBe('Hello');
    });

    it('evaluates complex expressions correctly', () => {
      expect(evaluateExpression('SUM(A1:A3) + 1', testCells)).toBe(7);
      expect(evaluateExpression('IF(A1>0, "Yes", "No")', testCells)).toBe('Yes');
    });

    it('handles errors correctly', () => {
      expect(evaluateExpression('1/0', {})).toBe('#DIV/0!');
      expect(evaluateExpression('UNKNOWN()', {})).toBe('#ERROR!');
    });
  });
});
