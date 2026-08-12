import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './translations/en.json'

const resources = {
  en: { translation: enTranslation },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', 
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, 
  },
});

// This declaration enables TypeScript type-checking for your keys
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: typeof resources['en'];
  }
}

export default i18n;