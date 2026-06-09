"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OAuthConnectPanelProps {
  providerName: string;
  authMethod: string;
  /** Production-format authorization URL opened in the popup (unless mock mode) */
  oauthUrl?: string;
  /** When true, opens local consent simulator instead of marketplace */
  useMockOAuth?: boolean;
  connected: boolean;
  connecting: boolean;
  onConnect: () => void;
  connectDisabled?: boolean;
  connectDisabledReason?: string;
  connectLabel?: string;
  oauthError?: string | null;
  className?: string;
}

export function OAuthConnectPanel({
  providerName,
  authMethod,
  oauthUrl,
  useMockOAuth = false,
  connected,
  connecting,
  onConnect,
  connectDisabled = false,
  connectDisabledReason,
  connectLabel,
  oauthError,
  className,
}: OAuthConnectPanelProps) {
  const label = connectLabel ?? `Connect ${providerName}`;

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card/80 p-6 space-y-4", className)}>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Authentication Method</p>
        <p className="text-sm font-semibold mt-1">{authMethod}</p>
      </div>

      {connected ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-success-subtle border border-success/20">
          <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
          <div>
            <p className="font-medium text-success-subtle-foreground">Connected successfully</p>
            <p className="text-xs text-muted-foreground mt-0.5">OAuth tokens received and stored securely</p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {useMockOAuth
              ? `Simulated consent screen (mock mode). Set NEXT_PUBLIC_MOCK_MARKETPLACE_OAUTH=false to open ${providerName} directly.`
              : `Opens the ${providerName} authorization page in a new window. After sign-in, you will be redirected back to CommerceOne.`}
          </p>
          {oauthUrl && (
            <div className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {useMockOAuth ? "Production URL (reference)" : "Authorization URL"}
              </p>
              <p className="text-[10px] font-mono break-all text-muted-foreground bg-muted/40 rounded-md p-2.5 leading-relaxed">
                {oauthUrl}
              </p>
            </div>
          )}
          {connectDisabledReason && connectDisabled && (
            <p className="text-xs text-warning-subtle-foreground bg-warning-subtle border border-warning/20 rounded-md px-3 py-2">
              {connectDisabledReason}
            </p>
          )}
          {oauthError && (
            <p className="text-xs text-destructive bg-destructive-subtle border border-destructive/20 rounded-md px-3 py-2">
              {oauthError}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={onConnect} disabled={connecting || connectDisabled} className="min-h-11">
              {connecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              {label}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
