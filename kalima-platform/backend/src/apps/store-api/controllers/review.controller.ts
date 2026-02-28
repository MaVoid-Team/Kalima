import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { reviewService } from "../services/review.service";
import { CreateReviewDto, UpdateReviewDto } from "../dtos/review.dto";
import { BadRequestError, ValidationError } from "../../../libs/errors";

async function validateDto<T extends object>(
  DtoClass: new () => T,
  body: unknown,
): Promise<T> {
  const dto = plainToInstance(DtoClass, body);
  const validationErrors = await validate(dto);

  if (validationErrors.length > 0) {
    const errors = validationErrors.flatMap((err) =>
      Object.values(err.constraints || {}),
    );
    throw new ValidationError(errors);
  }

  return dto;
}

export const reviewController = {
  async getProductReviews(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const productId = parseInt(req.params.id as string, 10);
      if (isNaN(productId)) throw new BadRequestError("Invalid product ID");

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      const result = await reviewService.getReviewsByProduct(productId, {
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result.reviews,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
        averageRating: result.averageRating,
        reviewCount: result.reviewCount,
      });
    } catch (error) {
      _next(error);
    }
  },

  async createReview(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const productId = parseInt(req.params.id as string, 10);
      if (isNaN(productId)) throw new BadRequestError("Invalid product ID");

      const userId = (req.user as any)?.userId;
      if (!userId) throw new BadRequestError("User not authenticated");

      const dto = await validateDto(CreateReviewDto, req.body);
      const review = await reviewService.createReview(productId, userId, dto);

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error) {
      _next(error);
    }
  },

  async updateReview(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const productId = parseInt(req.params.id as string, 10);
      const reviewId = parseInt(req.params.reviewId as string, 10);
      if (isNaN(productId) || isNaN(reviewId)) {
        throw new BadRequestError("Invalid product ID or review ID");
      }

      const userId = (req.user as any)?.userId;
      if (!userId) throw new BadRequestError("User not authenticated");

      const dto = await validateDto(UpdateReviewDto, req.body);
      const review = await reviewService.updateReview(reviewId, userId, dto);

      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: review,
      });
    } catch (error) {
      _next(error);
    }
  },

  async deleteReview(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const reviewId = parseInt(req.params.reviewId as string, 10);
      if (isNaN(reviewId)) throw new BadRequestError("Invalid review ID");

      const userId = (req.user as any)?.userId;
      if (!userId) throw new BadRequestError("User not authenticated");

      await reviewService.deleteReview(reviewId, userId);

      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      _next(error);
    }
  },

  async checkCanReview(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const productId = parseInt(req.params.id as string, 10);
      if (isNaN(productId)) throw new BadRequestError("Invalid product ID");

      const userId = (req.user as any)?.userId;
      if (!userId) {
        res.status(200).json({
          success: true,
          data: { canReview: false, reason: "not_authenticated" },
        });
        return;
      }

      const hasPurchase =
        await reviewService.hasConfirmedPurchaseForProduct(userId, productId);
      const existingReview =
        await reviewService.getUserReviewForProduct(productId, userId);

      if (!hasPurchase) {
        res.status(200).json({
          success: true,
          data: {
            canReview: false,
            reason: "no_confirmed_purchase",
          },
        });
        return;
      }

      if (existingReview) {
        res.status(200).json({
          success: true,
          data: {
            canReview: false,
            reason: "already_reviewed",
            existingReview,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { canReview: true },
      });
    } catch (error) {
      _next(error);
    }
  },
};
