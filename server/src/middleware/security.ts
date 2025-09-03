import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwtUtils';
import { secureLog } from '../utils/secureLogger';

/**
 * Simple rate limiting using in-memory store
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Basic rate limiting middleware
 */
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip}:${req.method}:${req.route?.path || req.url}`;
    const now = Date.now();
    
    // Clean up expired entries
    for (const [k, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
    
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
      return next();
    }
    
    if (entry.count >= max) {
      secureLog('WARN', 'Rate limit exceeded', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        count: entry.count,
      });
      
      res.status(429).json({
        success: false,
        status: 429,
        message: message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }
    
    entry.count++;
    next();
  };
};

/**
 * General rate limit (100 requests per 15 minutes)
 */
export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100,
  'Too many requests from this IP'
);

/**
 * Auth rate limit (5 login attempts per 15 minutes)
 */
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many authentication attempts, please try again later'
);

/**
 * Strict rate limit for sensitive operations (3 requests per hour)
 */
export const strictRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3,
  'Rate limit exceeded for sensitive operation'
);

/**
 * Basic security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:; frame-src 'none'; object-src 'none';"
  );
  
  // HSTS (only for HTTPS)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * JWT Authentication middleware
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    secureLog('WARN', 'Missing authentication token', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    res.status(401).json({
      success: false,
      status: 401,
      message: 'Access token required',
    });
    return;
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    secureLog('WARN', 'Invalid authentication token', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    res.status(403).json({
      success: false,
      status: 403,
      message: 'Invalid or expired token',
    });
    return;
  }

  // Add user info to request
  (req as any).user = decoded;
  next();
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        status: 401,
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(user.role)) {
      secureLog('WARN', 'Unauthorized access attempt', {
        userId: user.id,
        requiredRoles: roles,
        userRole: user.role,
        url: req.url,
        method: req.method,
        ip: req.ip,
      });
      
      res.status(403).json({
        success: false,
        status: 403,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

/**
 * Security logging middleware
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const user = (req as any).user;
    
    // Log suspicious activity
    if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 429) {
      secureLog('WARN', 'Security event', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: user?.id,
        duration,
      });
    }
    
    // Log successful auth events (but not every request to avoid spam)
    if (req.url.includes('/auth/') && res.statusCode === 200) {
      secureLog('INFO', 'Auth success', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userId: user?.id,
        duration,
      });
    }
  });
  
  next();
};

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Basic XSS prevention - remove script tags and dangerous patterns
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim();
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };
  
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        secureLog('WARN', 'Request timeout', {
          method: req.method,
          url: req.url,
          ip: req.ip,
          timeout: timeoutMs,
        });
        
        res.status(408).json({
          success: false,
          status: 408,
          message: 'Request timeout',
        });
      }
    }, timeoutMs);
    
    res.on('finish', () => {
      clearTimeout(timeout);
    });
    
    next();
  };
};

/**
 * CORS configuration
 */
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://covo.co.za',
      'https://covo.co.za',
      process.env.CORS_ORIGIN,
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      secureLog('WARN', 'CORS origin rejected', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
  ],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400, // 24 hours
};
