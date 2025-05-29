// components/shared/ProjectCard.tsx
import Link from 'next/link';
import type { Project } from '@/types/index'; // Adjust path if your types are elsewhere

interface ProjectCardProps {
  project: Project;
}

// Helper function to format date strings (optional, can be moved to a utils file)
function formatDate(dateString: string | null | undefined) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return 'Invalid Date';
  }
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div style={{ 
      border: '1px solid #e0e0e0', 
      borderRadius: '8px', 
      padding: '16px', 
      marginBottom: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '12px' }}>
        <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', color: '#0070f3' }}>
          {project.name}
        </Link>
      </h3>
      <p style={{ fontSize: '0.9em', color: '#555', marginBottom: '4px' }}>
        <strong>Status:</strong> {project.status || 'N/A'}
      </p>
      <p style={{ fontSize: '0.9em', color: '#555', marginBottom: '4px' }}>
        <strong>Building Type:</strong> {project.building_type || 'N/A'}
      </p>
      <p style={{ fontSize: '0.9em', color: '#555', marginBottom: '4px' }}>
        <strong>Location:</strong> {project.location || 'N/A'}
      </p>
      <p style={{ fontSize: '0.9em', color: '#555', marginBottom: '4px' }}>
        <strong>Completion:</strong> {project.percent_completed}%
      </p>
      {project.start_date && (
        <p style={{ fontSize: '0.9em', color: '#555', marginBottom: '4px' }}>
          <strong>Start Date:</strong> {formatDate(project.start_date)}
        </p>
      )}
      {project.end_date && (
        <p style={{ fontSize: '0.9em', color: '#555', marginBottom: '4px' }}>
          <strong>End Date:</strong> {formatDate(project.end_date)}
        </p>
      )}
      <div style={{ marginTop: '12px' }}>
        <Link href={`/projects/${project.id}/dashboard`} style={{ fontSize: '0.9em', color: '#0070f3' }}>
          Go to Dashboard &rarr;
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
