import { BrowserRouter, useLocation, useRoutes } from 'react-router-dom';
import { getRoutes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppRoutes = () => {
  const { pathname } = useLocation();
  const element = useRoutes(getRoutes());

  return <ErrorBoundary resetKey={pathname}>{element}</ErrorBoundary>;
};

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
