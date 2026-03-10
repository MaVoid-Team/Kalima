import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../libs/db/prisma";
import { UnauthorizedError, ForbiddenError } from "../../../libs/errors";

/**
 * Middleware that blocks unconfirmed users from purchases.
 * Must be used AFTER authenticateToken.
 * Fetches the user's confirmed status from the database.
 */
export async function requireConfirmed(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const user = (req as any).user;

  if (!user?.userId) {
    return next(new UnauthorizedError());
  }

  const dbUser = await prisma.users.findUnique({
    where: { id: user.userId },
    select: { confirmed: true },
  });

  if (!dbUser) {
    return next(new UnauthorizedError());
  }

  if (dbUser.confirmed !== true) {
    return next(
      new ForbiddenError(
        "Your account is pending admin review. You cannot complete purchases until approved.",
      ),
    );
  }

  next();
}
