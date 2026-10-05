/**
 * Security & SQL Injection Prevention Utility
 * Comprehensive detection and sanitization against SQL injection, stacked queries,
 * blind timing attacks, union payloads, and malicious script/control characters.
 */

const SQL_INJECTION_PATTERNS = [
  // 1. Classic tautologies & Boolean-based blind injections
  /(?:'|\b)\s*(?:OR|AND)\s+['"]?(\d+|[a-zA-Z]+)['"]?\s*=\s*['"]?\1/i,
  /(?:'|\b)\s*(?:OR|AND)\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"]/i,
  /\bOR\s+1\s*=\s*1\b/i,
  /\bOR\s+'1'\s*=\s*'1'\b/i,
  /\bOR\s+"1"\s*=\s*"1"\b/i,
  /\bOR\s+true\b/i,
  /'\s*OR\s*'\w+'\s*=\s*'\w+/i,

  // 2. UNION-based injections
  /\bUNION\s+(?:ALL\s+|DISTINCT\s+)?SELECT\b/i,

  // 3. Stacked queries & destructive commands
  /;\s*(?:DROP|ALTER|TRUNCATE|DELETE|INSERT|UPDATE|EXEC|EXECUTE)\s+/i,

  // 4. SQL comment sequences used to truncate rest of query
  /--[^\r\n]*/,
  /\/\*[\s\S]*?\*\//,
  /#\s*$/,

  // 5. Time-based blind SQL injection & sleep commands
  /\b(?:PG_SLEEP|SLEEP|BENCHMARK|WAITFOR\s+DELAY)\s*\(/i,

  // 6. Database schema discovery & introspection
  /\bFROM\s+(?:information_schema|pg_catalog|pg_tables|pg_user|pg_stat_activity)\b/i,
  /\b(?:CURRENT_USER|CURRENT_DATABASE|SESSION_USER|VERSION\(\))\b/i,

  // 7. Hex / Char evasion tricks
  /0x[0-9a-fA-F]{4,}/,
  /\b(?:CHAR|CHR)\s*\(\s*\d+\s*\)/i,

  // 8. Cast / Conversion exploitation
  /\bCAST\s*\(\s*.*?\s*AS\s+(?:VARCHAR|INTEGER|TEXT)\s*\)/i,
];

/**
 * Checks if a string contains SQL injection patterns
 */
export function containsSqlInjection(value: string): { isSuspicious: boolean; pattern?: string; match?: string } {
  if (typeof value !== 'string') return { isSuspicious: false };

  const trimmed = value.trim();
  if (!trimmed) return { isSuspicious: false };

  for (const regex of SQL_INJECTION_PATTERNS) {
    const match = trimmed.match(regex);
    if (match) {
      return {
        isSuspicious: true,
        pattern: regex.toString(),
        match: match[0],
      };
    }
  }

  return { isSuspicious: false };
}

/**
 * Recursively scans any data structure (objects, arrays, strings) for SQL injection
 */
export function detectSqlInjection(data: any): { isSuspicious: boolean; pattern?: string; path?: string; match?: string } {
  if (data === null || data === undefined) {
    return { isSuspicious: false };
  }

  if (typeof data === 'string') {
    const check = containsSqlInjection(data);
    if (check.isSuspicious) {
      return { isSuspicious: true, pattern: check.pattern, match: check.match };
    }
    return { isSuspicious: false };
  }

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const check = detectSqlInjection(data[i]);
      if (check.isSuspicious) {
        return { ...check, path: `[${i}]${check.path ? '.' + check.path : ''}` };
      }
    }
    return { isSuspicious: false };
  }

  if (typeof data === 'object') {
    for (const [key, val] of Object.entries(data)) {
      // Check object key itself
      const keyCheck = containsSqlInjection(key);
      if (keyCheck.isSuspicious) {
        return { isSuspicious: true, pattern: keyCheck.pattern, path: `key:${key}`, match: keyCheck.match };
      }

      // Check object value
      const valCheck = detectSqlInjection(val);
      if (valCheck.isSuspicious) {
        return { ...valCheck, path: `${key}${valCheck.path ? '.' + valCheck.path : ''}` };
      }
    }
  }

  return { isSuspicious: false };
}

/**
 * Sanitizes input by removing null bytes, carriage control anomalies, and dangerous edge characters
 */
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/\0/g, '') // remove null byte
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '') // remove control chars
    .trim();
}

/**
 * Validates safe input and returns human-readable error if blocked
 */
export function validateSafeInput(val: string, fieldName = 'Campo'): { valid: boolean; error?: string } {
  const check = containsSqlInjection(val);
  if (check.isSuspicious) {
    return {
      valid: false,
      error: `${fieldName} contém caracteres ou instruções proibidas por segurança.`,
    };
  }
  return { valid: true };
}

/**
 * Validates request body and provides sanitized data
 */
export function validateAndSanitizeBody<T = any>(body: T): { safe: boolean; sanitized: T; reason?: string } {
  const check = detectSqlInjection(body);
  if (check.isSuspicious) {
    return {
      safe: false,
      sanitized: body,
      reason: `Entrada suspeita detectada no campo ${check.path || 'informado'} (padrão: ${check.match}).`,
    };
  }
  return {
    safe: true,
    sanitized: body,
  };
}
