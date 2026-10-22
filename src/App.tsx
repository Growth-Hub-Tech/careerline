import { BrowserRouter, useLocation, useRoutes } from 'react-router-dom';
import { getRoutes } from './routes';
import { ThemeProvider } from './hooks/useTheme';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppRoutes = () => {
  const { pathname } = useLocation();
  const element = useRoutes(getRoutes());

  return <ErrorBoundary resetKey={pathname}>{element}</ErrorBoundary>;
};

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
