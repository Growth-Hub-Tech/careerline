import { BrowserRouter, useRoutes } from 'react-router-dom';
import { getRoutes } from './routes';
import { ThemeProvider } from './hooks/useTheme';
import './styles/index.scss';

const AppRoutes = () => useRoutes(getRoutes());

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
