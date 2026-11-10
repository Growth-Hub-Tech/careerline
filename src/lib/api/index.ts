import { config } from '../../config';
import { expireSession, readSession } from '../session';
import { createCatalogApi } from './catalog';
import { createResultsApi } from './results';
import { createInvitationsApi, createRecruiterApi } from './recruiter';
import { createOrganisationsApi, createRolesApi } from './organisations';
import { createApiClient } from './client';
import {
  createAccountsApi,
  createAttemptsApi,
  createAuthApi,
  createBeginnerApi,
  createContactApi,
  createPaymentsApi,
  createPrivacyApi,
  createProfileApi,
  createProgrammesApi,
  createSubscriptionsApi,
} from './endpoints';

export type * from './types';

const api = createApiClient({
  baseUrl: config.apiUrl,
  isSignedIn: () => readSession() !== null,
  onUnauthorized: expireSession,
});

export const authApi = createAuthApi(api);
export const contactApi = createContactApi(api);
export const beginnerApi = createBeginnerApi(api);
export const programmesApi = createProgrammesApi(api);
export const profileApi = createProfileApi(api);
export const subscriptionsApi = createSubscriptionsApi(api);
export const paymentsApi = createPaymentsApi(api);
export const privacyApi = createPrivacyApi(api);
export const catalogApi = createCatalogApi(api);
export const attemptsApi = createAttemptsApi(api);
export const resultsApi = createResultsApi(api);
export const recruiterApi = createRecruiterApi(api);
export const invitationsApi = createInvitationsApi(api);
export const organisationsApi = createOrganisationsApi(api);
export const rolesApi = createRolesApi(api);
export const accountsApi = createAccountsApi(api);
