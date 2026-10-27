import { useCallback, useEffect, useState } from 'react';

export type RequestState<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: unknown }
  | { readonly status: 'success'; readonly data: T };

export const useRequest = <T>(load: () => Promise<T>) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<RequestState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    load().then(
      (data) => {
        if (active) setState({ status: 'success', data });
      },
      (error: unknown) => {
        if (active) setState({ status: 'error', error });
      },
    );

    return () => {
      active = false;
    };
  }, [load, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((count) => count + 1);
  }, []);

  return { state, retry };
};
