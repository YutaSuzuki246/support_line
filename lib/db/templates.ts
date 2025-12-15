import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export async function getTemplateById(id: string) {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function getTemplates(category?: string, isActive = true) {
  let query = supabase
    .from('templates')
    .select('*')
    .eq('is_active', isActive)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getPinnedTemplates() {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_active', true)
    .eq('is_pinned', true)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function createTemplate(
  template: Omit<Database['public']['Tables']['templates']['Insert'], 'id'>
) {
  const { data, error } = await supabase
    .from('templates')
    .insert(template)
    .select()
    .single();
  return { data, error };
}

export async function updateTemplate(
  id: string,
  update: Partial<Database['public']['Tables']['templates']['Update']>
) {
  const { data, error } = await supabase
    .from('templates')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteTemplate(id: string) {
  const { data, error } = await supabase
    .from('templates')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

