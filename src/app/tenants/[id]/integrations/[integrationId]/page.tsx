import { notFound, redirect } from "next/navigation";
import { integrationService } from "@/services";

interface IntegrationDetailPageProps {
  params: Promise<{ id: string; integrationId: string }>;
}

export default async function IntegrationDetailPage({ params }: IntegrationDetailPageProps) {
  const { id, integrationId } = await params;
  const integration = await integrationService.getIntegration(integrationId);
  if (!integration || integration.tenantId !== id) notFound();

  redirect(`/tenants/${id}/integrations/${integrationId}/edit`);
}
