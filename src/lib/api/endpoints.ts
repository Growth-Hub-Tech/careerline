import type { createApiClient } from './client';
import type {
  Acknowledgement,
  ContactReceipt,
  ContactRequest,
  RegisterRequest,
  TokenResponse,
} from './types';

type Client = ReturnType<typeof createApiClient>;

export const createAuthApi = (client: Client) => ({
  login: (email: string, password: string) =>
    client.post<TokenResponse>('/auth/login', {
      body: new URLSearchParams({ username: email, password }),
      auth: false,
    }),

  register: (details: RegisterRequest) =>
    client.post<unknown>('/auth/register', { body: details, auth: false }),

  requestPasswordReset: (email: string) =>
    client.post<Acknowledgement>('/accounts/password-reset', { body: { email }, auth: false }),
});

export const createContactApi = (client: Client) => ({
  send: (message: ContactRequest) =>
    client.post<ContactReceipt>('/contact', { body: message, auth: false }),
});
