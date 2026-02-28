import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../../libs/errors";
import type { CreateReviewDto, UpdateReviewDto } from "../dtos/review.dto";

const REVIEW_INCLUDE = {
  users: {
    select: {
      id: true,
      name: true,
    },
  },
};

class ReviewService {
  constructor(private db: PrismaClient = prisma) {}

  async hasConfirmedPurchaseForProduct(
    userId: number,
    productId: number,
  ): Promise<boolean> {
    const count = await this.db.purchases.count({
      where: {
        user_id: userId,
        status: "confirmed",
        deleted_at: null,
        purchase_items: {
          some: {
            product_id: productId,
            deleted_at: null,
          },
        },
      },
    });
    return count > 0;
  }

  async getAggregatedRating(productId: number): Promise<{
    averageRating: number | null;
    reviewCount: number;
  }> {
    const aggregate = await this.db.product_reviews.aggregate({
      where: { product_id: productId },
      _avg: { rating: true },
      _count: { id: true },
    });

    const reviewCount = aggregate._count.id;
    if (reviewCount === 0) {
      return { averageRating: null, reviewCount: 0 };
    }

    const averageRating =
      aggregate._avg.rating != null
        ? Math.round(aggregate._avg.rating * 10) / 10
        : null;

    return {
      averageRating,
      reviewCount,
    };
  }

  async getReviewsByProduct(
    productId: number,
    pagination?: { page?: number; limit?: number },
  ): Promise<{
    reviews: any[];
    total: number;
    page: number;
    limit: number;
    averageRating: number | null;
    reviewCount: number;
  }> {
    const page = pagination?.page ?? 1;
    const limit = Math.min(pagination?.limit ?? 10, 50);
    const skip = (page - 1) * limit;

    const [reviews, total, aggregated] = await Promise.all([
      this.db.product_reviews.findMany({
        where: { product_id: productId },
        include: REVIEW_INCLUDE,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.product_reviews.count({
        where: { product_id: productId },
      }),
      this.getAggregatedRating(productId),
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      averageRating: aggregated.averageRating,
      reviewCount: aggregated.reviewCount,
    };
  }

  async createReview(
    productId: number,
    userId: number,
    dto: CreateReviewDto,
  ): Promise<any> {
    const product = await this.db.products.findFirst({
      where: { id: productId, deleted_at: null },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const hasPurchase = await this.hasConfirmedPurchaseForProduct(
      userId,
      productId,
    );
    if (!hasPurchase) {
      throw new ForbiddenError(
        "You can only review products you have purchased and that have been confirmed",
      );
    }

    const existing = await this.db.product_reviews.findUnique({
      where: {
        product_id_user_id: { product_id: productId, user_id: userId },
      },
    });
    if (existing) {
      throw new ConflictError("You have already reviewed this product");
    }

    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestError("Rating must be between 1 and 5");
    }

    const review = await this.db.product_reviews.create({
      data: {
        product_id: productId,
        user_id: userId,
        rating: dto.rating,
        review_text: dto.review_text?.trim() || null,
      },
      include: REVIEW_INCLUDE,
    });

    return review;
  }

  async updateReview(
    reviewId: number,
    userId: number,
    dto: UpdateReviewDto,
  ): Promise<any> {
    const review = await this.db.product_reviews.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundError("Review not found");
    }
    if (review.user_id !== userId) {
      throw new ForbiddenError("You can only edit your own review");
    }

    const data: { rating?: number; review_text?: string | null } = {};
    if (dto.rating !== undefined) {
      if (dto.rating < 1 || dto.rating > 5) {
        throw new BadRequestError("Rating must be between 1 and 5");
      }
      data.rating = dto.rating;
    }
    if (dto.review_text !== undefined) {
      data.review_text = dto.review_text?.trim() || null;
    }

    return this.db.product_reviews.update({
      where: { id: reviewId },
      data,
      include: REVIEW_INCLUDE,
    });
  }

  async deleteReview(reviewId: number, userId: number): Promise<void> {
    const review = await this.db.product_reviews.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundError("Review not found");
    }
    if (review.user_id !== userId) {
      throw new ForbiddenError("You can only delete your own review");
    }

    await this.db.product_reviews.delete({
      where: { id: reviewId },
    });
  }

  async getUserReviewForProduct(
    productId: number,
    userId: number,
  ): Promise<any | null> {
    return this.db.product_reviews.findUnique({
      where: {
        product_id_user_id: { product_id: productId, user_id: userId },
      },
      include: REVIEW_INCLUDE,
    });
  }
}

export const reviewService = new ReviewService();
