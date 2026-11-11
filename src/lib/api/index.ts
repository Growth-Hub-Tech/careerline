import { config } from '../../config';
import { useUserStore } from '../user/store';
import { createHttpClient } from './http';

export type * from './types';
export { API_ROUTES } from './routes';
export { queryKeys } from './queryKeys';

// A 401 on a signed-in request means the session cookie has ended: the user store signs out
const http = createHttpClient({
  baseUrl: config.apiUrl,
  isSignedIn: () => useUserStore.getState().user !== null,
  onUnauthorized: () => useUserStore.getState().expire(),
});

// The global request functions: every call to the API goes through these
export const apiGet = http.get;
export const apiPost = http.post;
export const apiPut = http.put;
export const apiPatch = http.patch;
export const apiDelete = http.delete;
