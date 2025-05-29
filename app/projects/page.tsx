// app/projects/page.tsx
import Link from 'next/link';
import { getProjects } from '@/app/projects/actions'; // Adjust path as necessary
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/supabase'; // Assuming you have this
import ProjectCard from '@/components/shared/ProjectCard'; // Import ProjectCard
import type { Project } from '@/types/index'; // Assuming this path is correct for your Project type

// Helper to get current user (can be moved to a utility file)
async function getCurrentUser() {
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
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (e) {
    console.error("Error getting user:", e);
    return null;
  }
}

// Updated ProjectList to use ProjectCard
function ProjectList({ title, projects }: { title: string; projects: Project[] }) {
  if (!projects || projects.length === 0) {
    return (
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5em', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>{title}</h2>
        <p>No projects found in this category.</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '30px' }}>
      <h2 style={{ fontSize: '1.5em', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

export default async function ProjectsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div>
        <p>You need to be logged in to view projects.</p>
        <Link href="/auth/login">Login</Link> {/* Adjust login path as needed */}
      </div>
    );
  }

  // Fetch projects for different categories
  // Note: For 'organization' projects, you might need to fetch the user's organization_id first
  // or pass a specific one if available. For this example, we'll fetch all projects with an org_id.
  const ownedProjects = await getProjects('owned', user.id) as Project[];
  const involvedProjects = await getProjects('involved', user.id) as Project[];
  const recentProjects = await getProjects('recent', user.id) as Project[];
  // const organizationProjects = await getProjects('organization', user.id, user.organization_id_if_available);
  // For now, let's assume a simpler call for organization or skip if no specific org ID is readily available
  const organizationProjects = await getProjects('organization', user.id, null) as Project[];

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2em' }}>Projects Dashboard</h1>
        <Link 
          href="/projects/create" 
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px' 
          }}
        >
          + Create New Project
        </Link>
      </div>
      
      <ProjectList title="My Recently Updated Projects" projects={recentProjects} />
      <ProjectList title="Projects I Own (Admin)" projects={ownedProjects} />
      <ProjectList title="Projects I'm Involved In" projects={involvedProjects} />
      {/* <ProjectList title="Organization Projects" projects={organizationProjects} /> */}
      {/* Example of fetching all projects - RLS should ensure only accessible ones are shown */}
      {/* <ProjectList title="All Accessible Projects" projects={await getProjects('all', user.id) as Project[]} /> */}
    </div>
  );
}
