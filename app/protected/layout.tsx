// app/dashboard/layout.tsx (Nested Layout)
import DynamicNav from '@/components/dynamic-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DynamicNav link="/dashboard" label="Dashboard Pro" />
      {children}
    </>
  );
}