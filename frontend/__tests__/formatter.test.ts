import { describe, it, expect } from 'vitest';

// Utility helper tested from frontend logic
const formatColumnHeader = (colName: string): string => {
  return colName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

describe('Column Header Formatter', () => {
  it('converts snake_case database column to title case', () => {
    expect(formatColumnHeader('application_count')).toBe('Application Count');
    expect(formatColumnHeader('branch_name')).toBe('Branch Name');
    expect(formatColumnHeader('id')).toBe('Id');
  });
});