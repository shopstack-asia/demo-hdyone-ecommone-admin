import { notFound, redirect } from "next/navigation";
import { integrationService } from "@/services";

interface IntegrationDetailPageProps {
  params: Promise<{ id: string; integrationId: string }>;
}

export default async function IntegrationDetailPage({ params }: IntegrationDetailPageProps) {
  const { id, integrationId } = await params;
  const integration = await integrationService.resolveIntegration(id, integrationId);
  if (!integration) notFound();

  redirect(`/tenants/${id}/integrations/${integration.id}/edit`);
}
