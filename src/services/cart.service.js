import { apiRequest } from '@/lib/api-client';

export const cartKeys = {
  all: ['cart'],
  mine: () => [...cartKeys.all, 'mine'],
};

export const listMyCart = () => apiRequest('/cart').then((r) => r.data);
export const addToCart = (courseId) => apiRequest('/cart', { method: 'POST', body: { courseId } });
export const removeFromCart = (courseId) => apiRequest(`/cart/${courseId}`, { method: 'DELETE' });
export const clearCart = () => apiRequest('/cart', { method: 'DELETE' });
