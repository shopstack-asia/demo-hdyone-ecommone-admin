import { CreateIntegrationForm } from "@/components/integrations/create-integration-form";
import { connectionService, providerService } from "@/services";

interface NewIntegrationPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewIntegrationPage({ params }: NewIntegrationPageProps) {
  const { id } = await params;
  const [connections, { data: providers }] = await Promise.all([
    connectionService.getConnectionsByTenant(id),
    providerService.listProviders({ pageSize: 100 }),
  ]);

  return (
    <CreateIntegrationForm
      tenantId={id}
      connections={connections}
      providers={providers}
    />
  );
}
