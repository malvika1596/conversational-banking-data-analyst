import { db } from '../config/database.ts';

async function seedDatabase() {
  console.log('Seeding banking datasets...');
  try {
    await db.query(`
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS applications;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS branches;

      CREATE TABLE branches (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        city VARCHAR(50) NOT NULL,
        region VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE customers (
        id VARCHAR(50) PRIMARY KEY,
        branch_id VARCHAR(50) REFERENCES branches(id),
        full_name VARCHAR(100) NOT NULL,
        segment VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE applications (
        id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(50) REFERENCES customers(id),
        product_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        requested_amount NUMERIC(15,2),
        submitted_at TIMESTAMP NOT NULL
      );

      CREATE TABLE transactions (
        id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(50) REFERENCES customers(id),
        channel VARCHAR(30) NOT NULL,
        category VARCHAR(50) NOT NULL,
        type VARCHAR(10) NOT NULL,
        amount NUMERIC(15,2) NOT NULL,
        timestamp TIMESTAMP NOT NULL
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
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Failed to seed database:', error);
  } finally {
    await db.end();
  }
}

seedDatabase();