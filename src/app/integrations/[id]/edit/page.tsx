import { notFound, redirect } from "next/navigation";
import { integrationService } from "@/services";

interface IntegrationEditRedirectProps {
  params: Promise<{ id: string }>;
}

export default async function IntegrationEditPage({ params }: IntegrationEditRedirectProps) {
  const { id } = await params;
  const integration = await integrationService.resolveIntegrationByKey(id);
  if (!integration) notFound();

  redirect(`/tenants/${integration.tenantId}/integrations/${integration.id}/edit`);
}
