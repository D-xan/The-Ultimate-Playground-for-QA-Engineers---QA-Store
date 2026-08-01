import React, { useEffect } from 'react';
import { AppRoutes } from './routes';
import { useTheme } from './store/useTheme';

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AppRoutes />
  );
}

export default App;
