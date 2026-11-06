export class SqlSanitizer {
  private static FORBIDDEN_KEYWORDS = [
    'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE',
    'EXEC', 'EXECUTE', 'GRANT', 'REVOKE', 'UNION', 'INTO', 'PG_SLEEP', 'BENCHMARK'
  ];

  public static validateAndSanitize(sql: string): { isValid: boolean; sanitizedSql: string; reason?: string } {
    const trimmedSql = sql.trim().replace(/;/g, '');

    // 1. Must start with SELECT or WITH (CTE)
    if (!/^(SELECT|WITH)\s/i.test(trimmedSql)) {
      return { isValid: false, sanitizedSql: '', reason: 'Only SELECT statements are permitted.' };
    }

    // 2. Check forbidden SQL keywords
    const upperSql = trimmedSql.toUpperCase();
    for (const keyword of this.FORBIDDEN_KEYWORDS) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(upperSql) && !upperSql.startsWith('WITH')) {
        return { isValid: false, sanitizedSql: '', reason: `Forbidden SQL operation detected: ${keyword}` };
      }
    }

    // 3. Enforce maximum return row limit
    let finalSql = trimmedSql;
    if (!/LIMIT\s+\d+/i.test(finalSql)) {
      finalSql += ' LIMIT 500';
    }

    return { isValid: true, sanitizedSql: finalSql };
  }
}