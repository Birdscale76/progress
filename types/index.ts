// types/index.ts

/**
 * Represents a Project in the system.
 * Based on the 'projects' table schema.
 */
export interface Project {
  id: string; // UUID
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  name: string; // TEXT NOT NULL
  building_type?: string | null; // TEXT
  status?: string | null; // TEXT, e.g., 'planning', 'in_progress', 'completed', 'on_hold'
  percent_completed: number; // INTEGER DEFAULT 0, CHECK (percent_completed >= 0 AND percent_completed <= 100)
  location?: string | null; // TEXT
  start_date?: string | null; // DATE
  end_date?: string | null; // DATE
  admin_user_id?: string | null; // UUID REFERENCES auth.users(id) ON DELETE SET NULL
  parent_project_id?: string | null; // UUID REFERENCES projects(id) ON DELETE CASCADE
  organization_id?: string | null; // TEXT or UUID
  has_sub_projects: boolean; // BOOLEAN DEFAULT FALSE NOT NULL
  description?: string | null; // Assuming a description field might exist or be added (not in original schema but good for Project Viewer)
}

/**
 * Represents the association between a User and a Project.
 * Based on the 'project_users' table schema.
 */
export interface ProjectUser {
  project_id: string; // UUID REFERENCES projects(id)
  user_id: string; // UUID REFERENCES auth.users(id)
  role: string; // TEXT NOT NULL, e.g., 'admin', 'editor', 'viewer', 'contributor'
  created_at: string; // TIMESTAMPTZ
}

/**
 * Represents an Issue within a Project.
 * Based on the 'issues' table schema.
 */
export interface Issue {
  id: string; // UUID
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  project_id: string; // UUID REFERENCES projects(id)
  reported_by_user_id?: string | null; // UUID REFERENCES auth.users(id) ON DELETE SET NULL
  assigned_to_user_id?: string | null; // UUID REFERENCES auth.users(id) ON DELETE SET NULL
  title: string; // TEXT NOT NULL
  description?: string | null; // TEXT
  status: string; // TEXT DEFAULT 'open' NOT NULL, e.g., 'open', 'in_progress', 'review', 'closed'
  priority?: string | null; // TEXT DEFAULT 'medium', e.g., 'low', 'medium', 'high'

  // Optional: For displaying user details if joined in queries
  assigned_to?: { email?: string | null } | null;
  reported_by?: { email?: string | null } | null;
}

/**
 * Represents a Notification for a User.
 * Based on the 'notifications' table schema.
 */
export interface Notification {
  id: string; // UUID
  created_at: string; // TIMESTAMPTZ
  user_id: string; // UUID REFERENCES auth.users(id)
  message: string; // TEXT NOT NULL
  related_issue_id?: string | null; // UUID REFERENCES issues(id)
  related_project_id?: string | null; // UUID REFERENCES projects(id)
  is_read: boolean; // BOOLEAN DEFAULT FALSE NOT NULL
  created_by_user_id?: string | null; // UUID REFERENCES auth.users(id)
}

/**
 * Represents a Progress Update for a Project.
 * Based on the 'progress_updates' table schema.
 */
export interface ProgressUpdate {
  id: string; // UUID
  created_at: string; // TIMESTAMPTZ
  project_id: string; // UUID REFERENCES projects(id)
  user_id?: string | null; // UUID REFERENCES auth.users(id)
  date: string; // DATE NOT NULL
  manpower_count?: number | null; // INTEGER
  update_text: string; // TEXT NOT NULL
}

/**
 * Represents a Project Attachment's metadata.
 * Based on the 'project_attachments' table schema.
 */
export interface ProjectAttachment {
  id: string; // UUID
  created_at: string; // TIMESTAMPTZ
  project_id: string; // UUID REFERENCES projects(id)
  uploaded_by_user_id?: string | null; // UUID REFERENCES auth.users(id)
  file_name: string; // TEXT NOT NULL
  file_path: string; // TEXT NOT NULL (Could be URL or path in storage)
  storage_bucket?: string | null; // TEXT, e.g., 'project_files'
  storage_object_path?: string | null; // TEXT, e.g., 'project_id/file_name.jpg'
  attachment_type?: string | null; // TEXT, e.g., 'document', 'image', 'link'
  description?: string | null; // TEXT
}


// It's often useful to have a generic type for server action responses
export interface ServerActionResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    message: string;
    details?: any; // Could be validation errors object, etc.
  } | null;
}


// Example of a more specific FormData type, though not explicitly requested to be exhaustive here
// This would typically be co-located with the component or action using it.
export interface ProjectFormData {
  name: string;
  building_type?: string | null;
  status?: string | null;
  percent_completed?: number | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  organization_id?: string | null;
  has_sub_projects?: boolean | null;
  description?: string | null;
}

// If you are using Supabase generated types (e.g., from `supabase gen types typescript --project-id <your-project-id> --schema public > types/supabase.ts`)
// you might have a structure like this:
//
// import { SupabaseClient } from '@supabase/supabase-js';
// import { Database as SupabaseDatabase } from './supabase'; // Assuming your generated types are in supabase.ts
//
// export type AppDatabase = SupabaseDatabase;
// export type Tables<T extends keyof AppDatabase['public']['Tables']> = AppDatabase['public']['Tables'][T]['Row'];
//
// Then you could define your application types based on these generated types, e.g.:
// export type Project = Tables<'projects'>;
// export type Issue = Tables<'issues'>;
// etc.
//
// For this task, I'm defining them manually as requested to match the schema.
// The `Database` type used in actions (`@/types/supabase`) should ideally be this generated type.
// If it is, the interfaces defined here should be compatible.
// For simplicity and to adhere to the prompt, I am not assuming `types/supabase.ts` exists and is populated.
// The path `@/types/supabase` in previous steps was an assumption based on common practice.
// If it refers to a specific file, then these definitions should align or be integrated with it.
// For now, this file `types/index.ts` will be the central point for these specific interfaces.

// To make these types easily usable with Supabase client generic types:
// If you have a global Supabase type (often called `Database` from the generated `supabase.ts`),
// you'd ensure these match or extend those. For example:
/*
  // In your types/supabase.ts (generated or manual)
  export interface Database {
    public: {
      Tables: {
        projects: {
          Row: Project; // Your interface
          Insert: Partial<Project>; // Or more specific insert type
          Update: Partial<Project>; // Or more specific update type
        };
        // ... other tables
      };
      Views: {
        // ... views
      };
      Functions: {
        // ... functions
      };
    };
  }
*/
// This makes `createServerClient<Database>(...)` strongly typed with your interfaces.
// The current definitions are standalone but can be integrated into such a structure.
