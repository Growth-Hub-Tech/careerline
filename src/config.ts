export const config = {
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? '',

  contact: {
    email: import.meta.env.VITE_CONTACT_EMAIL as string,
    phone: import.meta.env.VITE_CONTACT_PHONE as string,
    address: import.meta.env.VITE_CONTACT_ADDRESS as string,
  },
} as const;
