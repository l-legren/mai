import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

/**
 * i18next setup. English is the source of truth. Imported for its side effect from
 * `app/i18n-provider.tsx` (a client component — react-i18next can't load inside the server-only
 * root layout) before any `t()` call. Single `translation` namespace with nested keys.
 */
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: { en: { translation: en } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
} else {
  // Already initialised (e.g. Fast Refresh re-ran this module) — refresh the bundle so newly added
  // keys are picked up without a full reload. `deep`+`overwrite` merge the latest en.json.
  i18n.addResourceBundle('en', 'translation', en, true, true);
}

export default i18n;
