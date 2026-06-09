import { ProviderCapability } from "@/types/enums";
import type { Connection, Provider } from "@/types/domain";

export function providerCanBeSource(provider: Provider): boolean {
  return provider.capabilities.includes(ProviderCapability.SOURCE);
}

export function providerCanBeDestination(provider: Provider): boolean {
  return provider.capabilities.includes(ProviderCapability.DESTINATION);
}

export function filterConnectionsForSource(
  connections: Connection[],
  providerMap: Map<string, Provider>
): Connection[] {
  return connections.filter((c) => {
    const provider = providerMap.get(c.providerId);
    return provider ? providerCanBeSource(provider) : false;
  });
}

export function filterConnectionsForDestination(
  connections: Connection[],
  providerMap: Map<string, Provider>
): Connection[] {
  return connections.filter((c) => {
    const provider = providerMap.get(c.providerId);
    return provider ? providerCanBeDestination(provider) : false;
  });
}

export function formatCapabilities(capabilities: ProviderCapability[]): string {
  return capabilities.join(", ");
}
