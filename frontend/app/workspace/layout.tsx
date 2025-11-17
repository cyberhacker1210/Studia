import WorkspaceNavbar from '@/components/workspace/WorkspaceNavbar';
import GlobalSearch from '@/components/workspace/GlobalSearch';
import InstallPWA from '@/components/workspace/InstallPWA';
import OfflineIndicator from '@/components/workspace/OfflineIndicator';
import ThemeInitializer from '@/components/ThemeInitializer';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeInitializer />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 transition-colors duration-300">
        <WorkspaceNavbar />
        <main className="transition-colors duration-300">
          {children}
        </main>
        <GlobalSearch />
        <InstallPWA />
        <OfflineIndicator />
      </div>
    </>
  );
}