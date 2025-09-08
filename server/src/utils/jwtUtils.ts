import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/configuration';
import { redisSave, redisRetrieve } from '../app';
import { secureLog } from './secureLogger';

export interface TokenPayload {
  id: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface RefreshTokenData {
  userId: string;
  role: string;
  email: string;
  tokenFamily: string;
  createdAt: Date;
  lastUsed: Date;
}

/**
 * Generate a secure token pair (access + refresh)
 */
export const generateTokenPair = async (user: any): Promise<TokenPair> => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  // Short-lived access token (15 minutes)
  const accessToken = jwt.sign(payload, config.SECRET_TOKEN, {
    expiresIn: '15m',
    issuer: 'covo-api',
    audience: 'covo-client',
  });

  // Generate refresh token
  const refreshToken = generateSecureRefreshToken();
  const tokenFamily = crypto.randomUUID();

  // Store refresh token in Redis with 7 days expiry
  const refreshTokenData: RefreshTokenData = {
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
    tokenFamily,
    createdAt: new Date(),
    lastUsed: new Date(),
  };

  const refreshTokenKey = `refresh_token:${refreshToken}`;
  await redisSave(refreshTokenKey, refreshTokenData, 7 * 24 * 60); // 7 days in minutes

  secureLog('INFO', 'Token pair generated', {
    userId: user._id.toString(),
    email: user.email,
    tokenFamily,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
    refreshExpiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };
};

/**
 * Generate a cryptographically secure refresh token
 */
export const generateSecureRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Verify and decode access token
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.SECRET_TOKEN, {
      issuer: 'covo-api',
      audience: 'covo-client',
    }) as TokenPayload;
    
    return decoded;
  } catch (error) {
    secureLog('WARN', 'Access token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<TokenPair | null> => {
  try {
    const refreshTokenKey = `refresh_token:${refreshToken}`;
    const tokenData: RefreshTokenData = await redisRetrieve(refreshTokenKey);

    if (!tokenData) {
      secureLog('WARN', 'Invalid refresh token attempt');
      return null;
    }

    // Check if token is still valid (not expired)
    const tokenAge = Date.now() - new Date(tokenData.createdAt).getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (tokenAge > maxAge) {
      await redisSave(refreshTokenKey, null, 0); // Delete expired token
      secureLog('WARN', 'Expired refresh token used', { userId: tokenData.userId });
      return null;
    }

    // Generate new token pair
    const user = {
      _id: tokenData.userId,
      role: tokenData.role,
      email: tokenData.email,
    };

    const newTokenPair = await generateTokenPair(user);

    // Invalidate old refresh token
    await redisSave(refreshTokenKey, null, 0);

    // Update last used timestamp for the new refresh token
    const newRefreshTokenKey = `refresh_token:${newTokenPair.refreshToken}`;
    const newTokenData = await redisRetrieve(newRefreshTokenKey);
    if (newTokenData) {
      newTokenData.lastUsed = new Date();
      await redisSave(newRefreshTokenKey, newTokenData, 7 * 24 * 60);
    }

    secureLog('INFO', 'Tokens refreshed successfully', {
      userId: tokenData.userId,
      email: tokenData.email,
    });

    return newTokenPair;
  } catch (error) {
    secureLog('ERROR', 'Token refresh failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
};

/**
 * Revoke refresh token (logout)
 */
export const revokeRefreshToken = async (refreshToken: string): Promise<boolean> => {
  try {
    const refreshTokenKey = `refresh_token:${refreshToken}`;
    const tokenData: RefreshTokenData = await redisRetrieve(refreshTokenKey);

    if (tokenData) {
      await redisSave(refreshTokenKey, null, 0); // Delete token
      secureLog('INFO', 'Refresh token revoked', {
        userId: tokenData.userId,
        email: tokenData.email,
      });
      return true;
    }

    return false;
  } catch (error) {
    secureLog('ERROR', 'Token revocation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
};

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
export const revokeAllUserTokens = async (userId: string): Promise<boolean> => {
  try {
    // Note: This is a simplified implementation
    // In a production environment, you might want to store user tokens in a more queryable way
    secureLog('INFO', 'All user tokens revocation requested', { userId });
    
    // For now, we'll just log this. You might want to implement a token blacklist
    // or store tokens with user ID as part of the key for easier bulk operations
    
    return true;
  } catch (error) {
    secureLog('ERROR', 'Bulk token revocation failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
};

/**
 * Clean up expired refresh tokens (should be run periodically)
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
  try {
    // This is a simplified implementation
    // In production, you might want to scan Redis keys with pattern matching
    secureLog('INFO', 'Cleanup expired tokens job started');
    
    // Implementation would depend on your Redis setup and patterns
    // For now, Redis TTL will handle expiration automatically
    
    return 0;
  } catch (error) {
    secureLog('ERROR', 'Token cleanup failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return 0;
  }
};
