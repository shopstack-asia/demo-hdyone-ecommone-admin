import { RetryTable } from "@/components/observability/observability-tables";
import { retryService } from "@/services";

interface RetryPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantRetryPage({ params }: RetryPageProps) {
  const { id } = await params;
  const { data: records } = await retryService.listRecords({ tenantId: id, page: 1, pageSize: 50 });
  return <RetryTable records={records} />;
}
