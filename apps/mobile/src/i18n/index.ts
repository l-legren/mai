import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

/**
 * i18next setup. English is the source of truth. Imported for its side effect from the root layout
 * (`import '@/i18n'`) before any `t()` call. Single `translation` namespace with nested keys.
 */
// `i18n.use()`/`i18n.*` are the i18next default-export API, not the same-named named exports.
/* eslint-disable import/no-named-as-default-member */
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
/* eslint-enable import/no-named-as-default-member */

export default i18n;
