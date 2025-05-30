// components/DynamicNav.tsx
import Link from 'next/link';
import HeaderAuth from '@/components/header-auth';

interface DynamicNavProps {
  link?: string;
  label?: string;
}

export default function DynamicNav({ 
  link = '/', 
  label = 'Progress Pro' 
}: DynamicNavProps) {
  return (
    <nav className="fixed top-0 w-full flex justify-center bg-background border-b border-b-foreground/10 h-16 z-50">
      <div className="w-full flex justify-between items-center px-6 md:px-12 lg:px-16">
        <div className="flex items-center text-base md:text-lg font-semibold">
          <Link href={link}>{label}</Link>
        </div>
        <HeaderAuth />
      </div>
    </nav>
  );
}
