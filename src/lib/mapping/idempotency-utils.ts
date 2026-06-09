import type { FlatSchemaField } from "@/lib/mapping/schema-utils";
import { IDEMPOTENCY_TOKENS } from "@/lib/integration-runtime-defaults";

export type IdempotencyFieldSide = "source" | "destination";

export function buildIdempotencyFieldToken(side: IdempotencyFieldSide, path: string): string {
  return `${side}.${path}`;
}

export function parseIdempotencyFieldToken(
  token: string
): { side: IdempotencyFieldSide; path: string } | null {
  if (token.startsWith("source.")) {
    return { side: "source", path: token.slice("source.".length) };
  }
  if (token.startsWith("destination.")) {
    return { side: "destination", path: token.slice("destination.".length) };
  }
  return null;
}

export function isSystemIdempotencyToken(token: string): boolean {
  return (IDEMPOTENCY_TOKENS as readonly string[]).includes(token);
}

export function formatIdempotencyTokenLabel(token: string): string {
  const field = parseIdempotencyFieldToken(token);
  if (field) {
    return `${field.side}.${field.path}`;
  }
  return token;
}

export function buildIdempotencyPreviewFromTemplate(
  keyTemplate: string[],
  context: Record<string, string>,
  sourceFields: FlatSchemaField[] = [],
  destinationFields: FlatSchemaField[] = []
): string {
  return keyTemplate
    .map((token) => {
      const field = parseIdempotencyFieldToken(token);
      if (field?.side === "source") {
        return sourceFields.find((f) => f.path === field.path)?.sampleValue ?? field.path;
      }
      if (field?.side === "destination") {
        return destinationFields.find((f) => f.path === field.path)?.sampleValue ?? field.path;
      }
      return context[token] ?? token;
    })
    .join(" + ");
}
