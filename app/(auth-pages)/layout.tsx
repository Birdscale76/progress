export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" max-w-7xl  flex flex-col gap-20 py-10 items-start">{children}</div>
  );
}
