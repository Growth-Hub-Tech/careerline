export const config = {
  whatsappUrl: import.meta.env.VITE_WHATSAPP_URL as string,

  contact: {
    email: import.meta.env.VITE_CONTACT_EMAIL as string,
    phone: import.meta.env.VITE_CONTACT_PHONE as string,
    address: import.meta.env.VITE_CONTACT_ADDRESS as string,
  },
} as const;
