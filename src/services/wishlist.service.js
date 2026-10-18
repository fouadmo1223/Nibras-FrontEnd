import { apiRequest } from '@/lib/api-client';

export const wishlistKeys = {
  all: ['wishlist'],
  mine: () => [...wishlistKeys.all, 'mine'],
};

export const listMyWishlist = () => apiRequest('/wishlist').then((r) => r.data);
export const addToWishlist = (courseId) => apiRequest('/wishlist', { method: 'POST', body: { courseId } });
export const removeFromWishlist = (courseId) => apiRequest(`/wishlist/${courseId}`, { method: 'DELETE' });
export const clearWishlist = () => apiRequest('/wishlist', { method: 'DELETE' });
