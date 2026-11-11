import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, useLocation, useRoutes } from 'react-router-dom';
import { getRoutes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { queryClient } from './lib/api/queryClient';

const AppRoutes = () => {
  const { pathname } = useLocation();
  const element = useRoutes(getRoutes());

  return <ErrorBoundary resetKey={pathname}>{element}</ErrorBoundary>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
