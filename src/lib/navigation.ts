export function safeReturnPath(value: string | undefined | null, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

export function dlqDetailPath(dlqId: string, returnTo?: string): string {
  if (!returnTo) return `/dlq/${dlqId}`;
  return `/dlq/${dlqId}?returnTo=${encodeURIComponent(returnTo)}`;
}
