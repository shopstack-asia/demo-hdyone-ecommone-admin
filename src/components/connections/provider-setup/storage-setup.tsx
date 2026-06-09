"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/wizard/field-error";
import { SecretInput } from "./shared/secret-input";
import { SetupSection } from "./shared/setup-section";
import type { ProviderAuthSetupProps } from "@/lib/provider-connection/types";
import { cn } from "@/lib/utils";

function FileTransferSetup({ configuration, onChange, errors, protocol }: { protocol: "sftp" | "ftp" } & ProviderAuthSetupProps) {
  const isSftp = protocol === "sftp";
  const authType = configuration.authType ?? "password";

  return (
    <div className="space-y-6 max-w-2xl">
      <SetupSection title={`${protocol.toUpperCase()} server connection`} description={`Connect to a remote ${protocol.toUpperCase()} server for batch file exchange.`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input id="host" placeholder="sftp.example.com" value={configuration.host ?? ""} onChange={(e) => onChange("host", e.target.value)} aria-invalid={!!errors.host} />
            <FieldError message={errors.host} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input id="port" type="number" placeholder={isSftp ? "22" : "21"} value={configuration.port ?? ""} onChange={(e) => onChange("port", e.target.value)} aria-invalid={!!errors.port} />
            <FieldError message={errors.port} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={configuration.username ?? ""} onChange={(e) => onChange("username", e.target.value)} aria-invalid={!!errors.username} />
            <FieldError message={errors.username} />
          </div>
        </div>
        {isSftp && (
          <>
            <div className="space-y-2">
              <Label>Authentication method</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["password", "private_key"] as const).map((t) => (
                  <button key={t} type="button" aria-pressed={authType === t} onClick={() => onChange("authType", t)}
                    className={cn("p-3 rounded-lg border text-sm", authType === t ? "border-primary bg-primary-subtle" : "border-border")}>
                    {t === "password" ? "Password" : "Private Key"}
                  </button>
                ))}
              </div>
            </div>
            {authType === "password" ? (
              <SecretInput id="password" label="Password" value={configuration.password ?? ""} onChange={(v) => onChange("password", v)} error={errors.password} />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="privateKeyRef">Private key reference</Label>
                <Input id="privateKeyRef" placeholder="vault://secrets/sftp-private-key" value={configuration.privateKeyRef ?? ""} onChange={(e) => onChange("privateKeyRef", e.target.value)} aria-invalid={!!errors.privateKeyRef} />
                <p className="text-xs text-muted-foreground">Reference to uploaded key or secret manager path</p>
                <FieldError message={errors.privateKeyRef} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rootPath">Root path</Label>
              <Input id="rootPath" placeholder="/data/outbound" value={configuration.rootPath ?? ""} onChange={(e) => onChange("rootPath", e.target.value)} aria-invalid={!!errors.rootPath} />
              <FieldError message={errors.rootPath} />
            </div>
          </>
        )}
        {!isSftp && (
          <SecretInput id="password" label="Password" value={configuration.password ?? ""} onChange={(v) => onChange("password", v)} error={errors.password} />
        )}
      </SetupSection>
    </div>
  );
}

export function SftpAuthSetup(props: ProviderAuthSetupProps) {
  return <FileTransferSetup {...props} protocol="sftp" />;
}

export function FtpAuthSetup(props: ProviderAuthSetupProps) {
  return <FileTransferSetup {...props} protocol="ftp" />;
}

export function S3AuthSetup({ configuration, onChange, errors }: ProviderAuthSetupProps) {
  const authMethod = configuration.authMethod ?? "iam_role";

  return (
    <div className="space-y-6 max-w-2xl">
      <SetupSection title="Amazon S3 connection" description="Connect to an S3 bucket using IAM credentials.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bucket">Bucket name</Label>
            <Input id="bucket" placeholder="ecomm-data-lake-prod" value={configuration.bucket ?? ""} onChange={(e) => onChange("bucket", e.target.value)} aria-invalid={!!errors.bucket} />
            <FieldError message={errors.bucket} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input id="region" placeholder="ap-southeast-1" value={configuration.region ?? ""} onChange={(e) => onChange("region", e.target.value)} aria-invalid={!!errors.region} />
            <FieldError message={errors.region} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="prefix">Prefix (optional)</Label>
            <Input id="prefix" placeholder="integrations/orders/" value={configuration.prefix ?? ""} onChange={(e) => onChange("prefix", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Authentication</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["iam_role", "access_key"] as const).map((m) => (
              <button key={m} type="button" aria-pressed={authMethod === m} onClick={() => onChange("authMethod", m)}
                className={cn("p-3 rounded-lg border text-sm", authMethod === m ? "border-primary bg-primary-subtle" : "border-border")}>
                {m === "iam_role" ? "IAM Role" : "Access Key"}
              </button>
            ))}
          </div>
        </div>
        {authMethod === "iam_role" ? (
          <div className="space-y-2">
            <Label htmlFor="accessRoleArn">IAM Role ARN</Label>
            <Input id="accessRoleArn" placeholder="arn:aws:iam::123456789012:role/EcommIntegrationRole" className="font-mono text-xs" value={configuration.accessRoleArn ?? ""} onChange={(e) => onChange("accessRoleArn", e.target.value)} aria-invalid={!!errors.accessRoleArn} />
            <FieldError message={errors.accessRoleArn} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accessKeyId">Access Key ID</Label>
              <Input id="accessKeyId" className="font-mono" value={configuration.accessKeyId ?? ""} onChange={(e) => onChange("accessKeyId", e.target.value)} aria-invalid={!!errors.accessKeyId} />
              <FieldError message={errors.accessKeyId} />
            </div>
            <SecretInput id="secretAccessKey" label="Secret Access Key" value={configuration.secretAccessKey ?? ""} onChange={(v) => onChange("secretAccessKey", v)} error={errors.secretAccessKey} />
          </div>
        )}
      </SetupSection>
    </div>
  );
}
