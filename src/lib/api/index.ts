import { config } from '../../config';
import { expireSession, readSession } from '../session';
import { createApiClient } from './client';

export { ApiError } from './ApiError';
export { createApiClient } from './client';
export { describeAuthError } from './describeError';

export const api = createApiClient({
  baseUrl: config.apiUrl,
  getToken: () => readSession()?.token,
  onUnauthorized: expireSession,
});
