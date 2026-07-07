import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hzqsgytaotuxyjgarita.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'uneventful';

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  return supabase;
}

function getExtension(file: File) {
  const nameParts = file.name.split('.');
  return nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : 'png';
}

export async function uploadMarketImage(file: File, marketId: string, kind: 'question' | `option-${number}`) {
  const client = ensureSupabase();
  const extension = getExtension(file);
  const path = `minority-win/${marketId}/${kind}-${Date.now()}.${extension}`;

  const { error } = await client.storage.from(SUPABASE_STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = client.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
