'use client';

import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';

export default function PolarisProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider i18n={enTranslations}>
      {children}
    </AppProvider>
  );
}
