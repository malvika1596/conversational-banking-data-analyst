import { VisualizationConfig } from '../types/analyst';

const DB_SCHEMA_PROMPT = `
Table branches (id, name, city, region, created_at)
Table customers (id, branch_id, full_name, segment, status, created_at)
Table applications (id, customer_id, product_type, status, requested_amount, submitted_at)
Table transactions (id, customer_id, channel, category, type, amount, timestamp)

Rules:
1. Return strictly a JSON object matching this schema:
   {
     "sql": "SELECT ...",
     "summary": "Brief analysis summary",
     "visualization": {
       "type": "bar" | "line" | "kpi" | "table",
       "xAxisKey": "string",
       "yAxisKeys": ["string"],
       "title": "Chart Title",
       "kpiValue": "string/number",
       "kpiLabel": "string"
     }
   }
2. Only write standard ANSI SQL SELECT queries.
3. No Markdown wrappers outside the valid JSON object.
`;

export interface LLMAnalystOutput {
  sql: string;
  summary: string;
  visualization: VisualizationConfig;
}

export class LLMService {
  public async generateQueryAndViz(question: string): Promise<LLMAnalystOutput> {
    // Replace with call to Anthropic, OpenAI, or local model SDK
    // Example structured payload construction
    const systemMessage = DB_SCHEMA_PROMPT;
    const userMessage = `User Question: "${question}"`;

    // Simulated LLM parsed response for demonstration:
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
}