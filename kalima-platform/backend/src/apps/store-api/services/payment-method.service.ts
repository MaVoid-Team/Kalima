import { payment_methods, Prisma } from "../generated/prisma/client";
import { NotFoundError, BadRequestError } from "../../../libs/errors";
import { prisma } from "../../../libs/db/prisma";

export const paymentMethodService = {
  /**
   * List all payment methods
   */
  async listPaymentMethods(filters?: { status?: boolean; search?: string }): Promise<payment_methods[]> {
    const where: Prisma.payment_methodsWhereInput = {};

    if (filters?.status !== undefined) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.name = { contains: filters.search, mode: "insensitive" };
    }

    return prisma.payment_methods.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        images: true
      }
    });
  },

  /**
   * Get a single payment method by ID
   */
  async getPaymentMethodById(id: number): Promise<payment_methods> {
    const paymentMethod = await prisma.payment_methods.findUnique({
      where: { id },
      include: {
        images: true
      }
    });

    if (!paymentMethod) {
      throw new NotFoundError(`Payment method with ID ${id} not found.`);
    }

    return paymentMethod;
  },

  /**
   * Create a new payment method
   */
  async createPaymentMethod(data: { name: string; phone_number: string; status?: boolean; image_id?: number }): Promise<payment_methods> {
    if (data.image_id) {
      const imageExists = await prisma.images.findUnique({ where: { id: data.image_id } });
      if (!imageExists) {
        throw new BadRequestError(`Image with ID ${data.image_id} not found.`);
      }
    }

    return prisma.payment_methods.create({
      data: {
        name: data.name,
        phone_number: data.phone_number,
        status: data.status !== undefined ? data.status : true,
        image_id: data.image_id,
      },
      include: {
        images: true
      }
    });
  },

  /**
   * Update an existing payment method
   */
  async updatePaymentMethod(id: number, data: { name?: string; phone_number?: string; status?: boolean; image_id?: number }): Promise<payment_methods> {
    const existing = await prisma.payment_methods.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Payment method with ID ${id} not found.`);
    }

    if (data.image_id) {
      const imageExists = await prisma.images.findUnique({ where: { id: data.image_id } });
      if (!imageExists) {
        throw new BadRequestError(`Image with ID ${data.image_id} not found.`);
      }
    }

    return prisma.payment_methods.update({
      where: { id },
      data,
      include: {
        images: true
      }
    });
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(id: number): Promise<void> {
    const existing = await prisma.payment_methods.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Payment method with ID ${id} not found.`);
    }

    // Rather than hard delete, typically we soft delete or ensure no relations are broken.
    // However, schema indicates on_delete: SetNull for relations, so we can delete.
    await prisma.payment_methods.delete({
      where: { id },
    });
  }
};
