import { CreateConnectionForm } from "@/components/connections/create-connection-form";
import { providerService } from "@/services";

interface NewConnectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewConnectionPage({ params }: NewConnectionPageProps) {
  const { id } = await params;
  const { data: providers } = await providerService.listProviders({ pageSize: 100 });

  return <CreateConnectionForm tenantId={id} providers={providers} />;
}
