import { Request, Response, NextFunction } from 'express';
import { isRefreshSessionActive, verifyAccessToken, AccessTokenPayload } from './jwt';

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
export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ success: false, message: 'Authorization header required' });
    return;
  }

  const [bearer, token, extra] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token || extra) {
    res.status(401).json({ success: false, message: 'Invalid authorization format. Use: Bearer <token>' });
    return;
  }

  let payload: AccessTokenPayload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }

  if (!payload?.userId || !payload?.sessionId) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }

  try {
    const sessionActive = await isRefreshSessionActive(payload.sessionId, payload.userId);

    if (!sessionActive) {
      res.status(401).json({ success: false, message: 'Session expired' });
      return;
    }

    // Attach user info to request
    (req as any).user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to optionally authenticate JWT access token
 * If token is present and valid, attaches user to request
 * If token is missing or invalid, continues without user
 */
export async function optionalAuthenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  const [bearer, token, extra] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token || extra) {
    next();
    return;
  }

  let payload: AccessTokenPayload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    next();
    return;
  }

  if (!payload?.userId || !payload?.sessionId) {
    next();
    return;
  }

  try {
    if (await isRefreshSessionActive(payload.sessionId, payload.userId)) {
      (req as any).user = payload;
    }
  } catch (error) {
    next(error);
    return;
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
