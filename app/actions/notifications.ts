'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/supabase'; // Adjust path as necessary

type NotificationData = {
  userId: string;
  message: string;
  relatedIssueId?: string | null;
  relatedProjectId?: string | null;
  createdByUserId?: string | null;
};

export async function createNotification(data: NotificationData) {
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

  // This is an internal helper, so auth check might be redundant if called by authenticated actions.
  // However, good for safety if it could be invoked from other contexts.
  const { data: { user: actingUser } , error: authError } = await supabase.auth.getUser();
  if (authError || !actingUser) {
    console.error('Auth error during notification creation attempt:', authError);
    return { success: false, message: 'Authentication required to create notification.' };
  }

  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.userId,
        message: data.message,
        related_issue_id: data.relatedIssueId,
        related_project_id: data.relatedProjectId,
        created_by_user_id: data.createdByUserId || actingUser.id, // Default to acting user if not specified
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, message: error.message || 'Failed to create notification.' };
    }
    
    // Revalidate the notifications page for the user receiving the notification
    // This is tricky as revalidatePath works for the current user's browser session.
    // Real-time updates or specific user revalidation would need more advanced setup (e.g., websockets, specific user targeting).
    // For now, we'll rely on the user visiting their notifications page to see updates.
    // console.log(`Notification created for user ${data.userId}. Consider revalidating their /notifications path if possible.`);

    return { success: true, message: 'Notification created.', notification };

  } catch (e: any) {
    console.error('Unexpected error creating notification:', e);
    return { success: false, message: e.message || 'An unexpected error occurred.' };
  }
}

export async function getUserNotifications(): Promise<Database['public']['Tables']['notifications']['Row'][]> {
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
    console.error('User not authenticated for fetching notifications:', authError);
    return [];
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
  return data || [];
}

export async function markNotificationRead(formData: FormData) {
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
    console.error('User not authenticated for marking notification read:', authError);
    return { success: false, message: 'User not authenticated.' };
  }

  const notificationId = formData.get('notificationId') as string;
  if (!notificationId) {
    return { success: false, message: 'Notification ID is required.' };
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id); // Ensure user can only update their own notifications

    if (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, message: error.message || 'Failed to mark notification as read.' };
    }

    revalidatePath('/notifications');
    return { success: true, message: 'Notification marked as read.' };

  } catch (e: any) {
    console.error('Unexpected error marking notification read:', e);
    return { success: false, message: e.message || 'An unexpected error occurred.' };
  }
}

export async function getAssignedIssues(): Promise<Database['public']['Tables']['issues']['Row'][]> {
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
    console.error('User not authenticated for fetching assigned issues:', authError);
    return [];
  }

  const { data, error } = await supabase
    .from('issues')
    .select('*') // You might want to select project name or other details via join
    .eq('assigned_to_user_id', user.id)
    .not('status', 'eq', 'closed') // Exclude closed issues
    .order('priority', { ascending: false }) // Example: order by priority
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching assigned issues:', error);
    return [];
  }
  return data || [];
}
