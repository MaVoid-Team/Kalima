import type { PrismaClient } from "../../../libs/db/prisma";
class CartService {
  constructor(private prisma: PrismaClient) {}

  async create() {}

  async getByUserId(userId: string) {}
}

export default CartService;
