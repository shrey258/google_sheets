import {
  columnToIndex,
  indexToColumn,
  findCellReferences,
  hasCircularReference
} from '../helpers';
import { CellData, CellType } from '../../types';

describe('Helper Functions', () => {
  describe('columnToIndex', () => {
    it('converts column letters to indices correctly', () => {
      expect(columnToIndex('A')).toBe(0);
      expect(columnToIndex('B')).toBe(1);
      expect(columnToIndex('Z')).toBe(25);
      expect(columnToIndex('AA')).toBe(26);
      expect(columnToIndex('AB')).toBe(27);
      expect(columnToIndex('ZZ')).toBe(701);
    });
  });

  describe('indexToColumn', () => {
    it('converts indices to column letters correctly', () => {
      expect(indexToColumn(0)).toBe('A');
      expect(indexToColumn(1)).toBe('B');
      expect(indexToColumn(25)).toBe('Z');
      expect(indexToColumn(26)).toBe('AA');
      expect(indexToColumn(27)).toBe('AB');
      expect(indexToColumn(701)).toBe('ZZ');
    });
  });

  describe('findCellReferences', () => {
    it('finds cell references in formulas', () => {
      expect(findCellReferences('=A1')).toEqual(['A1']);
      expect(findCellReferences('=SUM(A1:B2)')).toEqual(['A1', 'B2']);
      expect(findCellReferences('=A1+B2*C3')).toEqual(['A1', 'B2', 'C3']);
      expect(findCellReferences('="No refs"')).toEqual([]);
    });

    it('handles absolute references', () => {
      expect(findCellReferences('=$A$1')).toEqual(['$A$1']);
      expect(findCellReferences('=$A1+B$2')).toEqual(['$A1', 'B$2']);
    });
  });

  describe('hasCircularReference', () => {
    const cells: Record<string, CellData> = {
      'A1': { formula: '=B1', type: CellType.Formula },
      'B1': { formula: '=C1', type: CellType.Formula },
      'C1': { formula: '=A1', type: CellType.Formula },
      'D1': { formula: '=E1', type: CellType.Formula },
      'E1': { value: '5', type: CellType.Number }
    };

    it('detects direct circular references', () => {
      expect(hasCircularReference(['A1'], cells)).toBe(true);
      expect(hasCircularReference(['B1'], cells)).toBe(true);
      expect(hasCircularReference(['C1'], cells)).toBe(true);
    });

    it('handles non-circular references', () => {
      expect(hasCircularReference(['D1'], cells)).toBe(false);
      expect(hasCircularReference(['E1'], cells)).toBe(false);
    });

    it('handles multiple references', () => {
      expect(hasCircularReference(['A1', 'D1'], cells)).toBe(true);
      expect(hasCircularReference(['D1', 'E1'], cells)).toBe(false);
    });
  });
});
