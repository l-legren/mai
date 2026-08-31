'use client';

import '@/lib/supabase';

import { PropsWithChildren } from 'react';

const SupabaseProvider = ({ children }: PropsWithChildren) => {
  return children;
};

export default SupabaseProvider;
