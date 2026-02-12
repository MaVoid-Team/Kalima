import { PrismaClient } from "@prisma/client";
class CartService {
  constructor(private prisma: PrismaClient) {}

  async create() {}

  async getByUserId(userId: string) {}
}

export default CartService;
