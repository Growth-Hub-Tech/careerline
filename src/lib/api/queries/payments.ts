import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '..';
import { queryClient, STALE_TIME } from '../queryClient';
import { queryKeys } from '../queryKeys';
import { API_ROUTES } from '../routes';
import type {
  Checkout,
  CheckoutRequest,
  CreditPack,
  Credits,
  Payment,
  PaymentPage,
  Plan,
  SubscribeRequest,
  Subscription,
} from '../types';

export const paymentQueries = {
  credits: () =>
    queryOptions({
      queryKey: queryKeys.payments.credits,
      queryFn: ({ signal }) => apiGet<Credits>(API_ROUTES.payments.credits, { signal }),
    }),

  // The latest 20 payments
  list: () =>
    queryOptions({
      queryKey: queryKeys.payments.list,
      queryFn: async ({ signal }) =>
        (
          await apiGet<PaymentPage>(API_ROUTES.payments.list, {
            query: { limit: 20, offset: 0 },
            signal,
          })
        ).items,
    }),

  // Once Paystack confirms it, the payment has added credits or started a plan (an organisation's
  // plan sets its seats), so those are fetched again
  payment: (reference: string) =>
    queryOptions({
      queryKey: queryKeys.payments.payment(reference),
      queryFn: async ({ signal }) => {
        const payment = await apiGet<Payment>(API_ROUTES.payments.detail(reference), { signal });
        if (payment.status === 'paid') {
          [
            queryKeys.payments.credits,
            queryKeys.payments.subscription,
            queryKeys.payments.list,
            queryKeys.organisation.all,
          ].forEach((queryKey) => void queryClient.invalidateQueries({ queryKey }));
        }
        return payment;
      },
    }),

  creditPacks: () =>
    queryOptions({
      queryKey: queryKeys.payments.creditPacks,
      queryFn: ({ signal }) => apiGet<CreditPack[]>(API_ROUTES.payments.creditPacks, { signal }),
      staleTime: STALE_TIME.reference,
    }),

  plans: () =>
    queryOptions({
      queryKey: queryKeys.payments.plans,
      queryFn: ({ signal }) => apiGet<Plan[]>(API_ROUTES.subscriptions.plans, { signal }),
      staleTime: STALE_TIME.reference,
    }),

  subscription: () =>
    queryOptions({
      queryKey: queryKeys.payments.subscription,
      queryFn: ({ signal }) =>
        apiGet<Subscription | null>(API_ROUTES.subscriptions.mine, { signal }),
    }),
};

// Both send the browser to Paystack; nothing here changes until the payment is confirmed
export const useCheckout = () =>
  useMutation({
    mutationFn: (request: CheckoutRequest) =>
      apiPost<Checkout>(API_ROUTES.payments.checkout, request),
  });

export const useSubscribe = () =>
  useMutation({
    mutationFn: (request: SubscribeRequest) =>
      apiPost<Checkout>(API_ROUTES.subscriptions.subscribe, request),
  });

const useSubscriptionChange = (path: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<Subscription>(path),
    onSuccess: (subscription) => client.setQueryData(queryKeys.payments.subscription, subscription),
  });
};

export const useCancelSubscription = () => useSubscriptionChange(API_ROUTES.subscriptions.cancel);

export const useResumeSubscription = () => useSubscriptionChange(API_ROUTES.subscriptions.resume);
