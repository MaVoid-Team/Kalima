import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../libs/db/prisma";
import { role_enum } from "../generated/prisma/client";

export const adminUserStatsController = {
  /**
   * GET /admin/users/stats/created-accounts
   * Replicates legacy Created Accounts Statistics
   * Calculates how many accounts of each role were created by each user.
   */
  async getCreatedAccountsStats(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      // Find all users who have created other accounts
      // To replicate legacy, we just count the 'created_users' grouped by 'created_by' and 'role'
      
      const stats = await prisma.users.groupBy({
        by: ['created_by', 'role'],
        _count: {
          id: true,
        },
        where: {
          created_by: {
            not: null,
          }
        },
      });

      // Fetch the details of the creator users
      const creatorIds = Array.from(new Set(stats.map(s => s.created_by).filter(id => id !== null))) as number[];
      
      const creators = await prisma.users.findMany({
        where: { id: { in: creatorIds } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      const creatorMap = new Map();
      creators.forEach(c => creatorMap.set(c.id, c));

      // Aggregate data per creator
      const result: any[] = [];
      const statsByCreator = new Map<number, any>();

      stats.forEach((stat) => {
        const creatorId = stat.created_by as number;
        if (!statsByCreator.has(creatorId)) {
          const creatorInfo = creatorMap.get(creatorId);
          statsByCreator.set(creatorId, {
            user: creatorInfo ? {
              id: creatorInfo.id,
              name: creatorInfo.name,
              email: creatorInfo.email,
              role: creatorInfo.role,
            } : { id: creatorId, name: 'Unknown' },
            byRole: {
              Admin: 0,
              SubAdmin: 0,
              Moderator: 0,
              Teacher: 0,
              Student: 0,
              Parent: 0,
              Lecturer: 0,
              Assistant: 0,
            },
            totalAccounts: 0,
          });
        }

        const creatorData = statsByCreator.get(creatorId);
        creatorData.byRole[stat.role] = stat._count.id;
        creatorData.totalAccounts += stat._count.id;
      });

      // Filter out roles with 0 value or format as requested
      for (const [_, data] of statsByCreator.entries()) {
        result.push(data);
      }

      // Sort by absolute highest totals
      result.sort((a, b) => b.totalAccounts - a.totalAccounts);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      _next(error);
    }
  }
};
