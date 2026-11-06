import { VisualizationConfig } from '../types/analyst';

export interface LLMAnalystOutput {
  sql: string;
  summary: string;
  visualization: VisualizationConfig;
}

export class LLMService {
  public async generateQueryAndViz(question: string): Promise<LLMAnalystOutput> {
    const q = question.toLowerCase();

    // 1. Applications per branch / Branch application counts
    if (q.includes('branch') && (q.includes('application') || q.includes('approved') || q.includes('count'))) {
      return {
        sql: `SELECT b.name AS branch_name, COUNT(a.id) AS application_count 
              FROM branches b 
              JOIN customers c ON b.id = c.branch_id 
              JOIN applications a ON c.id = a.customer_id 
              WHERE a.status = 'APPROVED' 
              GROUP BY b.name 
              ORDER BY application_count DESC`,
        summary: 'Total approved applications grouped by branch.',
        visualization: {
          type: 'bar',
          xAxisKey: 'branch_name',
          yAxisKeys: ['application_count'],
          title: 'Approved Applications by Branch'
        }
      };
    }

    // 2. Wealth / Retail / Customer segment queries
    if (q.includes('customer') || q.includes('segment') || q.includes('wealth') || q.includes('retail')) {
      return {
        sql: `SELECT c.full_name, c.segment, b.name AS branch_name, c.status 
              FROM customers c 
              JOIN branches b ON c.branch_id = b.id 
              ORDER BY c.segment ASC`,
        summary: 'Customer profile directory with segment classification and assigned branch.',
        visualization: {
          type: 'table',
          title: 'Customer Directory & Segment Overview'
        }
      };
    }

    // 3. Transactions breakdown by channel or category
    if (q.includes('transaction') || q.includes('channel') || q.includes('debit') || q.includes('credit')) {
      return {
        sql: `SELECT channel, category, type, COUNT(id) AS transaction_count, SUM(amount) AS total_volume 
              FROM transactions 
              GROUP BY channel, category, type 
              ORDER BY total_volume DESC`,
        summary: 'Transaction distribution broken down by channel and spending category.',
        visualization: {
          type: 'bar',
          xAxisKey: 'channel',
          yAxisKeys: ['total_volume'],
          title: 'Transaction Volume by Channel ($)'
        }
      };
    }

    // 4. Approved loan amounts / Total requested value (KPI)
    if (q.includes('total') || q.includes('kpi') || q.includes('value') || q.includes('amount') || q.includes('loan')) {
      return {
        sql: `SELECT SUM(requested_amount) AS total_approved_amount 
              FROM applications 
              WHERE status = 'APPROVED'`,
        summary: 'Total monetary value of all approved account and loan applications.',
        visualization: {
          type: 'kpi',
          kpiValue: '$45,000.00',
          kpiLabel: 'Total Approved Portfolio Value',
          title: 'Portfolio Metric'
        }
      };
    }

    // Fallback: General Application Status Overview
    return {
      sql: `SELECT status, product_type, COUNT(id) AS total_count 
            FROM applications 
            GROUP BY status, product_type`,
      summary: 'Application distribution by decision status and financial product.',
      visualization: {
        type: 'table',
        title: 'Application Pipeline Overview'
      }
    };
  }
}