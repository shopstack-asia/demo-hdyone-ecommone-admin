"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTenantAction } from "@/actions/tenant.actions";
import {
  createTenantSchema,
  TENANT_COUNTRIES,
  type CreateTenantInput,
} from "@/lib/schemas/tenant.schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { FieldError } from "@/components/wizard/field-error";
import { WizardLayout } from "@/components/wizard/wizard-layout";
import type { PlatformUser } from "@/types/domain";
import { PlatformUserStatus } from "@/types/enums";
import { AlertCircle } from "lucide-react";

const STEPS = ["Tenant Information", "Assign Users", "Review"];

const ROLE_LABELS: Record<string, string> = {
  PLATFORM_ADMIN: "Platform Admin",
  TENANT_OPERATOR: "Tenant Operator",
  TENANT_VIEWER: "Tenant Viewer",
};

interface CreateTenantFormProps {
  platformUsers: PlatformUser[];
  creatorUserId: string;
}

export function CreateTenantForm({ platformUsers, creatorUserId }: CreateTenantFormProps) {
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const assignableUsers = useMemo(
    () => platformUsers.filter((u) => u.status === PlatformUserStatus.ACTIVE),
    [platformUsers]
  );

  const userMap = useMemo(
    () => new Map(assignableUsers.map((u) => [u.id, u])),
    [assignableUsers]
  );

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return assignableUsers;
    return assignableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [assignableUsers, userSearch]);

  const form = useForm<CreateTenantInput>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      name: "",
      code: "",
      country: "",
      timezone: "",
      description: "",
      assignedUserIds: [creatorUserId],
    },
    mode: "onBlur",
  });

  const { register, watch, setValue, trigger, formState: { errors } } = form;
  const values = watch();
  const timezoneOptions = [...new Set(TENANT_COUNTRIES.map((c) => c.timezone))];

  const toggleUser = (userId: string, checked: boolean) => {
    if (userId === creatorUserId) return;
    const current = values.assignedUserIds ?? [];
    setValue(
      "assignedUserIds",
      checked ? [...current, userId] : current.filter((id) => id !== userId),
      { shouldValidate: true }
    );
  };

  const validateStep = async () => {
    if (step === 0) return trigger(["name", "code", "country", "timezone", "description"]);
    if (step === 1) return trigger(["assignedUserIds"]);
    return true;
  };

  const handleNext = async () => {
    setSubmitError(null);
    const valid = await validateStep();
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setSubmitError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleCreate = () => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createTenantAction(values);
      if (result && !result.success) {
        setSubmitError(result.error);
        if (result.fieldErrors?.code || result.fieldErrors?.name || result.fieldErrors?.country) {
          setStep(0);
        } else if (result.fieldErrors?.assignedUserIds) {
          setStep(1);
        }
      }
    });
  };

  const assignedUsers = (values.assignedUserIds ?? [])
    .map((id) => userMap.get(id))
    .filter(Boolean) as PlatformUser[];

  return (
    <WizardLayout
      title="Create tenant"
      description="Onboard a new tenant to the integration platform."
      steps={STEPS}
      currentStep={step}
      cancelHref="/tenants"
      onBack={handleBack}
      onNext={handleNext}
      isSubmitStep={step === STEPS.length - 1}
      onSubmit={handleCreate}
      submitLabel="Create tenant"
      isPending={isPending}
    >
      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not create tenant</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {step === 0 && (
        <div className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-name">Tenant name</Label>
              <Input id="tenant-name" placeholder="Brand Alpha" maxLength={120} aria-invalid={!!errors.name} {...register("name")} />
              <FieldError message={errors.name?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-code">Tenant code</Label>
              <Input
                id="tenant-code"
                placeholder="BR001"
                className="font-mono uppercase"
                maxLength={12}
                aria-invalid={!!errors.code}
                aria-describedby="tenant-code-hint"
                {...register("code", { onChange: (e) => { e.target.value = e.target.value.toUpperCase(); } })}
              />
              <p id="tenant-code-hint" className="text-xs text-muted-foreground">
                Uppercase letters, numbers, and hyphens. Must be unique across the platform.
              </p>
              <FieldError message={errors.code?.message} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-country">Country</Label>
              <Select
                value={values.country}
                onValueChange={(v) => {
                  setValue("country", v as CreateTenantInput["country"], { shouldValidate: true });
                  const match = TENANT_COUNTRIES.find((c) => c.name === v);
                  if (match) setValue("timezone", match.timezone, { shouldValidate: true });
                }}
              >
                <SelectTrigger id="tenant-country" aria-invalid={!!errors.country}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {TENANT_COUNTRIES.map((c) => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.country?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-timezone">Timezone</Label>
              <Select
                value={values.timezone}
                onValueChange={(v) => setValue("timezone", v as CreateTenantInput["timezone"], { shouldValidate: true })}
              >
                <SelectTrigger id="tenant-timezone" aria-invalid={!!errors.timezone}>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezoneOptions.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.timezone?.message} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-description">Description (optional)</Label>
            <Textarea id="tenant-description" maxLength={500} rows={3} aria-invalid={!!errors.description} {...register("description")} />
            <FieldError message={errors.description?.message} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <p className="text-sm text-muted-foreground">
              Assign platform users who will manage this tenant. You are included by default as the tenant creator.
            </p>
          </div>
          <Input
            placeholder="Search users by name, email, or role..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="min-h-11"
          />
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredUsers.map((user) => {
              const isCreator = user.id === creatorUserId;
              const checked = values.assignedUserIds?.includes(user.id) ?? false;
              return (
                <label
                  key={user.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-3 hover:bg-muted/30 cursor-pointer"
                >
                  <Checkbox
                    checked={checked}
                    disabled={isCreator}
                    onCheckedChange={(value) => toggleUser(user.id, value === true)}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{user.name}</span>
                      {isCreator && (
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                          You · Creator
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono block truncate">{user.email}</span>
                  </span>
                  <StatusBadge status={user.role} className="hidden sm:inline-flex" />
                  <span className="text-xs text-muted-foreground hidden md:inline">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </label>
              );
            })}
            {filteredUsers.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">No users match your search.</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {values.assignedUserIds?.length ?? 0} user{(values.assignedUserIds?.length ?? 0) === 1 ? "" : "s"} assigned
          </p>
          <FieldError message={errors.assignedUserIds?.message} />
        </div>
      )}

      {step === 2 && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 p-6 rounded-lg border border-border/60 bg-muted/30 text-sm max-w-3xl">
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Tenant name</dt>
            <dd className="font-medium mt-1 break-words">{values.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Tenant code</dt>
            <dd className="font-mono font-medium mt-1">{values.code || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Country</dt>
            <dd className="font-medium mt-1">{values.country || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Timezone</dt>
            <dd className="font-mono font-medium mt-1">{values.timezone || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Description</dt>
            <dd className="font-medium mt-1 break-words">{values.description || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Assigned users</dt>
            <dd className="mt-2 space-y-2">
              {assignedUsers.length > 0 ? (
                assignedUsers.map((user) => (
                  <div key={user.id} className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{user.email}</span>
                    {user.id === creatorUserId && (
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">Creator</Badge>
                    )}
                    <StatusBadge status={user.role} />
                  </div>
                ))
              ) : (
                <span className="font-medium">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Initial status</dt>
            <dd className="font-medium mt-1">Pending</dd>
          </div>
        </dl>
      )}
    </WizardLayout>
  );
}
