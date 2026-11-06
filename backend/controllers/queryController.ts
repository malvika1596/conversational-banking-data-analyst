import { Request, Response } from 'express';
import { LLMService } from '../services/llmService';
import { SqlSanitizer } from '../services/sqlSanitizer';
import { db } from '../config/database';

const llmService = new LLMService();

export async function handleAnalystQuery(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'Valid string prompt question is required.' });
    return;
  }

  try {
    // 1. Generate query strategy
    const llmOutput = await llmService.generateQueryAndViz(question);

    // 2. Validate & Sanitize SQL
    const guardrailCheck = SqlSanitizer.validateAndSanitize(llmOutput.sql);
    if (!guardrailCheck.isValid) {
      res.status(422).json({
        error: 'Generated query violates security guardrails.',
        details: guardrailCheck.reason
      });
      return;
    }

    // 3. Execute query safely against SQLite
    const stmt = db.prepare(guardrailCheck.sanitizedSql);
    const rows = stmt.all() as Record<string, unknown>[];

    // 4. Build column schema metadata
    const columns = rows.length > 0 
      ? Object.keys(rows[0]).map((name) => ({ name, type: 'TEXT' })) 
      : [];

    // Format final KPI value if rows contain aggregated numeric totals
    let vizConfig = { ...llmOutput.visualization };
    if (vizConfig.type === 'kpi' && rows.length > 0) {
      const firstVal = Object.values(rows[0])[0];
      if (typeof firstVal === 'number') {
        vizConfig.kpiValue = `$${firstVal.toLocaleString()}`;
      }
    }

    res.status(200).json({
      queryId: crypto.randomUUID(),
      userQuestion: question,
      generatedSql: guardrailCheck.sanitizedSql,
      summary: llmOutput.summary,
      columns,
      rows,
      visualization: vizConfig,
      executionTimeMs: Date.now() - startTime
    });
  } catch (err: any) {
    console.error('Backend execution error:', err);
    res.status(500).json({
      error: 'Failed to execute query.',
      details: err?.message || 'Internal database error.'
    });
  }
}