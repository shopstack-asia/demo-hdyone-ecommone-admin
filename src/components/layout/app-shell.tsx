import { TopNav } from "./top-nav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 via-background to-muted/25">
      <TopNav />
      <main className="px-4 sm:px-6 py-4 sm:py-6 max-w-[1400px] mx-auto w-full min-w-0">
        {children}
      </main>
    </div>
  );
}
