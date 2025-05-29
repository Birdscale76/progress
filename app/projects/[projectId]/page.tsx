import Link from 'next/link';
import { getProjectById } from '@/app/projects/actions';
import { createProgressUpdate, getProgressUpdates } from '@/app/actions/progress';
import { createIssue, getProjectIssues } from '@/app/actions/issues';
import { createAttachmentMetadata, getProjectAttachments } from '@/app/actions/attachments';
import { notFound } from 'next/navigation';
import { Database } from '@/types/supabase'; // Assuming this path is correct
import type { 
  Project, 
  ProgressUpdate as ProgressUpdateType, 
  Issue as IssueType, 
  ProjectAttachment as AttachmentType 
} from '@/types/index'; // Using types from types/index.ts

import Link from 'next/link';
import PageSection from '@/components/shared/PageSection';
import ListItem from '@/components/shared/ListItem';
import StatusBadge from '@/components/shared/StatusBadge';


// Helper function to format date strings (optional)
function formatDate(dateString: string | null | undefined, includeTime: boolean = false) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return includeTime ? date.toLocaleString() : date.toLocaleDateString();
  } catch(e) {
    return 'Invalid Date';
  }
}

type ProjectViewerPageProps = {
  params: {
    projectId: string;
  };
};


export default async function ProjectViewerPage({ params }: ProjectViewerPageProps) {
  const projectId = params.projectId;

  // This is a server component, so direct project fetching is fine.
  // In a client component, you might use a custom hook or useEffect.
  // For now, this is a placeholder and doesn't use getProjectById from app/projects/actions.ts
  // It should be:
  const { getProjectById } = await import('@/app/projects/actions');
  const project: Project | null = await getProjectById(projectId);


  if (!project) {
    return notFound();
  }

  const progressUpdates: ProgressUpdateType[] = await getProgressUpdates(projectId);
  const issues: IssueType[] = await getProjectIssues(projectId);
  const attachments: AttachmentType[] = await getProjectAttachments(projectId);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/projects" style={{ color: '#0070f3', textDecoration: 'none' }}>
          &larr; Back to Projects List
        </Link>
        <h1 style={{ fontSize: '2em', textAlign: 'center', flexGrow: 1 }}>{project.name}</h1>
        <Link href={`/projects/${projectId}/dashboard`} style={{ color: '#0070f3', textDecoration: 'none' }}>
          Go to Dashboard &rarr;
        </Link>
      </div>

      <PageSection title="Project Details">
        <p><strong>ID:</strong> {project.id}</p>
        <p><strong>Description:</strong> {project.description || 'No description provided.'}</p>
        <p><strong>Status:</strong> <StatusBadge status={project.status} /></p>
        <p><strong>Building Type:</strong> {project.building_type || 'N/A'}</p>
        <p><strong>Location:</strong> {project.location || 'N/A'}</p>
        <p><strong>Percent Completed:</strong> {project.percent_completed}%</p>
        <p><strong>Start Date:</strong> {formatDate(project.start_date)}</p>
        <p><strong>End Date:</strong> {formatDate(project.end_date)}</p>
        <p><strong>Admin User ID:</strong> {project.admin_user_id || 'N/A'}</p>
        <p><strong>Organization ID:</strong> {project.organization_id || 'N/A'}</p>
        <p><strong>Has Sub-Projects:</strong> {project.has_sub_projects ? 'Yes' : 'No'}</p>
        {project.parent_project_id && (
          <p><strong>Parent Project:</strong> <Link href={`/projects/${project.parent_project_id}`}>{project.parent_project_id}</Link></p>
        )}
      </PageSection>

      <PageSection title="Daily Manpower & Progress Updates">
        <form action={createProgressUpdate} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px' }}>
          <input type="hidden" name="projectId" value={projectId} />
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="date" style={{ display: 'block', marginBottom: '5px' }}>Date:</label>
            <input type="date" id="date" name="date" required style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="manpower_count" style={{ display: 'block', marginBottom: '5px' }}>Manpower Count:</label>
            <input type="number" id="manpower_count" name="manpower_count" min="0" style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="update_text" style={{ display: 'block', marginBottom: '5px' }}>Update Text:</label>
            <textarea id="update_text" name="update_text" rows={3} required style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}></textarea>
          </div>
          <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Add Progress Update
          </button>
        </form>
        <h4>Past Progress Updates:</h4>
        {progressUpdates.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {progressUpdates.map(update => (
              <ListItem
                key={update.id}
                title={<><strong>Date:</strong> {formatDate(update.date)} | <strong>Manpower:</strong> {update.manpower_count ?? 'N/A'}</>}
                details={<p>{update.update_text}</p>}
                meta={<>By User: {update.user_id ? update.user_id.substring(0,8)+'...' : 'N/A'} on {formatDate(update.created_at, true)}</>}
              />
            ))}
          </ul>
        ) : (<p>No progress updates yet.</p>)}
      </PageSection>

      <PageSection title="Issues">
        <form action={createIssue} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px' }}>
          <input type="hidden" name="projectId" value={projectId} />
          {/* Form fields similar to above, simplified for brevity */}
          <div style={{ marginBottom: '10px' }}><label htmlFor="title">Title:</label><input type="text" id="title" name="title" required style={{width: '100%', padding: '8px', boxSizing: 'border-box'}} /></div>
          <div style={{ marginBottom: '10px' }}><label htmlFor="description">Description:</label><textarea id="description" name="description" rows={3} style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}></textarea></div>
          <div style={{ marginBottom: '10px' }}><label htmlFor="assigned_to_user_id">Assign to User ID:</label><input type="text" id="assigned_to_user_id" name="assigned_to_user_id" placeholder="Optional: Enter user UUID" style={{width: '100%', padding: '8px', boxSizing: 'border-box'}} /></div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="priority">Priority:</label>
            <select id="priority" name="priority" defaultValue="medium" style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Report Issue</button>
        </form>
        <h4>Existing Issues:</h4>
        {issues.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {issues.map(issue => (
              <ListItem
                key={issue.id}
                title={<><Link href={`#issue-${issue.id}`} style={{color: '#0070f3'}}>{issue.title}</Link> <StatusBadge status={issue.status} /> <StatusBadge status={issue.priority} /></>}
                details={<p>{issue.description}</p>}
                meta={<>Assigned to: {issue.assigned_to_user_id ? (issue.assigned_to?.email || issue.assigned_to_user_id.substring(0,8)+'...') : 'Unassigned'} | Reported by: {issue.reported_by_user_id ? (issue.reported_by?.email || issue.reported_by_user_id.substring(0,8)+'...') : 'N/A'} on {formatDate(issue.created_at, true)}</>}
              />
            ))}
          </ul>
        ) : (<p>No issues reported yet.</p>)}
      </PageSection>

      <PageSection title="Attachments (Metadata)">
        <form action={createAttachmentMetadata} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px' }}>
          <input type="hidden" name="projectId" value={projectId} />
          {/* Form fields similar to above, simplified for brevity */}
          <div style={{ marginBottom: '10px' }}><label htmlFor="file_name">File Name:</label><input type="text" id="file_name" name="file_name" required style={{width: '100%', padding: '8px', boxSizing: 'border-box'}} /></div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="attachment_type">Attachment Type:</label>
            <select id="attachment_type" name="attachment_type" style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}>
              <option value="">Select Type</option><option value="document">Document</option><option value="image">Image</option><option value="drawing_2d">2D Drawing</option><option value="model_3d">3D Model Link</option><option value="walkthrough_360">360 Walkthrough Link</option><option value="link">Link</option><option value="other">Other</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}><label htmlFor="description">Description:</label><textarea id="description" name="description" rows={2} style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}></textarea></div>
          <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Add Attachment Metadata</button>
        </form>
        <h4>Existing Attachments:</h4>
        {attachments.length > 0 ? (
           <ul style={{ listStyle: 'none', padding: 0 }}>
            {attachments.map(att => (
              <ListItem
                key={att.id}
                title={<>{att.file_name} <StatusBadge status={att.attachment_type} /></>}
                details={<p>Path/Link: {att.file_path || 'N/A'}</p>}
                meta={<>Description: {att.description || 'N/A'} | Uploaded by: {att.uploaded_by_user_id ? att.uploaded_by_user_id.substring(0,8)+'...' : 'N/A'} on {formatDate(att.created_at, true)}</>}
              />
            ))}
          </ul>
        ) : (<p>No attachments metadata yet.</p>)}
      </PageSection>

      <PageSection title="Additional Features (Placeholders)">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button disabled style={{ padding: '10px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>Gantt Chart (Planned vs Actual)</button>
            <button disabled style={{ padding: '10px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>360 Walkthrough Viewer</button>
            <button disabled style={{ padding: '10px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>2D Views Viewer</button>
            <button disabled style={{ padding: '10px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>3D Model Viewer</button>
        </div>
      </PageSection>
    </div>
  );
}
