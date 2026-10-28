import { localizePath } from '@/i18n/config';
import { apiRequest } from '@/lib/api-client';
import { env } from '@/lib/env';

export const orderKeys = {
  all: ['orders'],
  mine: () => [...orderKeys.all, 'mine'],
  detail: (id) => [...orderKeys.all, 'mine', id],
};

export const listMyOrders = () => apiRequest('/orders/mine').then((r) => r.data);
export const getMyOrder = (id) => apiRequest(`/orders/mine/${id}`).then((r) => r.data);
export const placeOrder = (couponCode) => apiRequest('/orders', { method: 'POST', body: couponCode ? { couponCode } : undefined });
export const cancelMyOrder = (id) => apiRequest(`/orders/mine/${id}/cancel`, { method: 'PATCH' });

/**
 * Where Stripe sends the learner back, success or not — always the Orders list, never the cart:
 * placing an order already clears the cart, so a cancelled-at-Stripe return to `/cart` would just
 * show an empty cart with no way to retry. The Orders list always has the order itself, with its
 * own "Pay now" retry button (see OrdersGrid) for exactly that case.
 */
export const checkoutRedirectUrls = (locale) => {
  const url = new URL(localizePath(locale, '/orders'), env.siteUrl).toString();
  return { successUrl: url, cancelUrl: url };
};

/** Starts real Stripe checkout for one of the caller's own pending orders; resolves to `{ url }` to redirect to. */
export const startCheckout = (orderId, locale) =>
  apiRequest(`/orders/${orderId}/checkout`, { method: 'POST', body: checkoutRedirectUrls(locale) }).then((r) => r.data);
