'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/supabase'; // Assuming you have this type definition

type ProjectData = {
  name: string;
  building_type?: string;
  status?: string;
  percent_completed?: number;
  location?: string;
  start_date?: string;
  end_date?: string;
  has_sub_projects?: boolean;
  organization_id?: string;
  parent_project_id?: string | null; // Added for potential sub-projects
};

type InvolvedUser = {
  userId: string;
  role: string;
};

export async function createProject(
  projectData: ProjectData,
  involvedUsers?: InvolvedUser[]
) {
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
    console.error('User not authenticated:', authError);
    return { success: false, message: 'User not authenticated.' };
  }

  const adminUserId = user.id;

  try {
    // Insert into projects table
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          ...projectData,
          admin_user_id: adminUserId,
          updated_at: new Date().toISOString(), // Ensure updated_at is set
        },
      ])
      .select()
      .single();

    if (projectError || !project) {
      console.error('Error creating project:', projectError);
      return { success: false, message: projectError?.message || 'Failed to create project.' };
    }

    // Prepare project_users entries
    const projectUsersToInsert: Array<{ project_id: string; user_id: string; role: string }> = [];

    // Add admin user
    projectUsersToInsert.push({
      project_id: project.id,
      user_id: adminUserId,
      role: 'admin', // Or a specific admin role
    });

    // Add other involved users
    if (involvedUsers) {
      involvedUsers.forEach(iu => {
        projectUsersToInsert.push({
          project_id: project.id,
          user_id: iu.userId,
          role: iu.role,
        });
      });
    }

    const { error: projectUsersError } = await supabase
      .from('project_users')
      .insert(projectUsersToInsert);

    if (projectUsersError) {
      console.error('Error adding project users:', projectUsersError);
      // Potentially rollback project creation or handle partial success
      return { success: false, message: projectUsersError?.message || 'Failed to add project users.' };
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${project.id}`); // Revalidate specific project page if needed
    return { success: true, message: 'Project created successfully.', project };

  } catch (error: any) {
    console.error('Unexpected error creating project:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}

export async function getProjects(
  category: 'recent' | 'owned' | 'involved' | 'organization' | 'all',
  userId: string,
  organizationId?: string | null // Optional organization ID for filtering
): Promise<Database['public']['Tables']['projects']['Row'][]> {
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

  let query = supabase.from('projects').select('*');

  switch (category) {
    case 'recent':
      // RLS will ensure user can only see projects they have access to.
      // We assume 'updated_at' reflects recent activity.
      query = query.order('updated_at', { ascending: false }).limit(10);
      break;
    case 'owned':
      query = query.eq('admin_user_id', userId);
      break;
    case 'involved':
      // This requires a join or a function if RLS doesn't cover it directly
      // For simplicity, RLS should allow users to see projects they are part of.
      // A more specific query might look like:
      const { data: involvedProjectIds, error: involvedError } = await supabase
        .from('project_users')
        .select('project_id')
        .eq('user_id', userId);

      if (involvedError || !involvedProjectIds) {
        console.error('Error fetching involved project IDs:', involvedError);
        return [];
      }
      const pIds = involvedProjectIds.map(pu => pu.project_id);
      if (pIds.length === 0) return [];
      query = query.in('id', pIds);
      break;
    case 'organization':
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      } else {
        // Fallback: fetch projects that have any organization_id set,
        // or return empty if a specific org ID is expected but not provided.
        // This part might need refinement based on exact requirements.
        query = query.not('organization_id', 'is', null);
      }
      break;
    case 'all':
        // No additional filters, RLS handles visibility
        break;
    default:
      console.warn(`Unknown project category: ${category}`);
      return [];
  }

  const { data: projects, error } = await query;

  if (error) {
    console.error(`Error fetching projects for category ${category}:`, error);
    return [];
  }

  return projects || [];
}

// Example function to get a single project - useful for project viewer pages
export async function getProjectById(projectId: string) {
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

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error(`Error fetching project by ID ${projectId}:`, error);
    return null;
  }

  return project;
}

export async function createSubProject(
  parentProjectId: string,
  subProjectData: ProjectData,
  involvedUsers?: InvolvedUser[]
) {
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
    console.error('User not authenticated for sub-project creation:', authError);
    return { success: false, message: 'User not authenticated.' };
  }

  const adminUserId = user.id;

  try {
    // 1. Insert the new sub-project
    const { data: subProject, error: subProjectError } = await supabase
      .from('projects')
      .insert([
        {
          ...subProjectData,
          admin_user_id: adminUserId,
          parent_project_id: parentProjectId,
          updated_at: new Date().toISOString(),
          // Ensure has_sub_projects for a new sub-project defaults to false or is explicitly set
          has_sub_projects: subProjectData.has_sub_projects || false,
        },
      ])
      .select()
      .single();

    if (subProjectError || !subProject) {
      console.error('Error creating sub-project:', subProjectError);
      return { success: false, message: subProjectError?.message || 'Failed to create sub-project.' };
    }

    // 2. Update the parent project to set has_sub_projects = true
    const { error: parentUpdateError } = await supabase
      .from('projects')
      .update({ has_sub_projects: true, updated_at: new Date().toISOString() })
      .eq('id', parentProjectId);

    if (parentUpdateError) {
      console.warn('Failed to update parent project `has_sub_projects` flag:', parentUpdateError);
      // This might not be a critical failure, depending on requirements.
      // For now, we'll log a warning but proceed.
    }

    // 3. Prepare project_users entries for the sub-project
    const projectUsersToInsert: Array<{ project_id: string; user_id: string; role: string }> = [];
    projectUsersToInsert.push({
      project_id: subProject.id,
      user_id: adminUserId,
      role: 'admin', // Or a specific admin role for sub-projects
    });

    if (involvedUsers) {
      involvedUsers.forEach(iu => {
        projectUsersToInsert.push({
          project_id: subProject.id,
          user_id: iu.userId,
          role: iu.role,
        });
      });
    }

    const { error: projectUsersError } = await supabase
      .from('project_users')
      .insert(projectUsersToInsert);

    if (projectUsersError) {
      console.error('Error adding project users to sub-project:', projectUsersError);
      // Consider rollback or cleanup if this fails
      return { success: false, message: projectUsersError?.message || 'Failed to add users to sub-project.' };
    }

    revalidatePath(`/projects/${parentProjectId}/dashboard`);
    revalidatePath(`/projects/${parentProjectId}`); // Parent project page
    revalidatePath(`/projects/${subProject.id}`); // New sub-project page
    revalidatePath('/projects'); // Main projects list

    return { success: true, message: 'Sub-project created successfully.', subProject };

  } catch (error: any) {
    console.error('Unexpected error creating sub-project:', error);
    return { success: false, message: error.message || 'An unexpected error occurred during sub-project creation.' };
  }
}

// Optional Refinement for createProject:
// The current createProject action already includes `has_sub_projects` in ProjectData.
// If `has_sub_projects` is passed as true, it will be set.
// No specific default action seems needed beyond what's there, as sub-projects are actively created.
// The `has_sub_projects` field in the parent is primarily managed by `createSubProject`.

export async function getSubProjects(parentProjectId: string): Promise<Database['public']['Tables']['projects']['Row'][]> {
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

  // Assuming RLS policies on 'projects' table are sufficient.
  // If a user can view the parent project (which they must to be on its dashboard),
  // they should typically be able to see its direct sub-projects.
  // The existing policy "Users can view projects they are part of or admin of" might cover this
  // if being "part of" the parent implies visibility into its sub-project structure,
  // or if the sub-projects themselves have the user listed in project_users or as admin.
  // If sub-project visibility is more restrictive or different, RLS might need adjustment.
  const { data: subProjects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('parent_project_id', parentProjectId)
    .order('created_at', { ascending: true }); // Or by name, etc.

  if (error) {
    console.error(`Error fetching sub-projects for parent ${parentProjectId}:`, error);
    return [];
  }

  return subProjects || [];
}
