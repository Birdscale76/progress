// components/shared/PageSection.tsx
import React from 'react';

interface PageSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}

const PageSection: React.FC<PageSectionProps> = ({ 
  title, 
  children, 
  className = '',
  titleClassName = '',
  contentClassName = ''
}) => {
  return (
    <section 
      style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }} 
      className={className}
    >
      <h2 
        style={{ 
          marginTop: 0, 
          marginBottom: '16px', 
          fontSize: '1.5em', 
          borderBottom: '1px solid #eee', 
          paddingBottom: '8px' 
        }} 
        className={titleClassName}
      >
        {title}
      </h2>
      <div className={contentClassName}>
        {children}
      </div>
    </section>
  );
};

export default PageSection;
