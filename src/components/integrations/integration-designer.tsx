"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineVisualization } from "@/components/shared/pipeline-visualization";
import { StatusBadge } from "@/components/shared/status-badge";
import { MappingStep } from "@/components/integrations/mapping/mapping-step";
import { findDataFlowById } from "@/data/provider-data-flows";
import { formatDate } from "@/lib/format";
import type { Connection, Integration, Provider } from "@/types/domain";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";

interface IntegrationDesignerProps {
  tenantId: string;
  integration: Integration;
  connections: Connection[];
  providers: Provider[];
  mappingProfileCode?: string;
}

const DESIGNER_TABS = [
  { id: "overview", label: "Overview" },
  { id: "executions", label: "Executions", href: true },
  { id: "mapping", label: "Mapping" },
  { id: "validation", label: "Validation" },
  { id: "transformation", label: "Transformation" },
  { id: "routing", label: "Routing" },
  { id: "policies", label: "Policies" },
  { id: "retry", label: "Retry" },
  { id: "dlq", label: "DLQ", href: true },
  { id: "audit-logs", label: "Audit Logs", href: true },
] as const;

function ProfileTab({ title, profileId, description }: { title: string; profileId?: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground uppercase">Profile ID</dt>
            <dd className="font-mono mt-1">{profileId ?? "Platform default"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground uppercase">Status</dt>
            <dd className="mt-1">Active — edit rules below after publish</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground mt-4">
          Advanced {title.toLowerCase()} editor will be available in a future release. Profiles are configured automatically during integration creation.
        </p>
      </CardContent>
    </Card>
  );
}

export function IntegrationDesigner({
  tenantId,
  integration,
  connections,
  providers,
  mappingProfileCode,
}: IntegrationDesignerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const sourceConn = connections.find((c) => c.id === integration.sourceConnectionId);
  const destConn = connections.find((c) => c.id === integration.destinationConnectionId);
  const sourceProvider = providers.find((p) => p.id === (integration.sourceProviderId || sourceConn?.providerId));
  const destProvider = providers.find((p) => p.id === (integration.destinationProviderId || destConn?.providerId));
  const dataFlow = findDataFlowById(providers, integration.dataFlowId);

  const pipelineStages = [
    { label: sourceConn?.name ?? "Source", completed: true },
    { label: dataFlow?.name ?? "Data Flow", completed: true },
    { label: "Transform", completed: true },
    { label: destConn?.name ?? "Destination", completed: true },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/tenants/${tenantId}/integrations`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{integration.name}</h2>
              <StatusBadge status={integration.status} />
            </div>
            <p className="text-sm text-muted-foreground font-mono">{integration.code}</p>
          </div>
        </div>
        <Link href={`/tenants/${tenantId}/integrations/${integration.id}/edit`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit integration
          </Button>
        </Link>
      </div>

      <Card className="mb-6 border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <PipelineVisualization stages={pipelineStages} />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          {DESIGNER_TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Integration Code</Label><Input defaultValue={integration.code} readOnly /></div>
                <div className="space-y-2"><Label>Name</Label><Input defaultValue={integration.name} readOnly /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea defaultValue={integration.description} readOnly /></div>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t text-sm">
                <div><dt className="text-xs text-muted-foreground uppercase">Data flow</dt><dd className="font-medium mt-1">{dataFlow?.name ?? integration.dataFlowId}</dd></div>
                <div><dt className="text-xs text-muted-foreground uppercase">Trigger</dt><dd className="font-medium mt-1">{integration.triggerType}</dd></div>
                <div><dt className="text-xs text-muted-foreground uppercase">Success rate</dt><dd className="font-medium mt-1">{integration.successRate.toFixed(1)}%</dd></div>
                <div><dt className="text-xs text-muted-foreground uppercase">Source</dt><dd className="font-medium mt-1">{sourceProvider?.name} · {sourceConn?.name}</dd></div>
                <div><dt className="text-xs text-muted-foreground uppercase">Destination</dt><dd className="font-medium mt-1">{destConn?.name ?? "—"}</dd></div>
                <div><dt className="text-xs text-muted-foreground uppercase">Last run</dt><dd className="font-medium mt-1">{formatDate(integration.lastRunAt) ?? "Never"}</dd></div>
                {integration.tags && integration.tags.length > 0 && (
                  <div className="col-span-2"><dt className="text-xs text-muted-foreground uppercase">Tags</dt><dd className="font-medium mt-1">{integration.tags.join(", ")}</dd></div>
                )}
                {integration.owner && (
                  <div><dt className="text-xs text-muted-foreground uppercase">Owner</dt><dd className="font-medium mt-1">{integration.owner}</dd></div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="mt-4">
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">View execution history and runtime details for this integration.</p>
              <Link href={`/tenants/${tenantId}/executions?integration=${integration.id}`}>
                <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4 mr-1" />Open executions</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="mt-4">
          {dataFlow && sourceProvider ? (
            <MappingStep
              sourceProvider={sourceProvider}
              sourceConnection={sourceConn}
              destinationProvider={destProvider}
              destinationConnection={destConn}
              dataFlow={dataFlow}
              mappingProfileCode={mappingProfileCode}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Complete source, data flow, and destination configuration to view mapping rules.
                </p>
                <Link href={`/tenants/${tenantId}/integrations/${integration.id}/edit`}>
                  <Button variant="outline" size="sm">Configure integration</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="validation" className="mt-4">
          <ProfileTab title="Validation" profileId={integration.validationProfileId} description="Schema validation rules applied to inbound records." />
        </TabsContent>

        <TabsContent value="transformation" className="mt-4">
          <ProfileTab title="Transformation" profileId={integration.transformationProfileId} description="Data enrichment and business rule transformations." />
        </TabsContent>

        <TabsContent value="routing" className="mt-4">
          <ProfileTab title="Routing" profileId={integration.routingProfileId} description="Conditional routing and fan-out rules." />
        </TabsContent>

        <TabsContent value="policies" className="mt-4">
          <ProfileTab title="Execution Policy" profileId={integration.executionPolicyId} description="Timeout, concurrency, and batch execution settings." />
        </TabsContent>

        <TabsContent value="retry" className="mt-4">
          <ProfileTab title="Retry Policy" profileId={integration.retryPolicyId} description="Retry strategy and backoff configuration." />
        </TabsContent>

        <TabsContent value="dlq" className="mt-4">
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Review failed messages in the dead letter queue.</p>
              <Link href={`/tenants/${tenantId}/dlq`}>
                <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4 mr-1" />Open DLQ</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-logs" className="mt-4">
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Audit trail for configuration changes and executions.</p>
              <Link href={`/tenants/${tenantId}/audit-logs`}>
                <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4 mr-1" />Open audit logs</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
