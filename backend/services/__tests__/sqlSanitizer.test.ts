import test from 'node:test';
import assert from 'node:assert';
import { SqlSanitizer } from '../sqlSanitizer';

test('SqlSanitizer blocks destructive DROP statements', () => {
  const query = 'DROP TABLE customers;';
  const result = SqlSanitizer.validateAndSanitize(query);
  
  assert.strictEqual(result.isValid, false);
  assert.ok(result.reason?.includes('Forbidden keyword'));
});

test('SqlSanitizer blocks unauthorized INSERT statements', () => {
  const query = "INSERT INTO applications (status) VALUES ('APPROVED');";
  const result = SqlSanitizer.validateAndSanitize(query);
  
  assert.strictEqual(result.isValid, false);
});

test('SqlSanitizer allows valid read-only SELECT queries and appends LIMIT', () => {
  const query = 'SELECT * FROM branches;';
  const result = SqlSanitizer.validateAndSanitize(query);
  
  assert.strictEqual(result.isValid, true);
  assert.ok(result.sanitizedSql.includes('LIMIT'));
});