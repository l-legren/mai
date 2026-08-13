/**
 * Builds the Supabase client and hands it to `@moniq/api` (see `configureSupabaseClient`) — the
 * package itself has no React Native dependency, so this is the one place AsyncStorage (the auth
 * token store) and the Android-emulator URL rewrite live. Imported once for its side effect at app
 * boot (`src/app/_layout.tsx`); every `@moniq/api` data function then reads the client back via
 * `getSupabaseClient()`.
 */

import 'react-native-url-polyfill/auto';

import { configureSupabaseClient, resolveSupabaseUrl } from '@moniq/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const rawSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!rawSupabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in.'
  );
}

const supabaseUrl = resolveSupabaseUrl(rawSupabaseUrl, Platform.OS, __DEV__);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

configureSupabaseClient(supabase);
