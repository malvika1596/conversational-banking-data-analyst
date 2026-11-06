import Database from 'better-sqlite3';
import path from 'path';

// Creates a local file named banking.db in your project root
const dbPath = path.resolve(__dirname, '../../banking.db');

export const db = new Database(dbPath, { verbose: console.log });

// Enable Write-Ahead Logging and foreign key constraints for SQLite safety
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');