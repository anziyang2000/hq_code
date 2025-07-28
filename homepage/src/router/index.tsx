import { useRoutes } from 'react-router-dom';

import NotFound from '@/components/NotFound';
import Home from '@/views/Home';

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ]);
}
