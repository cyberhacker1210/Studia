import WorkspaceNavbar from '@/components/workspace/WorkspaceNavbar';
import InstallPWA from '@/components/workspace/InstallPWA';
import OfflineIndicator from '@/components/workspace/OfflineIndicator';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <WorkspaceNavbar />
      <main>{children}</main>
      <InstallPWA />
      <OfflineIndicator />
    </div>
  );
}