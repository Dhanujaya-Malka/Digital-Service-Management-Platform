import { PromoCode } from '@/types';

/**
 * Initial Default Promo / Gift Trial Vouchers.
 * Dynamic codes generated from the Admin Portal are stored in localStorage and AppContext.
 */
export const defaultPromoCodes: PromoCode[] = [
  {
    id: 'gift-7d-demo',
    code: 'GIFT-7DAYS',
    discountType: 'gift_100',
    value: 100,
    description: '100% Free 7-Day Trial Gift Voucher for Friends',
    durationDays: 7,
    createdAt: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 1,
    usedCount: 0,
    isUsed: false,
    usedBy: [],
    isActive: true,
  },
  {
    id: 'trial-14d-demo',
    code: 'TRIAL-14D',
    discountType: 'gift_100',
    value: 100,
    description: '100% Free 14-Day Trial Gift Card for Testing',
    durationDays: 14,
    createdAt: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 1,
    usedCount: 0,
    isUsed: false,
    usedBy: [],
    isActive: true,
  },
];

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
 * - Code existence & case-insensitivity
 * - Single-use enforcement (if usedCount >= maxUses or isUsed === true, rejects)
 * - Active status
 * - Expiration date checks
 * - Minimum spend requirements
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

  // Check if code has already been redeemed
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

  // Check expiration date
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

  // Calculate discount amount
  let calculatedDiscount = 0;
  if (promo.discountType === 'gift_100') {
    calculatedDiscount = subtotal; // 100% Free Trial Gift Voucher!
  } else if (promo.discountType === 'percentage') {
    calculatedDiscount = Math.round((subtotal * promo.value) / 100);
  } else {
    calculatedDiscount = promo.value;
  }

  // Apply maximum discount cap if set
  if (promo.maxDiscount && calculatedDiscount > promo.maxDiscount) {
    calculatedDiscount = promo.maxDiscount;
  }

  // Ensure discount does not exceed the subtotal (price cannot be negative)
  calculatedDiscount = Math.min(calculatedDiscount, subtotal);
  const finalAmount = Math.max(0, subtotal - calculatedDiscount);

  return {
    valid: true,
    promo,
    discountAmount: calculatedDiscount,
    finalAmount,
  };
}
