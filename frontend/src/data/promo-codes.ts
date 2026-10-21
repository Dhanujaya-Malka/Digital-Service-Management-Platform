import { PromoCode } from '@/types';

/**
 * Initial Default Promo / Gift Trial Vouchers.
 * Dynamic codes generated from the Admin Portal are stored in localStorage and AppContext.
 */
export const defaultPromoCodes: PromoCode[] = [];

// Backward-compatible alias
export const availablePromoCodes = defaultPromoCodes;

export interface PromoValidationResult {
  valid: boolean;
  promo?: PromoCode;
  discountAmount: number;
  finalAmount: number;
  errorMessage?: string;
}

/**
 * Validates a promo code against the current package subtotal.
 * Enforces:
 * - Case-insensitive matching
 * - Maximum usage limit
 * - Expiry date boundary
 * - Minimum spend requirement
 * - 100% Free Gift Card / Voucher logic (Rs. 0 total)
 * - Non-negative final price guarantee
 */
export function validatePromoCode(
  rawCode: string, 
  subtotal: number, 
  promosList: PromoCode[] = defaultPromoCodes
): PromoValidationResult {
  const code = rawCode.trim().toUpperCase();

  if (!code) {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: subtotal,
      errorMessage: 'Please enter a promo code or gift card voucher.',
    };
  }

  const promo = promosList.find((p) => p.code.toUpperCase() === code);

  if (!promo) {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: subtotal,
      errorMessage: `Promo code "${code}" is invalid or does not exist.`,
    };
  }

  if (promo.isUsed || promo.usedCount >= promo.maxUses) {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: subtotal,
      errorMessage: `Promo code "${code}" has already been redeemed and is no longer valid.`,
    };
  }

  if (!promo.isActive) {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: subtotal,
      errorMessage: `Promo code "${code}" has been deactivated or expired.`,
    };
  }

  if (promo.expiryDate) {
    const expiry = new Date(promo.expiryDate).getTime();
    if (Date.now() > expiry) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: subtotal,
        errorMessage: `Promo code "${code}" expired on ${new Date(promo.expiryDate).toLocaleDateString()}.`,
      };
    }
  }

  if (promo.minSpend && subtotal < promo.minSpend) {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: subtotal,
      errorMessage: `Promo code "${code}" requires a minimum package price of Rs. ${promo.minSpend}. (Your package is Rs. ${subtotal})`,
    };
  }

  // Calculate discount based on type
  let calculatedDiscount = 0;

  if (promo.discountType === 'gift_100') {
    calculatedDiscount = subtotal; // 100% Free Trial Gift Voucher!
  } else if (promo.discountType === 'percentage') {
    calculatedDiscount = Math.round((subtotal * promo.value) / 100);
  } else {
    calculatedDiscount = promo.value;
  }

  if (promo.maxDiscount && calculatedDiscount > promo.maxDiscount) {
    calculatedDiscount = promo.maxDiscount;
  }

  // Final price cannot drop below 0
  const finalAmount = Math.max(0, subtotal - calculatedDiscount);

  return {
    valid: true,
    promo,
    discountAmount: calculatedDiscount,
    finalAmount,
  };
}
