import { config } from '../../config';
import { expireSession, readSession } from '../session';
import { createApiClient } from './client';
import { createAuthApi, createContactApi } from './endpoints';

export { ApiError } from './ApiError';
export { createApiClient } from './client';
export { describeAuthError, describeError } from './describeError';
export type * from './types';

export const api = createApiClient({
  baseUrl: config.apiUrl,
  getToken: () => readSession()?.token,
  onUnauthorized: expireSession,
});

export const authApi = createAuthApi(api);
export const contactApi = createContactApi(api);
