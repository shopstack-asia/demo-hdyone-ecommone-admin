import { describe, it, expect } from "vitest";
import {
  createIntegrationSchema,
  executionPolicySchema,
  failureNotificationSchema,
  saveIntegrationDraftSchema,
} from "@/lib/schemas/integration.schema";
import { NotificationChannel, RetryStrategy, TriggerType } from "@/types/enums";

describe("executionPolicySchema", () => {
  it("accepts unlimited request rate without requestsPerSecond", () => {
    expect(
      executionPolicySchema.safeParse({
        batchSize: 100,
        chunkSize: 10,
        maxParallelChunks: 5,
        requestsPerSecond: null,
        unlimitedRequestRate: true,
        executionTimeoutSeconds: 900,
      }).success
    ).toBe(true);
  });

  it("requires requestsPerSecond when rate is limited", () => {
    expect(
      executionPolicySchema.safeParse({
        batchSize: 100,
        chunkSize: 10,
        maxParallelChunks: 5,
        requestsPerSecond: null,
        unlimitedRequestRate: false,
        executionTimeoutSeconds: 900,
      }).success
    ).toBe(false);
  });
});

describe("failureNotificationSchema", () => {
  it("requires email when EMAIL channel is selected", () => {
    expect(
      failureNotificationSchema.safeParse({
        notifyOnFailure: true,
        channels: [NotificationChannel.EMAIL],
        emails: [],
      }).success
    ).toBe(false);
  });

  it("allows empty emails when notification is disabled", () => {
    expect(
      failureNotificationSchema.safeParse({
        notifyOnFailure: false,
        channels: [],
        emails: [],
      }).success
    ).toBe(true);
  });
});

describe("saveIntegrationDraftSchema", () => {
  it("accepts code and name only", () => {
    expect(
      saveIntegrationDraftSchema.safeParse({
        code: "INT-DRAFT-001",
        name: "Draft Integration",
      }).success
    ).toBe(true);
  });

  it("rejects missing name", () => {
    expect(
      saveIntegrationDraftSchema.safeParse({
        code: "INT-DRAFT-001",
        name: "a",
      }).success
    ).toBe(false);
  });
});

describe("createIntegrationSchema", () => {
  const valid = {
    code: "INT-TEST-001",
    name: "Test Integration",
    description: "",
    tags: "",
    owner: "",
    sourceConnectionId: "CON-000001",
    destinationConnectionId: "CON-000002",
    dataFlowId: "shopee-orders",
    triggerType: TriggerType.SCHEDULE,
  };

  it("accepts valid input", () => {
    expect(createIntegrationSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts runtime policy config for edit saves", () => {
    expect(
      createIntegrationSchema.safeParse({
        ...valid,
        executionPolicy: {
          batchSize: 1000,
          chunkSize: 100,
          maxParallelChunks: 10,
          requestsPerSecond: 20,
          unlimitedRequestRate: false,
          executionTimeoutSeconds: 900,
        },
        retryPolicy: {
          enabled: true,
          strategy: RetryStrategy.EXPONENTIAL,
          maxRetryCount: 5,
          initialRetryIntervalSeconds: 60,
          maxRetryIntervalSeconds: 3600,
          maxRetryDays: 7,
          unlimitedRetryWindow: false,
        },
        failureNotification: {
          notifyOnFailure: true,
          channels: [NotificationChannel.EMAIL],
          emails: ["ops@example.com"],
        },
      }).success
    ).toBe(true);
  });

  it("rejects duplicate source and destination", () => {
    const result = createIntegrationSchema.safeParse({
      ...valid,
      destinationConnectionId: valid.sourceConnectionId,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid code format", () => {
    const result = createIntegrationSchema.safeParse({ ...valid, code: "lowercase" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = createIntegrationSchema.safeParse({ ...valid, name: "a" });
    expect(result.success).toBe(false);
  });
});
