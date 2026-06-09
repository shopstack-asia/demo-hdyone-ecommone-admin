import { redirect } from "next/navigation";

interface TenantPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { id } = await params;
  redirect(`/tenants/${id}/overview`);
}
