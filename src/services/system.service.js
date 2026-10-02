import { apiRequest } from '@/lib/api-client';

/** Liveness + database readiness of the NestJS API. Never cached. */
export async function getApiHealth() {
  const { data } = await apiRequest('/health', { cache: 'no-store' });
  return data;
}
