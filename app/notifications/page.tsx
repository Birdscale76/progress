// app/notifications/page.tsx
import Link from 'next/link';
import { getUserNotifications, markNotificationRead, getAssignedIssues } from '@/app/actions/notifications';
import { updateIssueStatus } from '@/app/actions/issues'; // For updating status from this page
import { Database } from '@/types/supabase'; // Adjust path as necessary
import { cookies } from 'next/headers'; 
import { createServerClient } from '@supabase/ssr';
import type { Notification as NotificationType, Issue as IssueType } from '@/types/index'; // Using types from types/index.ts
import PageSection from '@/components/shared/PageSection';
import ListItem from '@/components/shared/ListItem';
import StatusBadge from '@/components/shared/StatusBadge';


// Helper to get current user ID 
async function getCurrentUserId() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

// Helper function to format date strings
function formatDate(dateString: string | null | undefined, includeTime: boolean = true) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return includeTime ? date.toLocaleString() : date.toLocaleDateString();
  } catch(e) {
    return 'Invalid Date';
  }
}

export default async function NotificationsPage() {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) {
    return <p>Please log in to see your notifications and assigned issues.</p>;
  }

  const notifications: NotificationType[] = await getUserNotifications();
  const assignedIssues: IssueType[] = await getAssignedIssues();

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      <h1 style={{textAlign: 'center', marginBottom: '30px'}}>My Notifications & Work Items</h1>

      <PageSection title="Notifications">
        {notifications.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notifications.map((notif) => {
              const notifActions = [];
              if (!notif.is_read) {
                notifActions.push(
                  <form action={markNotificationRead} key={`mark-read-${notif.id}`} style={{ display: 'inline-block', marginRight: '10px' }}>
                    <input type="hidden" name="notificationId" value={notif.id} />
                    <button type="submit" style={{padding: '3px 8px', fontSize: '0.8em', cursor: 'pointer'}}>Mark as Read</button>
                  </form>
                );
              }
              if (notif.related_issue_id && notif.related_project_id) {
                notifActions.push(
                  <Link key={`view-issue-${notif.id}`} href={`/projects/${notif.related_project_id}#issue-${notif.related_issue_id}`} style={{ fontSize: '0.9em', color: '#0070f3' }}>
                    View Issue
                  </Link>
                );
              } else if (notif.related_project_id) {
                 notifActions.push(
                  <Link key={`view-project-${notif.id}`} href={`/projects/${notif.related_project_id}`} style={{ fontSize: '0.9em', color: '#0070f3' }}>
                    View Project
                  </Link>
                );
              }

              return (
                <ListItem
                  key={notif.id}
                  title={<span style={{fontWeight: notif.is_read ? 'normal' : 'bold'}}>{notif.message}</span>}
                  meta={<>Received: {formatDate(notif.created_at)}</>}
                  actions={notifActions.length > 0 ? <div style={{marginTop: '5px'}}>{notifActions}</div> : null}
                  className={notif.is_read ? 'bg-gray-50' : 'bg-white'} // Example for Tailwind if used
                  style={{backgroundColor: notif.is_read ? '#f9f9f9' : '#fff', padding: '10px', borderRadius: '4px', marginBottom: '5px'}}
                />
              );
            })}
          </ul>
        ) : (
          <p>You have no notifications.</p>
        )}
      </PageSection>

      <PageSection title="My Assigned Issues (Not Closed)">
        {assignedIssues.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {assignedIssues.map((issue) => {
              const issueTitle = (
                <Link href={`/projects/${issue.project_id}#issue-${issue.id}`} style={{color: '#0070f3', fontWeight: 'bold'}}>
                  {issue.title}
                </Link>
              );
              const issueDetails = (
                <>
                  <p>Project: <Link href={`/projects/${issue.project_id}`} style={{color: '#0070f3'}}>{issue.project_id.substring(0,8)}...</Link></p>
                  <p>Status: <StatusBadge status={issue.status} /> | Priority: <StatusBadge status={issue.priority} /></p>
                  {issue.description && <p style={{fontSize: '0.9em', color: '#555'}}><em>{issue.description}</em></p>}
                </>
              );
              const issueActions = (
                <form action={updateIssueStatus} style={{ marginTop: '10px' }}>
                  <input type="hidden" name="issueId" value={issue.id} />
                  <input type="hidden" name="projectId" value={issue.project_id} />
                  <label htmlFor={`status-${issue.id}`} style={{marginRight: '5px', fontSize: '0.9em'}}>Update Status:</label>
                  <select id={`status-${issue.id}`} name="status" defaultValue={issue.status || undefined} style={{padding: '5px', marginRight: '10px', borderRadius: '4px'}}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Update</button>
                </form>
              );
              return (
                <ListItem
                  key={issue.id}
                  title={issueTitle}
                  details={issueDetails}
                  meta={<>Reported: {formatDate(issue.created_at)}</>}
                  actions={issueActions}
                  style={{padding: '10px', borderRadius: '4px', marginBottom: '10px'}}
                />
              );
            })}
          </ul>
        ) : (
          <p>You have no open issues assigned to you.</p>
        )}
      </PageSection>
    </div>
  );
}
