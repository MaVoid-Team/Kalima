# Developer Guidelines & Best Practices

To ensure codebase health, maintainability, and consistency, all development occurring inside the `backend/` directory should abide by these common guidelines.

## 1. Adding a New Feature Workflow

When adding a new RESTful resource (e.g., `Reviews`):

1.  **Database Layer**: Start by modifying `prisma/schema.prisma` and running migrations.
2.  **DTOs (Data Transfer Objects)**: Create `create-review.dto.ts` validating the incoming payload.
3.  **Service Layer**: Encapsulate the business logic for fetching or mutating reviews.
4.  **Controller Layer**: Parse the `req.body` with your DTO and forward execution to the Service.
5.  **Route Layer**: Apply auth/role middlewares, tie HTTP verbs to your controller, and attach it to the main `v2` index.

---

## 2. Code Blueprints

### Creating a Secure DTO

Always strictly type expected inputs to prevent malicious mass-assignment.

```typescript
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
} from "class-validator";

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
```

### Structuring a Controller

Controllers should be incredibly thin.

```typescript
import { Request, Response } from "express";
import { ReviewService } from "../services/reviews.service";
import { CreateReviewDto } from "../dtos/create-review.dto";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";

export const createReview = async (req: Request, res: Response) => {
  // 1. Transform JSON into Class
  const reviewDto = plainToInstance(CreateReviewDto, req.body);

  // 2. Validate (Will throw to global handler if invalid)
  await validateOrReject(reviewDto);

  // 3. Forward to Service
  const userId = req.user.id; // Assumes Auth Middleware ran first
  const newReview = await ReviewService.createReview(userId, reviewDto);

  // 4. Return Output
  return res.status(201).json({
    status: "success",
    data: newReview,
  });
};
```

## 3. Mandatory Naming Conventions

- **Files**: Use `kebab-case.type.ts` (e.g., `cart-items.service.ts` or `cart.routes.ts`).
- **Classes**: PascalCase (e.g., `class StoreController`).
- **Functions & Variables**: camelCase (e.g., `fetchActivePromotions()`).
- _TypeScript `any` is strictly prohibited unless interacting with legacy typeless 3rd-party libs._
