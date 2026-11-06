export type ChartType = 'bar' | 'line' | 'kpi' | 'table' | 'none';

export interface ColumnMetadata {
  name: string;
  type: string;
}

export interface VisualizationConfig {
  type: ChartType;
  xAxisKey?: string;
  yAxisKeys?: string[];
  title?: string;
  kpiValue?: string | number;
  kpiLabel?: string;
}

export interface QueryResultResponse {
  queryId: string;
  userQuestion: string;
  generatedSql: string;
  summary: string;
  columns: ColumnMetadata[];
  rows: Record<string, unknown>[];
  visualization: VisualizationConfig;
  executionTimeMs: number;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  suggestedAction?: string;
}