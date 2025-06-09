// app/projects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

interface Project {
  id: string;
  name: string;
  building_type: string | null;
  status: string | null;
  percent_complete: number | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  admin_id: string;
  project_members?: { user_id: string; role: string }[];
}

export default function ProjectsPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      setLoading(true);
      let query = supabase
        .from('projects')
        .select('*, project_members(role, user_id)');

      if (search) {
        query = query
          .ilike('name', `%${search}%`)
          .or(`location.ilike.%${search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) console.error('Fetch error:', error.message);
      else if (data) setProjects(data as Project[]);
      setLoading(false);
    })();
  }, [session, search, supabase]);

  const userId = session?.user?.id;

  return (
    <div className="mt-4 px-6 md:px-12 lg:px-16">
      {/* <h1 className="text-base md:text-lg font-semibold mb-4">Projects</h1> */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 max-w-3xl mx-auto">
      <input
        type="text"
        placeholder="Search projects..."
        className="flex-grow border rounded px-3 py-2 w-full sm:w-auto"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded whitespace-nowrap">
        Add Project
      </button>
    </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => {
            // Determine role (optional)
            const member = proj.project_members?.find(pm => pm.user_id === userId);
            const role = member?.role || (proj.admin_id === userId ? 'admin' : '');

            return (
              <div
                key={proj.id}
                className="border rounded-2xl shadow p-4 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2">{proj.name}</h2>
                <p className="text-sm mb-1">
                  <span className="font-medium">Start:</span> {proj.start_date ?? '-'}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">End:</span> {proj.end_date ?? '-'}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Status:</span> {proj.status ?? 'N/A'}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Progress:</span> {proj.percent_complete ?? 0}%
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-xs capitalize">
                    {role}
                  </span>
                  <button className="text-blue-600 hover:underline text-sm">
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

