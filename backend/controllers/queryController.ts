import { Request, Response } from 'express';
import { LLMService } from '../services/llmService';
import { SqlSanitizer } from '../services/sqlSanitizer';
import { db } from '../config/database'; // Database connection instance

const llmService = new LLMService();

export async function handleAnalystQuery(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'Valid string prompt question is required.' });
    return;
  }

  try {
    // 1. Generate query from LLM
    const llmOutput = await llmService.generateQueryAndViz(question);

    // 2. Validate & Sanitize SQL
    const guardrailCheck = SqlSanitizer.validateAndSanitize(llmOutput.sql);
    if (!guardrailCheck.isValid) {
      res.status(422).json({
        error: 'Generated SQL violates security guardrails.',
        details: guardrailCheck.reason
      });
      return;
    }

    // 3. Execute safe query
    const dbResult = await db.query(guardrailCheck.sanitizedSql);

    // 4. Extract schema metadata
    const columns = dbResult.fields ? dbResult.fields.map(f => ({ name: f.name, type: f.dataTypeID.toString() })) : [];

    res.json({
      queryId: crypto.randomUUID(),
      userQuestion: question,
      generatedSql: guardrailCheck.sanitizedSql,
      summary: llmOutput.summary,
      columns,
      rows: dbResult.rows,
      visualization: llmOutput.visualization,
      executionTimeMs: Date.now() - startTime
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
    res.status(500).json({
      error: 'Failed to process natural language database query.',
      details: errorMessage
    });
  }
}