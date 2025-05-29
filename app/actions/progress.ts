'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/supabase'; // Adjust path as necessary

export async function createProgressUpdate(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('User not authenticated for progress update:', authError);
    return { success: false, message: 'User not authenticated.' };
  }

  const projectId = formData.get('projectId') as string;
  const date = formData.get('date') as string;
  const manpowerCountStr = formData.get('manpower_count') as string;
  const updateText = formData.get('update_text') as string;

  if (!projectId || !date || !updateText) {
    return { success: false, message: 'Project ID, date, and update text are required.' };
  }

  const manpower_count = manpowerCountStr ? parseInt(manpowerCountStr, 10) : undefined;
  if (manpowerCountStr && (isNaN(manpower_count!) || manpower_count! < 0)) {
    return { success: false, message: 'Invalid manpower count.'};
  }

  try {
    const { data, error } = await supabase
      .from('progress_updates')
      .insert({
        project_id: projectId,
        user_id: user.id,
        date,
        manpower_count,
        update_text: updateText,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating progress update:', error);
      return { success: false, message: error.message || 'Failed to create progress update.' };
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/dashboard`); // Also revalidate dashboard if it shows progress
    return { success: true, message: 'Progress update created successfully.', data };

  } catch (e: any) {
    console.error('Unexpected error creating progress update:', e);
    return { success: false, message: e.message || 'An unexpected error occurred.' };
  }
}

export async function getProgressUpdates(projectId: string): Promise<Database['public']['Tables']['progress_updates']['Row'][]> {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data, error } = await supabase
    .from('progress_updates')
    .select('*')
    .eq('project_id', projectId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching progress updates for project ${projectId}:`, error);
    return [];
  }

  return data || [];
}
