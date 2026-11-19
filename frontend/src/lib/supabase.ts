import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const env = (meta && meta.env) || {};

const supabaseUrl =
  env.VITE_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://gkczjrtcpqhjmowwfdmm.supabase.co';

const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_vylQfO_qbnZ4xKQ5_KoGpg_J61tk72S';

export const isCloudMode = Boolean(
  supabaseUrl &&
    !supabaseUrl.includes('your-project') &&
    !supabaseUrl.includes('localhost')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
