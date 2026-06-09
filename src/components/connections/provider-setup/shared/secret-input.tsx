"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/wizard/field-error";
import { cn } from "@/lib/utils";

interface SecretInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  description?: string;
  className?: string;
}

export function SecretInput({ id, label, value, onChange, error, placeholder, description, className }: SecretInputProps) {
  return (
    <div className={cn("space-y-2 min-w-0", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Enter secret value"}
        aria-invalid={!!error}
        autoComplete="off"
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <FieldError message={error} />
    </div>
  );
}

export function MaskedSecretDisplay({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs uppercase tracking-wide">{label}</dt>
      <dd className="font-mono font-medium mt-1">{value ? "••••••••••••" : "—"}</dd>
    </div>
  );
}
