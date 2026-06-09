import { notFound, redirect } from "next/navigation";
import { EditIntegrationForm } from "@/components/integrations/edit-integration-form";
import { connectionService, integrationService, providerService, systemConfigService } from "@/services";

interface IntegrationEditPageProps {
  params: Promise<{ id: string; integrationId: string }>;
}

export default async function IntegrationEditPage({ params }: IntegrationEditPageProps) {
  const { id, integrationId } = await params;
  const integration = await integrationService.resolveIntegration(id, integrationId);
  if (!integration) notFound();

  if (integration.id !== integrationId) {
    redirect(`/tenants/${id}/integrations/${integration.id}/edit`);
  }

  const [connections, { data: providers }, mappingProfiles] = await Promise.all([
    connectionService.getConnectionsByTenant(id),
    providerService.listProviders({ pageSize: 100 }),
    systemConfigService.getMappingProfiles(),
  ]);

  const mappingProfileCode = mappingProfiles.find((p) => p.id === integration.mappingProfileId)?.code;

  return (
    <EditIntegrationForm
      tenantId={id}
      integration={integration}
      connections={connections}
      providers={providers}
      mappingProfileCode={mappingProfileCode}
    />
  );
}
