// components/shared/ListItem.tsx
import React from 'react';

interface ListItemProps {
  title: React.ReactNode; // Allow for complex titles, e.g., with links
  details?: React.ReactNode; // For main content or description
  meta?: React.ReactNode; // For secondary info like dates, user IDs
  actions?: React.ReactNode; // For buttons or forms related to the item
  className?: string;
  titleClassName?: string;
  detailsClassName?: string;
  metaClassName?: string;
}

const ListItem: React.FC<ListItemProps> = ({ 
  title, 
  details, 
  meta, 
  actions,
  className = '',
  titleClassName = '',
  detailsClassName = '',
  metaClassName = ''
}) => {
  return (
    <li style={{ 
      borderBottom: '1px solid #eee', 
      padding: '12px 0', 
      listStyleType: 'none' 
    }} className={className}>
      {typeof title === 'string' ? (
        <h4 style={{ marginTop: 0, marginBottom: '4px' }} className={titleClassName}>{title}</h4>
      ) : (
        <div style={{ marginBottom: '4px' }} className={titleClassName}>{title}</div>
      )}
      
      {details && <div style={{ marginBottom: '6px' }} className={detailsClassName}>{details}</div>}
      
      {meta && <small style={{ color: '#777', display: 'block', marginBottom: '6px' }} className={metaClassName}>{meta}</small>}
      
      {actions && <div style={{ marginTop: '8px' }}>{actions}</div>}
    </li>
  );
};

export default ListItem;
