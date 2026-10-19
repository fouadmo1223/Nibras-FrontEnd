import { apiRequest } from '@/lib/api-client';

/** Previews a coupon code's discount against the caller's own cart — doesn't consume a redemption. */
export const validateCoupon = (code) => apiRequest('/coupons/validate', { method: 'POST', body: { code } }).then((r) => r.data);
