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
 * Check if local development auth bypass is active.
 * STRICT SAFETY CHECK:
 * - NEVER allowed in production or staging environments.
 * - Requires explicit dev bypass flag or development mode dev scripts.
 */
export function isLocalDevAuthBypassEnabled(): boolean {
  const env = process.env.NODE_ENV;
  if (env === "production" || env === "staging") {
    return false;
  }
  return (
    process.env.LOCAL_DEV_BYPASS_AUTH === "true" ||
    process.env.DEV_BYPASS_AUTH === "true" ||
    process.env.FIREBASE_AUTH_LOCAL_DEV_BYPASS === "true"
  );
}

export const DEV_ADMIN_PAYLOAD: AccessTokenPayload = {
  userId: 1,
  sessionId: 1,
  roles: [
    { portal: "store", role: "Admin" },
    { portal: "academy", role: "Admin" },
    { portal: "store", role: "Teacher" },
    { portal: "store", role: "Student" },
    { portal: "academy", role: "Teacher" },
    { portal: "academy", role: "Student" },
  ],
};

/**
 * Middleware to authenticate JWT access token
 * Extracts user information from the token and attaches it to the request
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
      return next();
    }
    res.status(401).json({ success: false, message: 'Authorization header required' });
    return;
  }

  const [bearer, token, extra] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token || extra) {
    if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
      return next();
    }
    res.status(401).json({ success: false, message: 'Invalid authorization format. Use: Bearer <token>' });
    return;
  }

  if (token === 'dev-bypass' || token === 'dev-token' || token === 'local-dev-bypass-token' || token === 'local-dev') {
    if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
      return next();
    }
  }

  let payload: AccessTokenPayload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
      return next();
    }
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }

  if (!payload?.userId || !payload?.sessionId) {
    if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
      return next();
    }
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }

  try {
    const sessionActive = await isRefreshSessionActive(payload.sessionId, payload.userId);

    if (!sessionActive) {
      if (isLocalDevAuthBypassEnabled()) {
        (req as any).user = DEV_ADMIN_PAYLOAD;
        return next();
      }
      res.status(401).json({ success: false, message: 'Session expired' });
      return;
    }

    // Attach user info to request
    (req as any).user = payload;
    next();
  } catch (error) {
    if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
      return next();
    }
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
    if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
    }
    next();
    return;
  }

  const [bearer, token, extra] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token || extra) {
    if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
    }
    next();
    return;
  }

  if (token === 'dev-bypass' || token === 'dev-token' || token === 'local-dev-bypass-token' || token === 'local-dev') {
    if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
    }
    next();
    return;
  }

  let payload: AccessTokenPayload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
    }
    next();
    return;
  }

  if (!payload?.userId || !payload?.sessionId) {
    if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
    }
    next();
    return;
  }

  try {
    if (await isRefreshSessionActive(payload.sessionId, payload.userId)) {
      (req as any).user = payload;
    } else if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
    }
  } catch (error) {
    if (isLocalDevAuthBypassEnabled()) {
      (req as any).user = DEV_ADMIN_PAYLOAD;
      next();
      return;
    }
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
  isLocalDevAuthBypassEnabled,
  DEV_ADMIN_PAYLOAD,
};
