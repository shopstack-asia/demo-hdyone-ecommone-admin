import { Suspense } from "react";
import { OAuthCallbackClient } from "./oauth-callback-client";
import type { MarketplaceProvider } from "@/lib/provider-connection/oauth";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";

const VALID: MarketplaceProvider[] = ["shopee", "lazada", "tiktok"];

export default async function OAuthCallbackPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const { provider } = await params;
  if (!VALID.includes(provider as MarketplaceProvider)) notFound();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <OAuthCallbackClient provider={provider as MarketplaceProvider} />
    </Suspense>
  );
}
