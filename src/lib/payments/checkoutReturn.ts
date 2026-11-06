const RETURN_KEY = 'careerline.checkout.return';

export const safeReturnPath = (value: string | null | undefined) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : null;

export const callbackUrl = () => `${window.location.origin}/payments/callback`;

export const rememberReturn = (path: string) => {
  try {
    sessionStorage.setItem(RETURN_KEY, path);
  } catch {
    return;
  }
};

export const takeReturn = () => {
  try {
    const path = safeReturnPath(sessionStorage.getItem(RETURN_KEY));
    sessionStorage.removeItem(RETURN_KEY);
    return path;
  } catch {
    return null;
  }
};
