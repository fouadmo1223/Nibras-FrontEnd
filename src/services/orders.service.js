import { apiRequest } from '@/lib/api-client';

export const orderKeys = {
  all: ['orders'],
  mine: () => [...orderKeys.all, 'mine'],
  detail: (id) => [...orderKeys.all, 'mine', id],
};

export const listMyOrders = () => apiRequest('/orders/mine').then((r) => r.data);
export const getMyOrder = (id) => apiRequest(`/orders/mine/${id}`).then((r) => r.data);
export const placeOrder = () => apiRequest('/orders', { method: 'POST' });
export const cancelMyOrder = (id) => apiRequest(`/orders/mine/${id}/cancel`, { method: 'PATCH' });
