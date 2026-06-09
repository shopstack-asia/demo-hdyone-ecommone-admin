import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <AppShell>
      <PageHeader
        title="Page not found"
        description="The resource you requested does not exist or may have been removed."
        actions={
          <Link href="/dashboard">
            <Button className="min-h-11">Return to dashboard</Button>
          </Link>
        }
      />
    </AppShell>
  );
}
