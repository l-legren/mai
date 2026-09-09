/**
 * Builds the app's one Supabase client — `@mai/api` has no React Native dependency, so this is
 * the one place AsyncStorage (the auth token store) and the Android-emulator URL rewrite live.
 * Imported once for its side effect at app boot (`src/app/_layout.tsx`); the `services/` layer
 * imports `supabase` from here directly and passes it into each `@mai/api`/`@mai/auth` call.
 */

import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
