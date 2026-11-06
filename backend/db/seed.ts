import { db } from '../config/database';

function seedDatabase() {
  console.log('Seeding SQLite banking database...');
  try {
    db.exec(`
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS applications;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS branches;

      CREATE TABLE branches (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        region TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE customers (
        id TEXT PRIMARY KEY,
        branch_id TEXT REFERENCES branches(id),
        full_name TEXT NOT NULL,
        segment TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE applications (
        id TEXT PRIMARY KEY,
        customer_id TEXT REFERENCES customers(id),
        product_type TEXT NOT NULL,
        status TEXT NOT NULL,
        requested_amount REAL,
        submitted_at TEXT NOT NULL
      );

      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        customer_id TEXT REFERENCES customers(id),
        channel TEXT NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        timestamp TEXT NOT NULL
      );

      INSERT INTO branches (id, name, city, region) VALUES
        ('b1', 'Downtown Central', 'New York', 'East'),
        ('b2', 'Metro Square', 'Chicago', 'Midwest'),
        ('b3', 'Silicon Hub', 'San Francisco', 'West');

      INSERT INTO customers (id, branch_id, full_name, segment) VALUES
        ('c1', 'b1', 'Alice Vance', 'Wealth'),
        ('c2', 'b1', 'Bob Miller', 'Retail'),
        ('c3', 'b2', 'Charlie Cox', 'Business'),
        ('c4', 'b3', 'Diana Prince', 'Wealth');

      INSERT INTO applications (id, customer_id, product_type, status, requested_amount, submitted_at) VALUES
        ('app1', 'c1', 'Personal Loan', 'APPROVED', 25000.00, '2024-01-15 10:30:00'),
        ('app2', 'c2', 'Credit Card', 'APPROVED', 5000.00, '2024-02-01 14:20:00'),
        ('app3', 'c3', 'Savings Account', 'REJECTED', 100000.00, '2024-02-10 09:15:00'),
        ('app4', 'c4', 'Credit Card', 'APPROVED', 15000.00, '2024-03-05 16:45:00');

      INSERT INTO transactions (id, customer_id, channel, category, type, amount, timestamp) VALUES
        ('t1', 'c1', 'Mobile Banking', 'Wire Transfer', 'DEBIT', 1200.00, '2024-03-01 08:00:00'),
        ('t2', 'c1', 'ATM', 'Withdrawal', 'DEBIT', 200.00, '2024-03-02 11:30:00'),
        ('t3', 'c2', 'POS', 'Groceries', 'DEBIT', 145.50, '2024-03-02 18:15:00'),
        ('t4', 'c4', 'Wire Transfer', 'Salary', 'CREDIT', 8500.00, '2024-03-03 09:00:00');
    `);
    console.log('SQLite database seeded successfully.');
  } catch (error) {
    console.error('Failed to seed SQLite database:', error);
  }
}

seedDatabase();