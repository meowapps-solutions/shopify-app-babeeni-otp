import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

import enPolarisTranslations from '@shopify/polaris/locales/en.json';

import Index from './index';
import NotFound from './404';
import AppLayout from './app/_layout';
import App from './app/index';
import AdditionalPage from './app/additional';

// https://reactrouter.com/start/library/routing
createRoot(document.getElementById('root')!).render(
  <PolarisAppProvider i18n={enPolarisTranslations}>
    <BrowserRouter>
      <Routes>
        <Route index element={<Index />} />

        <Route path="app" element={<AppLayout />}>
          <Route index element={<App />} />
          <Route path="additional" element={<AdditionalPage />} />
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </PolarisAppProvider>,
);
