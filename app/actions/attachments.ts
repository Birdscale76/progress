'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/supabase'; // Adjust path as necessary

export async function createAttachmentMetadata(formData: FormData) {
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
    console.error('User not authenticated for creating attachment metadata:', authError);
    return { success: false, message: 'User not authenticated.' };
  }

  const projectId = formData.get('projectId') as string;
  const file_name = formData.get('file_name') as string;
  const attachment_type = formData.get('attachment_type') as string | undefined;
  const description = formData.get('description') as string | undefined;

  if (!projectId || !file_name) {
    return { success: false, message: 'Project ID and file name are required for attachment metadata.' };
  }

  // For this step, file_path, storage_bucket, and storage_object_path are placeholders.
  // In a real scenario, these would come from the actual file upload process.
  const placeholderFilePath = `uploads/${projectId}/${file_name}`; 

  try {
    const { data, error } = await supabase
      .from('project_attachments')
      .insert({
        project_id: projectId,
        uploaded_by_user_id: user.id,
        file_name,
        attachment_type,
        description,
        file_path: placeholderFilePath, // Placeholder
        storage_bucket: 'project_files', // Example placeholder
        storage_object_path: `${projectId}/${file_name}` // Example placeholder
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating attachment metadata:', error);
      return { success: false, message: error.message || 'Failed to create attachment metadata.' };
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/dashboard`);

    return { success: true, message: 'Attachment metadata created successfully.', data };

  } catch (e: any) {
    console.error('Unexpected error creating attachment metadata:', e);
    return { success: false, message: e.message || 'An unexpected error occurred.' };
  }
}

export async function getProjectAttachments(projectId: string): Promise<Database['public']['Tables']['project_attachments']['Row'][]> {
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
    .from('project_attachments')
    .select('*') // Consider selecting specific columns or user details if needed
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching attachments for project ${projectId}:`, error);
    return [];
  }

  return data || [];
}
