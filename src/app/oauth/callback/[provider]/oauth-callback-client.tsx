"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { exchangeOAuthCode } from "@/lib/provider-connection/simulate";
import {
  OAUTH_MESSAGE_TYPE,
  verifyOAuthState,
  consumeOAuthPendingConfig,
  type MarketplaceProvider,
} from "@/lib/provider-connection/oauth";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

interface OAuthCallbackClientProps {
  provider: MarketplaceProvider;
}

export function OAuthCallbackClient({ provider }: OAuthCallbackClientProps) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Completing authorization…");

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      const shopId = searchParams.get("shop_id");

      const post = (success: boolean, tokens?: Record<string, string>, err?: string) => {
        if (window.opener) {
          window.opener.postMessage(
            {
              type: OAUTH_MESSAGE_TYPE,
              provider,
              success,
              tokens,
              error: err,
            },
            window.location.origin
          );
        }
      };

      if (error) {
        setStatus("error");
        setMessage(errorDescription ?? error);
        post(false, undefined, errorDescription ?? error);
        return;
      }

      if (!code || !verifyOAuthState(provider, state)) {
        setStatus("error");
        setMessage("Invalid or expired authorization state. Close this window and try again.");
        post(false, undefined, "Invalid OAuth state");
        return;
      }

      await new Promise((r) => setTimeout(r, 800));

      const pendingConfig = consumeOAuthPendingConfig(provider);
      const region =
        searchParams.get("region") ??
        searchParams.get("country") ??
        pendingConfig.region ??
        pendingConfig.defaultCountry ??
        "TH";

      const tokens = exchangeOAuthCode(provider, code, {
        shopId: shopId ?? undefined,
        region,
        config: pendingConfig,
      });

      setStatus("success");
      setMessage("Authorization complete. This window will close automatically.");
      post(true, tokens);

      setTimeout(() => window.close(), 1500);
    };

    void run();
  }, [provider, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="max-w-sm w-full rounded-xl border bg-card p-8 text-center space-y-4 shadow-sm">
        {status === "processing" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-sm font-medium">{message}</p>
            <p className="text-xs text-muted-foreground">Exchanging authorization code for access tokens…</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
            <p className="text-sm font-medium text-success-subtle-foreground">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-sm font-medium text-destructive">{message}</p>
            <p className="text-xs text-muted-foreground">You can close this window and retry authorization.</p>
          </>
        )}
      </div>
    </div>
  );
}
