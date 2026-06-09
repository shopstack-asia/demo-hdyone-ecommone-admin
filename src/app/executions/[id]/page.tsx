import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ExecutionDetailView } from "@/components/executions/execution-detail-view";
import {
  connectionService,
  executionService,
  integrationService,
  providerService,
  tenantService,
  dlqService,
  executionErrorService,
  retryService,
} from "@/services";

interface ExecutionDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const EXECUTION_TABS = ["overview", "chunks", "errors", "retry", "dlq"] as const;

export default async function ExecutionDetailPage({ params, searchParams }: ExecutionDetailPageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const initialTab = tab && EXECUTION_TABS.includes(tab as (typeof EXECUTION_TABS)[number]) ? tab : undefined;
  const execution = await executionService.getExecution(id);
  if (!execution) notFound();

  const integration = await integrationService.getIntegration(execution.integrationId);

  const [tenant, relatedDlq, errorRecords, retryRecords, sourceConnection, destinationConnection] = await Promise.all([
    tenantService.getTenant(execution.tenantId),
    dlqService.getByExecution(execution.id),
    executionErrorService.getByExecution(execution.id),
    retryService.getByExecution(execution.id),
    integration ? connectionService.getConnection(integration.sourceConnectionId) : Promise.resolve(null),
    integration ? connectionService.getConnection(integration.destinationConnectionId) : Promise.resolve(null),
  ]);

  const [sourceProvider, destinationProvider] = await Promise.all([
    sourceConnection ? providerService.getProvider(sourceConnection.providerId) : Promise.resolve(null),
    destinationConnection ? providerService.getProvider(destinationConnection.providerId) : Promise.resolve(null),
  ]);

  const sourceLabel = sourceProvider?.name ?? sourceConnection?.name ?? "Source";
  const destinationLabel = destinationProvider?.name ?? destinationConnection?.name ?? "Destination";
  const integrationFlow = `${sourceLabel} → ${destinationLabel}`;

  return (
    <AppShell>
      <ExecutionDetailView
        execution={execution}
        integration={integration}
        tenant={tenant}
        relatedDlq={relatedDlq}
        errorRecords={errorRecords}
        retryRecords={retryRecords}
        integrationFlow={integrationFlow}
        sourceLabel={sourceLabel}
        destinationLabel={destinationLabel}
        sourceProvider={sourceProvider}
        destinationProvider={destinationProvider}
        initialTab={initialTab}
      />
    </AppShell>
  );
}
