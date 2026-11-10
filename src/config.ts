// Unset values are '' (a contact card with no value is hidden)
const setting = (value: string | undefined) => value?.trim() ?? '';

export const config = {
  apiUrl: setting(import.meta.env.VITE_API_URL as string | undefined),

  contact: {
    email: setting(import.meta.env.VITE_CONTACT_EMAIL as string | undefined),
    phone: setting(import.meta.env.VITE_CONTACT_PHONE as string | undefined),
    address: setting(import.meta.env.VITE_CONTACT_ADDRESS as string | undefined),
  },
} as const;
