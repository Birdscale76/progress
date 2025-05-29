// components/shared/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  status: string | null | undefined;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let backgroundColor = '#e0e0e0'; // Default grey
  let textColor = '#333';

  const s = status?.toLowerCase() || '';

  if (s.includes('open') || s.includes('planning') || s.includes('new')) {
    backgroundColor = '#cfe2ff'; // Light blue
    textColor = '#004085';
  } else if (s.includes('progress') || s.includes('active')) {
    backgroundColor = '#fff3cd'; // Light yellow
    textColor = '#856404';
  } else if (s.includes('completed') || s.includes('closed') || s.includes('resolved')) {
    backgroundColor = '#d4edda'; // Light green
    textColor = '#155724';
  } else if (s.includes('hold') || s.includes('pending') || s.includes('review')) {
    backgroundColor = '#f8d7da'; // Light red/pink
    textColor = '#721c24';
  } else if (s.includes('medium')) {
    backgroundColor = '#ffeeba'; // Light orange for priority
    textColor = '#856404';
  } else if (s.includes('high')) {
    backgroundColor = '#f5c6cb'; // Light red for priority
    textColor = '#721c24';
  } else if (s.includes('low')) {
    backgroundColor = '#cce5ff'; // Light blue for priority
    textColor = '#004085';
  }


  return (
    <span 
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        fontSize: '0.85em',
        fontWeight: '600',
        borderRadius: '12px', // Pill shape
        backgroundColor: backgroundColor,
        color: textColor,
        border: `1px solid ${textColor}`
      }}
      className={className}
    >
      {status || 'N/A'}
    </span>
  );
};

export default StatusBadge;
