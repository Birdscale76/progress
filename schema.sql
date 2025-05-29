-- Enable RLS for all new tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated, service_role;

-- PROJECTS Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    building_type TEXT,
    status TEXT, -- e.g., 'planning', 'in_progress', 'completed', 'on_hold'
    percent_completed INTEGER DEFAULT 0 CHECK (percent_completed >= 0 AND percent_completed <= 100),
    location TEXT,
    start_date DATE,
    end_date DATE,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    parent_project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- For sub-projects
    organization_id TEXT, -- Or UUID if organizations have their own table
    has_sub_projects BOOLEAN DEFAULT FALSE NOT NULL
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on projects table
CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects table
CREATE POLICY "Users can view projects they are part of or admin of"
  ON projects FOR SELECT
  USING (
    auth.uid() = admin_user_id OR
    EXISTS (
      SELECT 1 FROM project_users pu WHERE pu.project_id = projects.id AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = admin_user_id); -- Creator must be admin

CREATE POLICY "Project admins can update their projects"
  ON projects FOR UPDATE
  USING (auth.uid() = admin_user_id)
  WITH CHECK (auth.uid() = admin_user_id);

CREATE POLICY "Project admins can delete their projects"
  ON projects FOR DELETE
  USING (auth.uid() = admin_user_id);


-- PROJECT_USERS Table (Many-to-Many relationship between projects and users)
CREATE TABLE project_users (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL, -- e.g., 'admin', 'editor', 'viewer', 'contributor'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (project_id, user_id)
);

-- Enable RLS for project_users table
ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;

-- Policies for project_users table
CREATE POLICY "Users can view their own project associations"
  ON project_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Project admins can manage users in their projects"
  ON project_users FOR ALL -- INSERT, UPDATE, DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_users.project_id AND p.admin_user_id = auth.uid()
    )
  )
  WITH CHECK ( -- Ensure users are added to projects where current user is admin
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_users.project_id AND p.admin_user_id = auth.uid()
    )
  );


-- ISSUES Table
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    reported_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' NOT NULL, -- e.g., 'open', 'in_progress', 'review', 'closed'
    priority TEXT DEFAULT 'medium' -- e.g., 'low', 'medium', 'high'
);

-- Trigger to update updated_at on issues table
CREATE TRIGGER set_issues_updated_at
BEFORE UPDATE ON issues
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS for issues table
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Policies for issues table
CREATE POLICY "Users can view issues in projects they are part of"
  ON issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_users pu WHERE pu.project_id = issues.project_id AND pu.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = issues.project_id AND p.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create issues in projects they are part of"
  ON issues FOR INSERT
  WITH CHECK (
    (EXISTS (
      SELECT 1 FROM project_users pu WHERE pu.project_id = issues.project_id AND pu.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = issues.project_id AND p.admin_user_id = auth.uid()
    ))
    AND (reported_by_user_id = auth.uid()) -- Reporter must be current user
  );

CREATE POLICY "Assigned users or project admins can update issues"
  ON issues FOR UPDATE
  USING (
    auth.uid() = assigned_to_user_id OR
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = issues.project_id AND p.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can delete issues"
  ON issues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = issues.project_id AND p.admin_user_id = auth.uid()
    )
  );

-- NOTIFICATIONS Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- The user who receives the notification
    message TEXT NOT NULL,
    related_issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    related_project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL -- User who triggered the notification (optional)
);

-- Enable RLS for notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications table
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their own notifications as read/unread"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No insert policy for users directly; notifications should be created by system triggers or server-side logic.
-- No delete policy for users directly; perhaps an archive mechanism or TTL later.


-- PROGRESS_UPDATES Table
CREATE TABLE progress_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who submitted the update
    date DATE NOT NULL,
    manpower_count INTEGER,
    update_text TEXT NOT NULL
);

-- Enable RLS for progress_updates table
ALTER TABLE progress_updates ENABLE ROW LEVEL SECURITY;

-- Policies for progress_updates table
CREATE POLICY "Users can view progress updates for projects they are part of"
  ON progress_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_users pu WHERE pu.project_id = progress_updates.project_id AND pu.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = progress_updates.project_id AND p.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Users involved in a project (or admin) can create progress updates"
  ON progress_updates FOR INSERT
  WITH CHECK (
    (EXISTS (
      SELECT 1 FROM project_users pu WHERE pu.project_id = progress_updates.project_id AND pu.user_id = auth.uid() AND pu.role IN ('admin', 'editor', 'contributor')
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = progress_updates.project_id AND p.admin_user_id = auth.uid()
    ))
    AND (user_id = auth.uid()) -- Submitter must be current user
  );

CREATE POLICY "Project admins or original submitter can update/delete their progress updates"
  ON progress_updates FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = progress_updates.project_id AND p.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Project admins or original submitter can delete their progress updates"
  ON progress_updates FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = progress_updates.project_id AND p.admin_user_id = auth.uid()
    )
  );


-- PROJECT_ATTACHMENTS Table
CREATE TABLE project_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    uploaded_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- This could be a path in Supabase Storage
    storage_bucket TEXT, -- e.g., 'project_files'
    storage_object_path TEXT, -- e.g., 'project_id/file_name.jpg'
    attachment_type TEXT, -- e.g., 'document', 'image', '360_walkthrough_link', '2d_drawing', '3d_model_link'
    description TEXT
);

-- Enable RLS for project_attachments table
ALTER TABLE project_attachments ENABLE ROW LEVEL SECURITY;

-- Policies for project_attachments table
CREATE POLICY "Users can view attachments for projects they are part of"
  ON project_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_users pu WHERE pu.project_id = project_attachments.project_id AND pu.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_attachments.project_id AND p.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Users involved in a project (or admin) can upload attachments"
  ON project_attachments FOR INSERT
  WITH CHECK (
    (EXISTS (
      SELECT 1 FROM project_users pu WHERE pu.project_id = project_attachments.project_id AND pu.user_id = auth.uid() AND pu.role IN ('admin', 'editor', 'contributor')
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_attachments.project_id AND p.admin_user_id = auth.uid()
    ))
    AND (uploaded_by_user_id = auth.uid()) -- Uploader must be current user
  );

CREATE POLICY "Project admins or original uploader can delete attachments"
  ON project_attachments FOR DELETE
  USING (
    auth.uid() = uploaded_by_user_id OR
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_attachments.project_id AND p.admin_user_id = auth.uid()
    )
  );

-- Ensure Supabase storage buckets are created separately if using Supabase Storage.
-- For example, a bucket named 'project_files'.

-- Setup an example storage bucket (run this in Supabase SQL editor if needed, or create via UI)
-- Note: This part is a comment for the user; the worker can't execute this directly against a live Supabase instance.
-- Make sure a bucket like 'project_files' exists if you plan to use Supabase Storage for attachments.
-- Example:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project_files', 'project_files', false)
-- ON CONFLICT (id) DO NOTHING;

-- CREATE POLICY "Project members can manage files in their project folders"
--   ON storage.objects FOR ALL
--   USING (
--     bucket_id = 'project_files' AND
--     (
--       (auth.uid() = owner) OR -- Allow owner to do anything
--       ( -- Allow project members to access files based on project_id in path
--         EXISTS (
--           SELECT 1 FROM projects p
--           JOIN project_users pu ON p.id = pu.project_id
--           WHERE pu.user_id = auth.uid()
--           AND storage.foldername(name)[1] = p.id::text -- Assumes files are stored like /project_id/filename
--         )
--       ) OR
--       ( -- Allow project admins to access files based on project_id in path
--         EXISTS (
--           SELECT 1 FROM projects p
--           WHERE p.admin_user_id = auth.uid()
--           AND storage.foldername(name)[1] = p.id::text -- Assumes files are stored like /project_id/filename
--         )
--       )
--     )
--   );

-- Consider adding indexes for frequently queried columns, e.g.,
-- CREATE INDEX idx_projects_admin_user_id ON projects(admin_user_id);
-- CREATE INDEX idx_projects_parent_project_id ON projects(parent_project_id);
-- CREATE INDEX idx_project_users_user_id ON project_users(user_id);
-- CREATE INDEX idx_issues_project_id ON issues(project_id);
-- CREATE INDEX idx_issues_assigned_to_user_id ON issues(assigned_to_user_id);
-- CREATE INDEX idx_notifications_user_id ON notifications(user_id);
-- CREATE INDEX idx_progress_updates_project_id ON progress_updates(project_id);
-- CREATE INDEX idx_project_attachments_project_id ON project_attachments(project_id);

```
