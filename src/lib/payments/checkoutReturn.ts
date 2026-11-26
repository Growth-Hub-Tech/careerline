const RETURN_KEY = 'careerline.checkout.return';

// Only a path on this site: not "//evil.test" nor "/\evil.test", which browsers read as
// another origin
export const safeReturnPath = (value: string | null | undefined) =>
  value && /^\/(?![/\\])/.test(value) ? value : null;

export const callbackUrl = () => `${window.location.origin}/payments/callback`;

export const rememberReturn = (path: string) => {
  try {
    sessionStorage.setItem(RETURN_KEY, path);
  } catch {
    return;
  }
};

export const readReturn = () => {
  try {
    return safeReturnPath(sessionStorage.getItem(RETURN_KEY));
  } catch {
    return null;
  }
};

export const clearReturn = () => {
  try {
    sessionStorage.removeItem(RETURN_KEY);
  } catch {
    return;
  }
};
