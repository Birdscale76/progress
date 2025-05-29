'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/supabase'; // Adjust path as necessary
import { createNotification } from './notifications'; // Import createNotification

export async function createIssue(formData: FormData) {
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
    console.error('User not authenticated for creating issue:', authError);
    return { success: false, message: 'User not authenticated.' };
  }

  const projectId = formData.get('projectId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string | undefined;
  const assigned_to_user_id = formData.get('assigned_to_user_id') as string | undefined;
  const priority = formData.get('priority') as string | undefined;

  if (!projectId || !title) {
    return { success: false, message: 'Project ID and title are required for an issue.' };
  }

  try {
    const { data, error } = await supabase
      .from('issues')
      .insert({
        project_id: projectId,
        reported_by_user_id: user.id,
        title,
        description,
        assigned_to_user_id: assigned_to_user_id || null,
        priority: priority || 'medium', // Default priority
        status: 'open', // Default status
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating issue:', error);
      return { success: false, message: error.message || 'Failed to create issue.' };
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/dashboard`); // Also revalidate dashboard if it shows issues

    // Optional: Create a notification if assigned_to_user_id is set
    // This would typically involve another insert into a 'notifications' table.
    // For now, this is out of scope as per instructions.

    // --- Enhancement: Create Notification ---
    if (data && data.assigned_to_user_id && data.assigned_to_user_id !== user.id) {
      const projectInfo = await supabase.from('projects').select('name').eq('id', projectId).single();
      const notificationMessage = `You have been assigned a new issue: "${title}" in project "${projectInfo.data?.name || projectId}".`;
      await createNotification({
        userId: data.assigned_to_user_id,
        message: notificationMessage,
        relatedIssueId: data.id,
        relatedProjectId: projectId,
        createdByUserId: user.id,
      });
      // Revalidate notifications page for the assigned user (aspirational without specific user targeting)
      // For now, the assigned user will see it when they visit /notifications
    }
    // --- End Enhancement ---

    return { success: true, message: 'Issue created successfully.', data };

  } catch (e: any) {
    console.error('Unexpected error creating issue:', e);
    return { success: false, message: e.message || 'An unexpected error occurred.' };
  }
}

export async function getProjectIssues(projectId: string): Promise<Database['public']['Tables']['issues']['Row'][]> {
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
    .from('issues')
    .select(`
      *,
      assigned_to:auth_users!assigned_to_user_id ( email ),
      reported_by:auth_users!reported_by_user_id ( email )
    `) // Example of fetching related user emails, adjust if auth.users table is different
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching issues for project ${projectId}:`, error);
    // Log the specific error for more details if it's a join issue
    if (error.message.includes("could not find foreign key constraint")) {
        console.warn("Check RLS and foreign key relation for users in issues (assigned_to_user_id, reported_by_user_id)");
    }
    return [];
  }
  
  // Supabase typings might need adjustment if you're joining like this.
  // For now, we cast to any to avoid TS errors with the joined data.
  return (data as any[]) || [];
}

export async function updateIssueStatus(formData: FormData) {
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
    console.error('User not authenticated for updating issue status:', authError);
    return { success: false, message: 'User not authenticated.' };
  }

  const issueId = formData.get('issueId') as string;
  const status = formData.get('status') as string;
  const projectId = formData.get('projectId') as string; // For revalidation

  if (!issueId || !status) {
    return { success: false, message: 'Issue ID and status are required.' };
  }
  if (!projectId) {
    // This is important for revalidation. Ideally, fetch it from the issue if not passed.
    console.warn("projectId not provided for updateIssueStatus, revalidation might be limited.");
  }


  try {
    // RLS policy "Assigned users or project admins can update issues" should handle permissions.
    const { data: updatedIssue, error } = await supabase
      .from('issues')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', issueId)
      .select('id, project_id, assigned_to_user_id, reported_by_user_id, title') // Select data needed for notification
      .single();

    if (error) {
      console.error('Error updating issue status:', error);
      return { success: false, message: error.message || 'Failed to update issue status.' };
    }

    if (updatedIssue) {
        const currentUserId = user.id;
        // Notify reporter if status changed by someone else (and reporter is not assignee)
        if (updatedIssue.reported_by_user_id && updatedIssue.reported_by_user_id !== currentUserId && updatedIssue.reported_by_user_id !== updatedIssue.assigned_to_user_id) {
            await createNotification({
                userId: updatedIssue.reported_by_user_id,
                message: `The status of your reported issue "${updatedIssue.title}" has been updated to "${status}".`,
                relatedIssueId: updatedIssue.id,
                relatedProjectId: updatedIssue.project_id,
                createdByUserId: currentUserId,
            });
        }
        // Notify assignee if status changed by someone else (and assignee is not reporter)
        if (updatedIssue.assigned_to_user_id && updatedIssue.assigned_to_user_id !== currentUserId && updatedIssue.assigned_to_user_id !== updatedIssue.reported_by_user_id) {
             await createNotification({
                userId: updatedIssue.assigned_to_user_id,
                message: `The status of an issue assigned to you, "${updatedIssue.title}", has been updated to "${status}".`,
                relatedIssueId: updatedIssue.id,
                relatedProjectId: updatedIssue.project_id,
                createdByUserId: currentUserId,
            });
        }
    }


    if (projectId) {
        revalidatePath(`/projects/${projectId}`);
        revalidatePath(`/projects/${projectId}/dashboard`);
    } else if (updatedIssue?.project_id) {
        revalidatePath(`/projects/${updatedIssue.project_id}`);
        revalidatePath(`/projects/${updatedIssue.project_id}/dashboard`);
    }
    revalidatePath('/notifications'); // For assigned issues list on notifications page

    return { success: true, message: 'Issue status updated successfully.', data: updatedIssue };

  } catch (e: any) {
    console.error('Unexpected error updating issue status:', e);
    return { success: false, message: e.message || 'An unexpected error occurred.' };
  }
}
