 import WorkspaceNavbar from '@/components/workspace/WorkspaceNavbar';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <WorkspaceNavbar />
      <main>{children}</main>
    </div>
  );
}