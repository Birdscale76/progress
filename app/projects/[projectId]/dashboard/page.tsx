// app/projects/[projectId]/dashboard/page.tsx
import Link from 'next/link';
import { getProjectById, createSubProject, getSubProjects } from '@/app/projects/actions'; // Adjust path
import { notFound } from 'next/navigation';
import { Database } from '@/types/supabase'; // Assuming you have this type definition

type Project = Database['public']['Tables']['projects']['Row'];

type ProjectDashboardPageProps = {
  params: {
    projectId: string;
  };
};

// Simple form for creating a sub-project (can be a separate component)
function CreateSubProjectForm({ parentProjectId }: { parentProjectId: string }) {
  async function handleSubmit(formData: FormData) {
    'use server';

    const subProjectData = {
      name: formData.get('name') as string,
      building_type: formData.get('building_type') as string || undefined,
      status: formData.get('status') as string || 'planning', // Default status
      percent_completed: parseInt(formData.get('percent_completed') as string || '0', 10),
      location: formData.get('location') as string || undefined,
      start_date: formData.get('start_date') as string || undefined,
      end_date: formData.get('end_date') as string || undefined,
      // parent_project_id is handled by createSubProject action
      // admin_user_id is handled by createSubProject action
      has_sub_projects: false, // Sub-projects of sub-projects could be a thing, but default to false
      organization_id: formData.get('organization_id') as string || undefined,
    };

    if (!subProjectData.name) {
      // Handle error - ideally with client-side state
      console.error("Sub-project name is required.");
      return; // Or return error message to display
    }

    const result = await createSubProject(parentProjectId, subProjectData);

    if (result.success) {
      console.log('Sub-project created successfully:', result.subProject);
      // Revalidation is handled in the action, but if you need to show a success message
      // or clear the form, client-side state management would be better.
      // For a server component submitting to an action, a redirect or re-render will occur.
    } else {
      console.error('Failed to create sub-project:', result.message);
      // Display error message to the user
    }
  }

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #0070f3', borderRadius: '5px' }}>
      <h3>Create New Sub-Project</h3>
      <form action={handleSubmit}>
        <div>
          <label htmlFor="name">Sub-Project Name (Required):</label>
          <input type="text" id="name" name="name" required style={{ marginLeft: '5px', marginBottom: '5px' }}/>
        </div>
        <div>
          <label htmlFor="building_type">Building Type:</label>
          <input type="text" id="building_type" name="building_type" style={{ marginLeft: '5px', marginBottom: '5px' }}/>
        </div>
        <div>
          <label htmlFor="status">Status:</label>
          <select id="status" name="status" defaultValue="planning" style={{ marginLeft: '5px', marginBottom: '5px' }}>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div>
          <label htmlFor="percent_completed">Percent Completed (0-100):</label>
          <input type="number" id="percent_completed" name="percent_completed" defaultValue="0" min="0" max="100" style={{ marginLeft: '5px', marginBottom: '5px' }}/>
        </div>
        <div>
          <label htmlFor="location">Location:</label>
          <input type="text" id="location" name="location" style={{ marginLeft: '5px', marginBottom: '5px' }}/>
        </div>
        <div>
          <label htmlFor="start_date">Start Date:</label>
          <input type="date" id="start_date" name="start_date" style={{ marginLeft: '5px', marginBottom: '5px' }}/>
        </div>
        <div>
          <label htmlFor="end_date">End Date:</label>
          <input type="date" id="end_date" name="end_date" style={{ marginLeft: '5px', marginBottom: '5px' }}/>
        </div>
        <div>
          <label htmlFor="organization_id">Organization ID (Optional):</label>
          <input type="text" id="organization_id" name="organization_id" style={{ marginLeft: '5px', marginBottom: '5px' }} />
        </div>
        {/* involvedUsers field omitted for simplicity, similar to main project creation */}
        <button type="submit" style={{ marginTop: '10px', padding: '8px 15px' }}>Create Sub-Project</button>
      </form>
    </div>
  );
}


export default async function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
  const projectId = params.projectId;
  const project = await getProjectById(projectId);

  if (!project) {
    return notFound(); // Renders the not-found UI
  }

  let subProjects: Project[] = [];
  if (project.id) { // Ensure project.id is valid before fetching sub-projects
    subProjects = await getSubProjects(project.id);
  }

  return (
    <div>
      <h1>Project Dashboard</h1>
      <p>Dashboard for Project: <strong>{project.name}</strong> (ID: {projectId})</p>
      <p>This is where project-specific dashboard content, charts, summaries, etc., will go.</p>
      <p>This project {project.has_sub_projects ? `has sub-projects (${subProjects.length} found).` : 'does not have sub-projects yet.'}</p>
      
      {/* Example navigation */}
      <ul>
        <li><Link href={`/projects/${projectId}`}>Back to Project Overview</Link></li>
        <li><Link href={`/projects/${projectId}/issues`}>View Issues</Link></li> {/* Assuming issues page exists */}
        <li><Link href={`/projects/${projectId}/settings`}>Project Settings</Link></li> {/* Assuming settings page exists */}
      </ul>

      {/* Placeholder for dashboard widgets */}
      <div style={{ marginTop: '20px', padding: '10px', border: '1px dashed #ccc' }}>
        <p><em>Dashboard Widget Area 1 (e.g., Progress Summary)</em></p>
      </div>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px dashed #ccc' }}>
        <p><em>Dashboard Widget Area 2 (e.g., Recent Activity)</em></p>
      </div>

      {/* Section for Creating Sub-Projects */}
      <CreateSubProjectForm parentProjectId={projectId} />

      {/* Section for Displaying Sub-Projects */}
      <div style={{ marginTop: '30px' }}>
        <h2>Sub-Projects</h2>
        {subProjects && subProjects.length > 0 ? (
          <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
            {subProjects.map((sub) => (
              <li key={sub.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
                <h4>
                  <Link href={`/projects/${sub.id}`}>{sub.name}</Link>
                </h4>
                <p>Status: {sub.status || 'N/A'}</p>
                <p>Building Type: {sub.building_type || 'N/A'}</p>
                <p>Completion: {sub.percent_completed}%</p>
                <Link href={`/projects/${sub.id}/dashboard`}>Go to Sub-Project Dashboard</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>{project.has_sub_projects ? 'No sub-projects found (they may have been deleted or there was an issue fetching them).' : 'This project has no sub-projects.'}</p>
        )}
      </div>
    </div>
  );
}
