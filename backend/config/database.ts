import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://analyst_user:analyst_pass@localhost:5432/banking_db',
  statement_timeout: 5000, // 5 second hard cutoff for safe query execution
  connectionTimeoutMillis: 2000,
});