"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createIntegrationAction, deleteIntegrationAction, setIntegrationInactiveAction } from "@/actions/integration.actions";
import {
  IntegrationEditOverviewSection,
} from "@/components/integrations/integration-config-sections";
import { IntegrationPolicySection } from "@/components/integrations/integration-policy-section";
import { IntegrationTriggerEditSection } from "@/components/integrations/integration-trigger-edit-section";
import { MappingStep } from "@/components/integrations/mapping/mapping-step";
import { StatusBadge } from "@/components/shared/status-badge";
import { useIntegrationForm } from "@/lib/integration-wizard/use-integration-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Connection, Integration, Provider } from "@/types/domain";
import { IntegrationStatus } from "@/types/enums";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

interface EditIntegrationFormProps {
  tenantId: string;
  integration: Integration;
  connections: Connection[];
  providers: Provider[];
  mappingProfileCode?: string;
}

export function EditIntegrationForm({
  tenantId,
  integration,
  connections,
  providers,
  mappingProfileCode,
}: EditIntegrationFormProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [status, setStatus] = useState(integration.status);
  const [isPending, startTransition] = useTransition();
  const [isInactivePending, startInactiveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const ctx = useIntegrationForm({ connections, providers, integration, mappingProfileCode });
  const { values, setValue, sourceConn, destConn, sourceProvider, destProvider, selectedDataFlow } = ctx;
  const isInactive = status === IntegrationStatus.INACTIVE;

  const handleSetInactive = () => {
    setSubmitError(null);
    startInactiveTransition(async () => {
      const result = await setIntegrationInactiveAction(tenantId, integration.id);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      setStatus(result.status);
    });
  };

  const handleSave = () => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createIntegrationAction(tenantId, values, integration.id);
      if (result && !result.success) {
        setSubmitError(result.error);
      }
    });
  };

  const handleDelete = () => {
    setSubmitError(null);
    startDeleteTransition(async () => {
      const result = await deleteIntegrationAction(tenantId, integration.id);
      if (result && !result.success) {
        setSubmitError(result.error);
        setDeleteDialogOpen(false);
      }
    });
  };

  const isBusy = isPending || isInactivePending || isDeletePending;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Link href={`/tenants/${tenantId}/integrations`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Edit integration</h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground font-mono mt-0.5">{integration.code} · {integration.name}</p>
        </div>
      </div>

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
          <TabsTrigger value="trigger" className="text-xs">Trigger</TabsTrigger>
          <TabsTrigger value="mapping" className="text-xs">Mapping</TabsTrigger>
          <TabsTrigger value="policy" className="text-xs">Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <IntegrationEditOverviewSection integration={{ ...integration, status }} ctx={ctx} />
        </TabsContent>

        <TabsContent value="trigger" className="mt-4">
          <IntegrationTriggerEditSection ctx={ctx} tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="mapping" className="mt-4">
          {selectedDataFlow && sourceProvider ? (
            <MappingStep
              sourceProvider={sourceProvider}
              sourceConnection={sourceConn}
              destinationProvider={destProvider}
              destinationConnection={destConn}
              dataFlow={selectedDataFlow}
              mappingProfileCode={values.mappingProfileCode}
              onMappingProfileCodeChange={(code) => setValue("mappingProfileCode", code)}
              idempotency={values.idempotency}
              onIdempotencyChange={(next) => setValue("idempotency", next, { shouldDirty: true })}
              idempotencyPreviewContext={{
                tenantId,
                integrationId: integration.id,
                dataFlowCode: selectedDataFlow.code,
              }}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Mapping is unavailable — this integration has no source or data flow configured.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="policy" className="mt-4">
          <IntegrationPolicySection ctx={ctx} />
        </TabsContent>
      </Tabs>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting an integration permanently removes its configuration. Deactivate it first if
            it is still active, and resolve any in-progress executions or open DLQ records.
          </p>
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" className="min-h-11" disabled={isBusy}>
                  Delete integration
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {integration.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes {integration.code} and its trigger, mapping, and policy
                  settings. Completed execution history will remain, but this integration cannot be
                  restored.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletePending}>Keep integration</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeletePending}
                >
                  {isDeletePending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Delete integration
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex justify-between gap-4 max-w-[1400px] mx-auto">
          <Link href={`/tenants/${tenantId}/integrations`}>
            <Button type="button" variant="outline" className="min-h-11" disabled={isBusy}>
              Cancel
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {!isInactive && (
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={handleSetInactive}
                disabled={isBusy}
              >
                {isInactivePending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Inactive
              </Button>
            )}
            <Button type="button" className="min-h-11" onClick={handleSave} disabled={isBusy}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save integration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
