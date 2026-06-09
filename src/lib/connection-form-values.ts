import type { Connection } from "@/types/domain";

export function configurationToFormValues(
  configuration: Record<string, unknown> | undefined
): Record<string, string> {
  if (!configuration) return {};
  return Object.fromEntries(
    Object.entries(configuration).map(([key, value]) => [
      key,
      value == null ? "" : String(value),
    ])
  );
}

export function connectionToFormValues(connection: Connection) {
  return {
    name: connection.name,
    configuration: configurationToFormValues(connection.configuration),
  };
}
