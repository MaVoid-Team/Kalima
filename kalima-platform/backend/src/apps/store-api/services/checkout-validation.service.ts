import type { PrismaClient } from "../../../libs/db/prisma";
import { BadRequestError } from "../../../libs/errors";
import type { payment_methods } from "../generated/prisma/client";

/** Shape required for payment validation */
export interface PaymentValidationInput {
  total: number;
  numberTransferredFrom?: string;
  payment_method_id: number;
}

/**
 * Validates payment details for checkout/fastBuy.
 * Ensures "number transferred from" is provided for paid orders and
 * that the user didn't mistakenly enter the payment method's phone number.
 * Returns the validated payment method for use in purchase payload.
 */
export async function validatePaymentForCheckout(
  db: PrismaClient,
  input: PaymentValidationInput,
  existingPaymentMethod?: payment_methods | null,
): Promise<payment_methods> {
  if (
    input.total > 0 &&
    (!input.numberTransferredFrom ||
      String(input.numberTransferredFrom).trim().length === 0)
  ) {
    throw new BadRequestError(
      "Number transferred from is required for paid purchases",
    );
  }

  const paymentMethod =
    existingPaymentMethod ??
    (await db.payment_methods.findUnique({
      where: { id: input.payment_method_id },
    }));

  if (!paymentMethod || paymentMethod.status !== true) {
    throw new BadRequestError("Invalid or inactive payment method");
  }

  if (
    input.numberTransferredFrom &&
    paymentMethod.phone_number &&
    String(input.numberTransferredFrom).trim() ===
      String(paymentMethod.phone_number).trim()
  ) {
    throw new BadRequestError(
      "Please enter the number you used to pay, not the payment method's phone number",
    );
  }

  return paymentMethod;
}
