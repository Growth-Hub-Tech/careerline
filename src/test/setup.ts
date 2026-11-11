import '@testing-library/jest-dom/vitest';
import { useUserStore } from '../lib/user/store';

afterEach(() => {
  useUserStore.setState({ user: null, roles: {}, expired: false });
  window.localStorage.clear();
  window.sessionStorage.clear();
});
