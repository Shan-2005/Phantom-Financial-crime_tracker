import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const supabaseUrl =
  (meta.env && meta.env.VITE_SUPABASE_URL) || 'https://gkczjrtcpqhjmowwfdmm.supabase.co';
const supabaseAnonKey =
  (meta.env && (meta.env.VITE_SUPABASE_ANON_KEY || meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const isCloudMode = Boolean(
  meta.env &&
    meta.env.VITE_SUPABASE_URL &&
    !meta.env.VITE_SUPABASE_URL.includes('your-project') &&
    !meta.env.VITE_SUPABASE_URL.includes('localhost')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
