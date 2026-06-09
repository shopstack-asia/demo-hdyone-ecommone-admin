"use client";

import { useCallback, useState } from "react";
import { FieldError } from "@/components/wizard/field-error";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_CIRCUIT_BREAKER,
  mergeCircuitBreaker,
  mergeExecutionPolicy,
  mergeFailureNotification,
  mergeRetryPolicy,
} from "@/lib/integration-runtime-defaults";
import type { IntegrationFormContext } from "@/lib/integration-wizard/use-integration-form";
import type { CreateIntegrationInput } from "@/lib/schemas/integration.schema";
import { NotificationChannel, RetryStrategy } from "@/types/enums";
import { X } from "lucide-react";

const RETRY_STRATEGIES = [
  { value: RetryStrategy.FIXED, label: "Fixed interval" },
  { value: RetryStrategy.EXPONENTIAL, label: "Exponential backoff" },
  { value: RetryStrategy.DECORRELATED_JITTER, label: "Decorrelated jitter" },
] as const;

const NOTIFICATION_CHANNELS = [
  { value: NotificationChannel.EMAIL, label: "Email" },
  { value: NotificationChannel.SLACK, label: "Slack" },
  { value: NotificationChannel.TEAMS, label: "Microsoft Teams" },
  { value: NotificationChannel.WEBHOOK, label: "Webhook" },
] as const;

interface IntegrationPolicySectionProps {
  ctx: IntegrationFormContext;
}

export function IntegrationPolicySection({ ctx }: IntegrationPolicySectionProps) {
  const { values, getValues, setValue } = ctx;
  const [emailDraft, setEmailDraft] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const patchExecutionPolicy = useCallback(
    (patch: Partial<NonNullable<CreateIntegrationInput["executionPolicy"]>>) => {
      setValue(
        "executionPolicy",
        { ...mergeExecutionPolicy(getValues("executionPolicy")), ...patch },
        { shouldDirty: true }
      );
    },
    [getValues, setValue]
  );

  const patchRetryPolicy = useCallback(
    (patch: Partial<NonNullable<CreateIntegrationInput["retryPolicy"]>>) => {
      setValue(
        "retryPolicy",
        { ...mergeRetryPolicy(getValues("retryPolicy")), ...patch },
        { shouldDirty: true }
      );
    },
    [getValues, setValue]
  );

  const patchFailureNotification = useCallback(
    (patch: Partial<NonNullable<CreateIntegrationInput["failureNotification"]>>) => {
      setValue(
        "failureNotification",
        { ...mergeFailureNotification(getValues("failureNotification")), ...patch },
        { shouldDirty: true }
      );
    },
    [getValues, setValue]
  );

  const patchCircuitBreaker = useCallback(
    (patch: Partial<NonNullable<CreateIntegrationInput["circuitBreaker"]>>) => {
      setValue(
        "circuitBreaker",
        { ...mergeCircuitBreaker(getValues("circuitBreaker")), ...patch },
        { shouldDirty: true }
      );
    },
    [getValues, setValue]
  );

  const executionPolicy = values.executionPolicy;
  const retryPolicy = values.retryPolicy;
  const failureNotification = values.failureNotification;
  const circuitBreaker = values.circuitBreaker;

  const emailError =
    touched.emails &&
    failureNotification?.notifyOnFailure &&
    failureNotification.channels.includes(NotificationChannel.EMAIL) &&
    (failureNotification.emails?.length ?? 0) === 0
      ? "Add at least one notification email."
      : undefined;

  const requestsPerSecondError =
    touched.requestsPerSecond &&
    executionPolicy &&
    !executionPolicy.unlimitedRequestRate &&
    (executionPolicy.requestsPerSecond == null || executionPolicy.requestsPerSecond <= 0)
      ? "Enter a request rate greater than 0, or enable unlimited request rate."
      : undefined;

  const addEmail = () => {
    const email = emailDraft.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    const emails = failureNotification?.emails ?? [];
    if (emails.includes(email)) {
      setEmailDraft("");
      return;
    }
    patchFailureNotification({ emails: [...emails, email] });
    setEmailDraft("");
    markTouched("emails");
  };

  const removeEmail = (email: string) => {
    patchFailureNotification({
      emails: (failureNotification?.emails ?? []).filter((e) => e !== email),
    });
    markTouched("emails");
  };

  const toggleChannel = (channel: NotificationChannel, checked: boolean) => {
    const channels = failureNotification?.channels ?? [];
    patchFailureNotification({
      channels: checked ? [...channels, channel] : channels.filter((c) => c !== channel),
    });
    markTouched("channels");
  };

  const handleRetryEnabledChange = (enabled: boolean) => {
    patchRetryPolicy({
      enabled,
      maxRetryCount: enabled ? Math.max(retryPolicy?.maxRetryCount ?? 5, 1) : 0,
      maxRetryDays: enabled ? (retryPolicy?.maxRetryDays ?? 7) : 0,
    });
  };

  const handleUnlimitedRetryWindowChange = (checked: boolean) => {
    patchRetryPolicy({
      unlimitedRetryWindow: checked,
      maxRetryDays: checked ? null : (retryPolicy?.maxRetryDays ?? 7),
    });
  };

  const handleCircuitBreakerEnabled = (enabled: boolean) => {
    patchCircuitBreaker(enabled ? { ...DEFAULT_CIRCUIT_BREAKER, enabled: true } : { enabled: false });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Execution control</CardTitle>
          <CardDescription>
            Batch size, chunking within each process, parallelism, rate limits, and execution timeout.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberField
            label="Batch size"
            description="Maximum records per process run. Each run is treated as one batch."
            value={executionPolicy?.batchSize}
            onChange={(v) => patchExecutionPolicy({ batchSize: v })}
          />
          <NumberField
            label="Chunk size"
            description="Records processed per chunk within the batch."
            value={executionPolicy?.chunkSize}
            onChange={(v) => patchExecutionPolicy({ chunkSize: v })}
          />
          <NumberField
            label="Max parallel chunks"
            description="Maximum chunks running concurrently."
            value={executionPolicy?.maxParallelChunks}
            onChange={(v) => patchExecutionPolicy({ maxParallelChunks: v })}
          />
          <NumberField
            label="Execution timeout (seconds)"
            description="Maximum duration before the run is timed out."
            value={executionPolicy?.executionTimeoutSeconds}
            onChange={(v) => patchExecutionPolicy({ executionTimeoutSeconds: v })}
          />
          <div className="md:col-span-2 flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label>Unlimited request rate</Label>
              <p className="text-xs text-muted-foreground">No outbound rate limit for this integration.</p>
            </div>
            <Switch
              checked={executionPolicy?.unlimitedRequestRate ?? false}
              onCheckedChange={(checked) =>
                patchExecutionPolicy({
                  unlimitedRequestRate: checked,
                  requestsPerSecond: checked ? null : (executionPolicy?.requestsPerSecond ?? 20),
                })
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="requestsPerSecond">Requests per second</Label>
            <Input
              id="requestsPerSecond"
              type="number"
              min={1}
              disabled={executionPolicy?.unlimitedRequestRate}
              value={executionPolicy?.unlimitedRequestRate ? "" : (executionPolicy?.requestsPerSecond ?? "")}
              onChange={(e) => {
                markTouched("requestsPerSecond");
                patchExecutionPolicy({ requestsPerSecond: Number(e.target.value) || null });
              }}
              onBlur={() => markTouched("requestsPerSecond")}
              placeholder={executionPolicy?.unlimitedRequestRate ? "Unlimited" : "20"}
            />
            <p className="text-xs text-muted-foreground">Maximum outbound requests per second.</p>
            <FieldError message={requestsPerSecondError} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Retry policy</CardTitle>
          <CardDescription>How failed executions are retried before moving to DLQ.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <Label>Retry enabled</Label>
            <Switch checked={retryPolicy?.enabled ?? false} onCheckedChange={handleRetryEnabledChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Retry strategy</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={!retryPolicy?.enabled}
                value={retryPolicy?.strategy ?? RetryStrategy.EXPONENTIAL}
                onChange={(e) => patchRetryPolicy({ strategy: e.target.value as RetryStrategy })}
              >
                {RETRY_STRATEGIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <NumberField
              label="Max retry count"
              description="Attempts before DLQ."
              value={retryPolicy?.maxRetryCount}
              disabled={!retryPolicy?.enabled}
              onChange={(v) => patchRetryPolicy({ maxRetryCount: v })}
            />
            <NumberField
              label="Initial retry interval (seconds)"
              description="Delay before the first retry."
              value={retryPolicy?.initialRetryIntervalSeconds}
              disabled={!retryPolicy?.enabled}
              onChange={(v) => patchRetryPolicy({ initialRetryIntervalSeconds: v })}
            />
            <NumberField
              label="Max retry interval (seconds)"
              description="Maximum backoff delay."
              value={retryPolicy?.maxRetryIntervalSeconds}
              disabled={!retryPolicy?.enabled}
              onChange={(v) => patchRetryPolicy({ maxRetryIntervalSeconds: v })}
            />
            <div className="md:col-span-2 flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label>Unlimited retry window</Label>
                <p className="text-xs text-muted-foreground">No calendar cutoff for retries.</p>
              </div>
              <Switch
                checked={retryPolicy?.unlimitedRetryWindow ?? false}
                disabled={!retryPolicy?.enabled}
                onCheckedChange={handleUnlimitedRetryWindowChange}
              />
            </div>
            <NumberField
              label="Max retry days"
              description="Calendar retry window."
              value={retryPolicy?.unlimitedRetryWindow ? undefined : (retryPolicy?.maxRetryDays ?? undefined)}
              disabled={!retryPolicy?.enabled || retryPolicy?.unlimitedRetryWindow}
              onChange={(v) => patchRetryPolicy({ maxRetryDays: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Failure notification</CardTitle>
          <CardDescription>Who is notified after retry exhaustion or DLQ creation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <Label>Notify on failure</Label>
            <Switch
              checked={failureNotification?.notifyOnFailure ?? false}
              onCheckedChange={(v) => patchFailureNotification({ notifyOnFailure: v })}
            />
          </div>
          {failureNotification?.notifyOnFailure && (
            <>
              <div className="space-y-2">
                <Label>Notification channels</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {NOTIFICATION_CHANNELS.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/40"
                    >
                      <Checkbox
                        checked={failureNotification.channels.includes(value)}
                        onCheckedChange={(checked) => toggleChannel(value, checked === true)}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {failureNotification.channels.includes(NotificationChannel.EMAIL) && (
                <div className="space-y-2">
                  <Label>Notification emails</Label>
                  <div className="flex flex-wrap gap-2 min-h-10 p-2 rounded-lg border bg-background">
                    {(failureNotification.emails ?? []).map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium"
                      >
                        {email}
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => removeEmail(email)}
                          aria-label={`Remove ${email}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <Input
                      value={emailDraft}
                      onChange={(e) => setEmailDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addEmail();
                        }
                      }}
                      onBlur={() => markTouched("emails")}
                      placeholder="Add email and press Enter"
                      className="flex-1 min-w-[180px] border-0 shadow-none focus-visible:ring-0 h-8"
                    />
                  </div>
                  <FieldError message={emailError} />
                </div>
              )}
              {failureNotification.channels.includes(NotificationChannel.WEBHOOK) && (
                <div className="space-y-2">
                  <Label>Notification webhook URL</Label>
                  <Input
                    value={failureNotification.webhookUrl ?? ""}
                    onChange={(e) => patchFailureNotification({ webhookUrl: e.target.value })}
                    placeholder="https://hooks.example.com/alerts"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Circuit breaker</CardTitle>
          <CardDescription>
            Protect downstream systems from repeated failures. When the circuit opens, integration status becomes BREAK until recovery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <Label>Enable circuit breaker</Label>
            <Switch
              checked={circuitBreaker?.enabled ?? false}
              onCheckedChange={handleCircuitBreakerEnabled}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberField
              label="Failure threshold"
              description="Consecutive failures before opening."
              value={circuitBreaker?.failureThreshold}
              disabled={!circuitBreaker?.enabled}
              onChange={(v) => patchCircuitBreaker({ failureThreshold: v })}
            />
            <NumberField
              label="Open duration (seconds)"
              description="Time before half-open probes."
              value={circuitBreaker?.openDurationSeconds}
              disabled={!circuitBreaker?.enabled}
              onChange={(v) => patchCircuitBreaker({ openDurationSeconds: v })}
            />
            <NumberField
              label="Half-open probe count"
              description="Test requests while half-open."
              value={circuitBreaker?.halfOpenProbeCount}
              disabled={!circuitBreaker?.enabled}
              onChange={(v) => patchCircuitBreaker({ halfOpenProbeCount: v })}
            />
            <NumberField
              label="Success threshold"
              description="Successful probes to close the circuit."
              value={circuitBreaker?.successThreshold}
              disabled={!circuitBreaker?.enabled}
              onChange={(v) => patchCircuitBreaker({ successThreshold: v })}
            />
            <NumberField
              label="Minimum request volume"
              description="Requests before evaluating threshold."
              value={circuitBreaker?.minimumRequestVolume}
              disabled={!circuitBreaker?.enabled}
              onChange={(v) => patchCircuitBreaker({ minimumRequestVolume: v })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NumberField({
  label,
  description,
  value,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  value?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min={1}
        disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
