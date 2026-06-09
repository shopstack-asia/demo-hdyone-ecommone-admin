import { NotificationChannel, RetryStrategy, TriggerType } from "@/types/enums";
import { z } from "zod";

const positiveInt = z.number().int().positive();

export const triggerConfigSchema = z.object({
  cron: z.string().optional(),
  cronExpression: z.string().optional(),
  timezone: z.string().optional(),
  enabled: z.boolean().optional(),
  pollingMode: z.boolean().optional(),
  pollingDirectory: z.string().optional(),
  sourcePath: z.string().optional(),
  filePattern: z.string().optional(),
  processedFolder: z.string().optional(),
  processedPath: z.string().optional(),
  errorFolder: z.string().optional(),
  errorPath: z.string().optional(),
  webhookUrl: z.string().optional(),
  signingSecret: z.string().optional(),
  signatureVerification: z.boolean().optional(),
  signatureVerificationEnabled: z.boolean().optional(),
  allowedIps: z.union([z.string(), z.array(z.string())]).optional(),
  apiEndpoint: z.string().optional(),
  apiKeyRequired: z.boolean().optional(),
  allowedMethods: z.union([z.string(), z.array(z.string())]).optional(),
  manualRunEnabled: z.boolean().optional(),
});

export const executionPolicySchema = z
  .object({
    batchSize: positiveInt,
    chunkSize: positiveInt,
    maxParallelChunks: positiveInt,
    requestsPerSecond: positiveInt.nullable(),
    unlimitedRequestRate: z.boolean(),
    executionTimeoutSeconds: positiveInt,
  })
  .superRefine((data, ctx) => {
    if (data.unlimitedRequestRate) return;
    if (data.requestsPerSecond == null || data.requestsPerSecond <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a request rate greater than 0, or enable unlimited request rate.",
        path: ["requestsPerSecond"],
      });
    }
  });

export const retryPolicySchema = z
  .object({
    enabled: z.boolean(),
    strategy: z.enum(RetryStrategy),
    maxRetryCount: z.number().int().min(0),
    initialRetryIntervalSeconds: positiveInt,
    maxRetryIntervalSeconds: positiveInt,
    maxRetryDays: z.number().int().min(0).nullable(),
    unlimitedRetryWindow: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.enabled) return;
    if (data.maxRetryCount <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Max retry count must be greater than 0 when retry is enabled.",
        path: ["maxRetryCount"],
      });
    }
    if (!data.unlimitedRetryWindow && (data.maxRetryDays == null || data.maxRetryDays <= 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter max retry days or enable unlimited retry window.",
        path: ["maxRetryDays"],
      });
    }
  });

export const failureNotificationSchema = z
  .object({
    notifyOnFailure: z.boolean(),
    channels: z.array(z.enum(NotificationChannel)),
    emails: z.array(z.string().email()),
    webhookUrl: z.string().url().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!data.notifyOnFailure) return;
    if (data.channels.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one notification channel.",
        path: ["channels"],
      });
    }
    if (data.channels.includes(NotificationChannel.EMAIL) && data.emails.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Add at least one notification email.",
        path: ["emails"],
      });
    }
  });

export const circuitBreakerSchema = z.object({
  enabled: z.boolean(),
  failureThreshold: positiveInt,
  openDurationSeconds: positiveInt,
  halfOpenProbeCount: positiveInt,
  successThreshold: positiveInt,
  minimumRequestVolume: positiveInt,
});

export const idempotencySchema = z.object({
  enabled: z.boolean(),
  keyTemplate: z.array(z.string()).min(1, "Select at least one idempotency token."),
});

const integrationRuntimeFields = {
  executionPolicy: executionPolicySchema.optional(),
  retryPolicy: retryPolicySchema.optional(),
  failureNotification: failureNotificationSchema.optional(),
  circuitBreaker: circuitBreakerSchema.optional(),
  idempotency: idempotencySchema.optional(),
};

export const createIntegrationSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(32, "Code must be at most 32 characters")
      .regex(
        /^[A-Z][A-Z0-9-]*$/,
        "Code must start with a letter and contain only uppercase letters, numbers, and hyphens"
      ),
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name must be at most 120 characters"),
    description: z
      .string()
      .trim()
      .max(500, "Description must be at most 500 characters")
      .optional()
      .or(z.literal("")),
    tags: z.string().optional().or(z.literal("")),
    owner: z.string().trim().max(120).optional().or(z.literal("")),
    sourceConnectionId: z.string().min(1, "Select a source connection"),
    destinationConnectionId: z.string().min(1, "Select a destination connection"),
    dataFlowId: z.string().min(1, "Select a data flow"),
    triggerType: z.enum(TriggerType, { error: "Select a trigger type" }),
    triggerConfig: triggerConfigSchema.optional(),
    mappingProfileCode: z.string().optional(),
    useSuggestedProfiles: z.boolean().optional(),
    ...integrationRuntimeFields,
  })
  .refine((data) => data.sourceConnectionId !== data.destinationConnectionId, {
    message: "Source and destination connections must be different",
    path: ["destinationConnectionId"],
  });

export type CreateIntegrationInput = z.infer<typeof createIntegrationSchema>;

export const saveIntegrationDraftSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(32, "Code must be at most 32 characters")
      .regex(
        /^[A-Z][A-Z0-9-]*$/,
        "Code must start with a letter and contain only uppercase letters, numbers, and hyphens"
      ),
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name must be at most 120 characters"),
    description: z
      .string()
      .trim()
      .max(500, "Description must be at most 500 characters")
      .optional()
      .or(z.literal("")),
    tags: z.string().optional().or(z.literal("")),
    owner: z.string().trim().max(120).optional().or(z.literal("")),
    sourceConnectionId: z.string().optional().or(z.literal("")),
    destinationConnectionId: z.string().optional().or(z.literal("")),
    dataFlowId: z.string().optional().or(z.literal("")),
    triggerType: z.enum(TriggerType).optional(),
    triggerConfig: triggerConfigSchema.optional(),
    mappingProfileCode: z.string().optional(),
    useSuggestedProfiles: z.boolean().optional(),
    ...integrationRuntimeFields,
  })
  .refine(
    (data) => {
      if (!data.sourceConnectionId || !data.destinationConnectionId) return true;
      return data.sourceConnectionId !== data.destinationConnectionId;
    },
    {
      message: "Source and destination connections must be different",
      path: ["destinationConnectionId"],
    }
  );

export type SaveIntegrationDraftInput = z.infer<typeof saveIntegrationDraftSchema>;
