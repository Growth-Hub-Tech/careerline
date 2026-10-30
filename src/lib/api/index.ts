import { config } from '../../config';
import { expireSession, readSession } from '../session';
import { createCatalogApi } from './catalog';
import { createResultsApi } from './results';
import { createApiClient } from './client';
import {
  createAttemptsApi,
  createAuthApi,
  createBeginnerApi,
  createContactApi,
  createProgrammesApi,
} from './endpoints';

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
export const beginnerApi = createBeginnerApi(api);
export const programmesApi = createProgrammesApi(api);
export const catalogApi = createCatalogApi(api);
export const attemptsApi = createAttemptsApi(api);
export const resultsApi = createResultsApi(api);
