// app/projects/create/page.tsx
import { createProject } from '@/app/projects/actions'; // Adjust path as necessary
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Helper to get current user (can be moved to a utility file)
async function getCurrentUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
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
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (e) {
    console.error("Error getting user:", e);
    return null;
  }
}


export default async function CreateProjectPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <p>You need to be logged in to create a project.</p>;
  }

  async function handleSubmit(formData: FormData) {
    'use server';

    const projectData = {
      name: formData.get('name') as string,
      building_type: formData.get('building_type') as string || undefined,
      status: formData.get('status') as string || undefined,
      percent_completed: parseInt(formData.get('percent_completed') as string || '0', 10),
      location: formData.get('location') as string || undefined,
      start_date: formData.get('start_date') as string || undefined,
      end_date: formData.get('end_date') as string || undefined,
      has_sub_projects: formData.get('has_sub_projects') === 'on',
      organization_id: formData.get('organization_id') as string || undefined,
      // parent_project_id: null, // Or get from form if creating a sub-project
    };

    // Basic validation
    if (!projectData.name) {
      // This feedback should ideally be handled more gracefully on the client
      console.error("Project name is required");
      return;
    }
    
    // For simplicity, involvedUsers is not handled in this form.
    // It could be added with a more complex input mechanism.
    const result = await createProject(projectData);

    if (result.success) {
      console.log('Project created successfully:', result.project);
      // Redirect or show success message. Next.js server actions can redirect.
      // For now, just log. A client-side redirect or message display would be typical.
      // After a successful server action that modifies data and uses revalidatePath,
      // Next.js will typically handle navigation or data refresh if you navigate away
      // and back or if the revalidated path is the current one.
    } else {
      console.error('Failed to create project:', result.message);
      // Show error message to the user
    }
  }

  return (
    <div>
      <h1>Create New Project</h1>
      {/* 
        A client component would typically be used here for better UX 
        (state management for form, client-side validation, displaying server messages).
        For simplicity, this is a server component with a form submitting to a server action.
      */}
      <form action={handleSubmit}>
        <div>
          <label htmlFor="name">Project Name (Required):</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="building_type">Building Type:</label>
          <input type="text" id="building_type" name="building_type" />
        </div>
        <div>
          <label htmlFor="status">Status:</label>
          <select id="status" name="status">
            <option value="">Select Status</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div>
          <label htmlFor="percent_completed">Percent Completed (0-100):</label>
          <input type="number" id="percent_completed" name="percent_completed" defaultValue="0" min="0" max="100" />
        </div>
        <div>
          <label htmlFor="location">Location:</label>
          <input type="text" id="location" name="location" />
        </div>
        <div>
          <label htmlFor="start_date">Start Date:</label>
          <input type="date" id="start_date" name="start_date" />
        </div>
        <div>
          <label htmlFor="end_date">End Date:</label>
          <input type="date" id="end_date" name="end_date" />
        </div>
        <div>
          <label htmlFor="organization_id">Organization ID (Optional):</label>
          <input type="text" id="organization_id" name="organization_id" />
        </div>
        <div>
          <input type="checkbox" id="has_sub_projects" name="has_sub_projects" />
          <label htmlFor="has_sub_projects">Has Sub-Projects (note: sub-project creation UI not implemented here)</label>
        </div>
        
        {/* 
          Field for parent_project_id would be needed if creating sub-projects directly.
          Field for involvedUsers would require a more complex UI (e.g., dynamic list of inputs).
          For now, only the admin user (creator) is automatically added.
        */}
        
        <button type="submit">Create Project</button>
      </form>
      {/* Basic feedback can be handled by re-rendering or using client components for toasts/alerts */}
    </div>
  );
}
