import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from './jwt';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT access token
 * Extracts user information from the token and attaches it to the request
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ success: false, message: 'Authorization header required' });
    return;
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    res.status(401).json({ success: false, message: 'Invalid authorization format. Use: Bearer <token>' });
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    // Attach user info to request
    (req as any).user = payload;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Middleware to optionally authenticate JWT access token
 * If token is present and valid, attaches user to request
 * If token is missing or invalid, continues without user
 */
export function optionalAuthenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    if (payload) {
      (req as any).user = payload;
    }
  } catch {
    // Ignore errors for optional auth
  }

  next();
}

/**
 * Middleware to require email verification
 * Must be used after authenticateToken
 */
export function requireEmailVerification(req: Request, res: Response, next: NextFunction): void {
  // This would need to check the database for email verification status
  // For now, we'll just pass through - implement when needed
  next();
}

export default {
  authenticateToken,
  optionalAuthenticateToken,
  requireEmailVerification,
};
