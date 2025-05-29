-- ###################################################################################
-- #                                                                                 #
-- #                       SAMPLE DATA SEEDING SCRIPT                                #
-- #                                                                                 #
-- ###################################################################################
--
-- IMPORTANT INSTRUCTIONS:
--
-- 1. CREATE TEST USERS:
--    Before running this script, create 2 or 3 test users in your Supabase project.
--    You can do this through your application's sign-up page or directly in the
--    Supabase Studio (Dashboard -> Authentication -> Users -> Add user).
--
-- 2. OBTAIN USER UUIDs:
--    After creating the users, go to the Supabase Studio (Dashboard -> Authentication -> Users).
--    Click on each user to see their details, and copy their 'ID' (which is a UUID).
--
-- 3. REPLACE PLACEHOLDERS:
--    In this script, you will find placeholders like:
--      'YOUR_USER_ID_1_HERE'
--      'YOUR_USER_ID_2_HERE'
--      'YOUR_USER_ID_3_HERE' (if you create a third user)
--    You MUST replace these placeholders with the actual User UUIDs you copied in step 2.
--    Use a text editor's "Find and Replace" feature for this.
--
-- 4. RUNNING THE SCRIPT:
--    Execute this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
--    It's recommended to run this on a fresh database or after clearing existing
--    data from these tables if you want a clean seed.
--
-- NOTE:
--    - This script assumes the `uuid-ossp` extension is enabled for `uuid_generate_v4()`.
--      If not, enable it with: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
--    - Primary keys (id fields) for new records are mostly generated using `uuid_generate_v4()`.
--    - Timestamps are generally set using `NOW()`.
--
-- ###################################################################################

-- Clear existing data (optional, uncomment if you want a fresh start)
-- DELETE FROM notifications;
-- DELETE FROM project_attachments;
-- DELETE FROM progress_updates;
-- DELETE FROM issues;
-- DELETE FROM project_users;
-- DELETE FROM projects;


-- ###################################################################################
-- SECTION 1: PROJECTS
-- ###################################################################################
DO $$
DECLARE
    project_id_1 UUID := uuid_generate_v4();
    project_id_2 UUID := uuid_generate_v4();
    project_id_3 UUID := uuid_generate_v4(); -- This will be a sub-project of project_id_1
BEGIN

INSERT INTO projects (id, name, building_type, status, percent_completed, location, start_date, end_date, admin_user_id, has_sub_projects, organization_id, description) VALUES
(
    project_id_1,
    'Downtown Tower Renovation',
    'Commercial High-Rise',
    'in_progress',
    45,
    '123 Main St, Anytown, USA',
    '2023-01-15',
    '2024-12-31',
    'YOUR_USER_ID_1_HERE', -- Replace with actual User ID
    TRUE, -- This project will have a sub-project
    'org_mega_corp_abc',
    'Complete overhaul of a 20-story office building, including facade, interiors, and HVAC systems. Aiming for LEED Gold certification.'
),
(
    project_id_2,
    'Suburbia Residential Complex',
    'Residential Apartments',
    'planning',
    5,
    '456 Oak Ln, Suburbville, USA',
    '2023-06-01',
    '2025-06-30',
    'YOUR_USER_ID_2_HERE', -- Replace with actual User ID
    FALSE,
    'org_friendly_builders_xyz',
    'Development of a new residential complex with 150 units, community garden, and underground parking. Focus on sustainable materials.'
),
(
    project_id_3,
    'Downtown Tower - Interior Fit-out Phase 1',
    'Commercial Interiors',
    'in_progress',
    20,
    '123 Main St, Anytown, USA - Floors 1-5',
    '2023-07-01',
    '2024-03-30',
    'YOUR_USER_ID_1_HERE', -- Replace with actual User ID (can be same admin or different)
    FALSE,
    'org_mega_corp_abc',
    'Sub-project focusing on the interior fit-out for the first 5 floors of the Downtown Tower. Includes office spaces and common areas.',
    project_id_1 -- parent_project_id, linking to 'Downtown Tower Renovation'
);

-- ###################################################################################
-- SECTION 2: PROJECT USERS (Associating Users with Projects)
-- ###################################################################################

INSERT INTO project_users (project_id, user_id, role) VALUES
-- Project 1: Downtown Tower Renovation
(project_id_1, 'YOUR_USER_ID_1_HERE', 'admin'),    -- User 1 is admin
(project_id_1, 'YOUR_USER_ID_2_HERE', 'editor'),   -- User 2 is editor
(project_id_1, 'YOUR_USER_ID_3_HERE', 'viewer'),   -- User 3 (if exists) is viewer

-- Project 2: Suburbia Residential Complex
(project_id_2, 'YOUR_USER_ID_2_HERE', 'admin'),    -- User 2 is admin
(project_id_2, 'YOUR_USER_ID_1_HERE', 'contributor'), -- User 1 is contributor

-- Project 3: Downtown Tower - Interior Fit-out (Sub-project)
(project_id_3, 'YOUR_USER_ID_1_HERE', 'admin'),    -- User 1 is admin of sub-project
(project_id_3, 'YOUR_USER_ID_2_HERE', 'editor');   -- User 2 is also editor here

-- ###################################################################################
-- SECTION 3: ISSUES
-- ###################################################################################
DECLARE
    issue_id_1 UUID := uuid_generate_v4();
    issue_id_2 UUID := uuid_generate_v4();
    issue_id_3 UUID := uuid_generate_v4();
    issue_id_4 UUID := uuid_generate_v4();
BEGIN

INSERT INTO issues (id, project_id, reported_by_user_id, assigned_to_user_id, title, description, status, priority) VALUES
(
    issue_id_1,
    project_id_1, -- Downtown Tower Renovation
    'YOUR_USER_ID_2_HERE', -- Reported by User 2
    'YOUR_USER_ID_1_HERE', -- Assigned to User 1 (Admin)
    'HVAC Unit on Floor 10 malfunctioning',
    'The HVAC unit on the 10th floor is not providing adequate cooling. Needs immediate inspection and repair.',
    'open',
    'high'
),
(
    issue_id_2,
    project_id_1, -- Downtown Tower Renovation
    'YOUR_USER_ID_3_HERE', -- Reported by User 3
    'YOUR_USER_ID_2_HERE', -- Assigned to User 2 (Editor)
    'Window crack on West facade, 3rd floor',
    'A small crack was observed on one of the newly installed window panes on the 3rd floor, west side.',
    'in_progress',
    'medium'
),
(
    issue_id_3,
    project_id_2, -- Suburbia Residential Complex
    'YOUR_USER_ID_1_HERE', -- Reported by User 1
    NULL,                 -- Unassigned
    'Permit for community garden pending approval',
    'The permit application for the community garden area is still pending with the city council. Follow up needed.',
    'open',
    'low'
),
(
    issue_id_4,
    project_id_3, -- Downtown Tower - Interior Fit-out
    'YOUR_USER_ID_1_HERE', -- Reported by User 1
    'YOUR_USER_ID_1_HERE', -- Assigned to self
    'Paint color mismatch in lobby area',
    'The paint color applied in the main lobby does not match the approved swatch. Needs repainting with correct color code PX-789.',
    'review',
    'medium'
);

-- ###################################################################################
-- SECTION 4: PROGRESS UPDATES
-- ###################################################################################

INSERT INTO progress_updates (project_id, user_id, date, manpower_count, update_text) VALUES
(
    project_id_1, -- Downtown Tower Renovation
    'YOUR_USER_ID_1_HERE',
    NOW() - INTERVAL '1 day',
    75,
    'Facade cleaning completed for North and East sides. Window installation ongoing on floors 12-15.'
),
(
    project_id_1, -- Downtown Tower Renovation
    'YOUR_USER_ID_2_HERE',
    NOW() - INTERVAL '2 days',
    12,
    'Electrical wiring for floors 6-8 finalized. Inspected and approved.'
),
(
    project_id_3, -- Downtown Tower - Interior Fit-out
    'YOUR_USER_ID_1_HERE',
    NOW() - INTERVAL '1 day',
    25,
    'Drywall installation for office spaces on Floor 1 is 80% complete. Material delivery for Floor 2 scheduled for tomorrow.'
),
(
    project_id_2, -- Suburbia Residential Complex
    'YOUR_USER_ID_2_HERE',
    NOW() - INTERVAL '3 days',
    5,
    'Site survey completed. Soil testing results received and are favorable. Foundation layout planning initiated.'
);

-- ###################################################################################
-- SECTION 5: PROJECT ATTACHMENTS (Metadata Only)
-- ###################################################################################

INSERT INTO project_attachments (project_id, uploaded_by_user_id, file_name, file_path, storage_bucket, storage_object_path, attachment_type, description) VALUES
(
    project_id_1, -- Downtown Tower Renovation
    'YOUR_USER_ID_1_HERE',
    'Architectural_Blueprints_Rev3.pdf',
    '/uploads/project_id_1/Architectural_Blueprints_Rev3.pdf', -- Placeholder path
    'project_files', -- Example bucket
    'project_id_1/Architectural_Blueprints_Rev3.pdf', -- Example object path
    '2d_drawing',
    'Revised architectural blueprints for Downtown Tower, Revision 3.'
),
(
    project_id_1,
    'YOUR_USER_ID_2_HERE',
    'Site_Safety_Plan.docx',
    '/uploads/project_id_1/Site_Safety_Plan.docx',
    'project_files',
    'project_id_1/Site_Safety_Plan.docx',
    'document',
    'Comprehensive site safety plan including emergency procedures.'
),
(
    project_id_2, -- Suburbia Residential Complex
    'YOUR_USER_ID_2_HERE',
    '3D_Model_Exterior_View.png',
    '/uploads/project_id_2/3D_Model_Exterior_View.png',
    'project_files',
    'project_id_2/3D_Model_Exterior_View.png',
    'image',
    '3D rendering of the final exterior look for the Suburbia Complex.'
),
(
    project_id_3, -- Downtown Tower - Interior Fit-out
    'YOUR_USER_ID_1_HERE',
    'Material_Spec_Sheet_Flooring.xlsx',
    '/uploads/project_id_3/Material_Spec_Sheet_Flooring.xlsx',
    'project_files',
    'project_id_3/Material_Spec_Sheet_Flooring.xlsx',
    'document',
    'Specification sheet for all flooring materials to be used in Phase 1 interiors.'
);

-- ###################################################################################
-- SECTION 6: NOTIFICATIONS
-- ###################################################################################

INSERT INTO notifications (user_id, message, related_issue_id, related_project_id, is_read, created_by_user_id) VALUES
(
    'YOUR_USER_ID_1_HERE', -- User 1 (Admin of Project 1)
    'New issue reported: HVAC Unit on Floor 10 malfunctioning',
    issue_id_1, -- Link to the HVAC issue
    project_id_1,
    FALSE,
    'YOUR_USER_ID_2_HERE' -- Created by User 2 (who reported it)
),
(
    'YOUR_USER_ID_2_HERE', -- User 2 (Assigned to window crack issue)
    'Issue assigned to you: Window crack on West facade, 3rd floor',
    issue_id_2,
    project_id_1,
    FALSE,
    'YOUR_USER_ID_3_HERE' -- Could be system or reporter
),
(
    'YOUR_USER_ID_1_HERE',
    'Progress update submitted for Downtown Tower Renovation by user YOUR_USER_ID_2_HERE',
    NULL,
    project_id_1,
    TRUE, -- Example of a read notification
    'YOUR_USER_ID_2_HERE' -- Or system if automated
),
(
    'YOUR_USER_ID_2_HERE', -- User 2 (Admin of Project 2)
    'A new permit issue requires attention for Suburbia Residential Complex.',
    issue_id_3,
    project_id_2,
    FALSE,
    'YOUR_USER_ID_1_HERE'
);

END $$;
-- ###################################################################################
-- END OF SEEDING SCRIPT
-- ###################################################################################
-- Remember to replace all 'YOUR_USER_ID_X_HERE' placeholders with actual UUIDs.
-- ###################################################################################
