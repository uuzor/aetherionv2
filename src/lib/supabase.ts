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
  const extension = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : 'png';
  return extension.replace(/[^a-z0-9]/g, '') || 'png';
}

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').slice(0, 80);
}

function uniqueSuffix() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isRlsError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes('row-level security') || normalized.includes('violates row-level security policy');
}

export async function uploadMarketImage(file: File, marketId: string, kind: 'question' | `option-${number}`) {
  const client = ensureSupabase();
  const extension = getExtension(file);
  const path = `minority-win/${safeSegment(marketId)}/${kind}-${uniqueSuffix()}.${extension}`;

  const { error } = await client.storage.from(SUPABASE_STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/png',
  });

  if (error) {
    if (isRlsError(error.message)) {
      throw new Error(
        `Supabase blocked image upload by RLS. Run frontend/supabase/storage-policies.sql in your Supabase SQL editor for bucket "${SUPABASE_STORAGE_BUCKET}".`
      );
    }

    throw new Error(error.message);
  }

  const { data } = client.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
