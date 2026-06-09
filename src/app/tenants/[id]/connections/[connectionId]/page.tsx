import { notFound } from "next/navigation";
import { ConnectionDetailView } from "@/components/connections/connection-detail-view";
import { connectionService, providerService } from "@/services";

interface ConnectionDetailPageProps {
  params: Promise<{ id: string; connectionId: string }>;
}

export default async function ConnectionDetailPage({ params }: ConnectionDetailPageProps) {
  const { id, connectionId } = await params;
  const connection = await connectionService.getConnection(connectionId);
  if (!connection || connection.tenantId !== id) notFound();

  const provider = await providerService.getProvider(connection.providerId);
  if (!provider) notFound();

  return (
    <ConnectionDetailView
      tenantId={id}
      connection={connection}
      provider={provider}
    />
  );
}
