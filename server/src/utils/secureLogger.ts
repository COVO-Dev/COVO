/**
 * Secure logging utilities to prevent sensitive data exposure
 */

/**
 * Masks sensitive data in tokens for safe logging
 * @param token - The token to mask
 * @param visibleChars - Number of characters to show at start and end (default: 6)
 * @returns Masked token string
 */
export const maskToken = (token: string, visibleChars: number = 6): string => {
  if (!token || token.length <= visibleChars * 2) {
    return '***REDACTED***';
  }
  
  const start = token.substring(0, visibleChars);
  const end = token.substring(token.length - visibleChars);
  const middle = '*'.repeat(Math.min(10, token.length - visibleChars * 2));
  
  return `${start}${middle}${end}`;
};

/**
 * Masks email addresses for logging
 * @param email - Email to mask
 * @returns Masked email
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) {
    return '***REDACTED***';
  }
  
  const [username, domain] = email.split('@');
  const maskedUsername = username.length > 2 
    ? `${username[0]}***${username[username.length - 1]}`
    : '***';
  
  return `${maskedUsername}@${domain}`;
};

/**
 * Safely logs authentication events without exposing sensitive data
 * @param event - The event type
 * @param data - Event data to log
 */
export const logAuthEvent = (event: string, data: any): void => {
  const safeData = {
    ...data,
    token: data.token ? maskToken(data.token) : undefined,
    access_token: data.access_token ? maskToken(data.access_token) : undefined,
    refresh_token: data.refresh_token ? maskToken(data.refresh_token) : undefined,
    email: data.email ? maskEmail(data.email) : undefined,
    password: data.password ? '***REDACTED***' : undefined,
  };
  
  console.log(`[AUTH ${event}]`, safeData);
};

/**
 * Safely logs user data without sensitive information
 * @param action - The action being performed
 * @param user - User object
 */
export const logUserAction = (action: string, user: any): void => {
  const safeUser = {
    id: user._id || user.id,
    email: user.email ? maskEmail(user.email) : undefined,
    role: user.role,
    isVerified: user.isVerified,
    firstName: user.firstName,
    lastName: user.lastName,
  };
  
  console.log(`[USER ${action}]`, safeUser);
};

/**
 * General secure logger that removes common sensitive fields
 * @param level - Log level
 * @param message - Log message
 * @param data - Data to log
 */
export const secureLog = (level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, data?: any): void => {
  if (!data) {
    console.log(`[${level}] ${message}`);
    return;
  }
  
  const sanitizedData = sanitizeLogData(data);
  console.log(`[${level}] ${message}`, sanitizedData);
};

/**
 * Recursively sanitizes data for logging
 * @param data - Data to sanitize
 * @returns Sanitized data
 */
const sanitizeLogData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }
  
  const sensitiveFields = [
    'password', 'token', 'access_token', 'refresh_token', 'secret', 'key',
    'authorization', 'cookie', 'session', 'credentials', 'auth'
  ];
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '***REDACTED***';
    } else if (lowerKey === 'email' && typeof value === 'string') {
      sanitized[key] = maskEmail(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
