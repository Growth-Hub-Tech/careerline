const KEY = 'careerline.pending-email';

export const rememberPendingEmail = (email: string) => {
  try {
    window.sessionStorage.setItem(KEY, email);
  } catch {
    return;
  }
};

export const readPendingEmail = (): string | undefined => {
  try {
    return window.sessionStorage.getItem(KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

export const clearPendingEmail = () => {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    return;
  }
};
