import { useMutation } from '@tanstack/react-query';
import { apiPost } from '..';
import { API_ROUTES } from '../routes';
import type { ContactReceipt, ContactRequest } from '../types';

// The contact form and the quote form; neither needs a session
export const useSendContact = () =>
  useMutation({
    mutationFn: (message: ContactRequest) =>
      apiPost<ContactReceipt>(API_ROUTES.contact, message, { auth: false }),
  });
