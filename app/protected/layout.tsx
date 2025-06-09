// app/dashboard/layout.tsx (Nested Layout)
import DynamicNav from '@/components/dynamic-nav';
import Footer from '@/components/footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DynamicNav link="/protected" label="Progress Pro / Projects" />
      {children}
      <Footer />
    </>
  );
}