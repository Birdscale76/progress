import Footer from "@/components/footer";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    <div className=" max-w-7xl mx-auto flex flex-col gap-20 py-10 justify-center">{children}</div>
    <Footer />
    </>
  );
}
