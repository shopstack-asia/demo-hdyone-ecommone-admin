"use client";

import { useMemo, useState, useTransition } from "react";
import { createPlatformUserAction, updatePlatformUserAction } from "@/actions/access.actions";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import type { PlatformUser, Tenant } from "@/types/domain";
import { PlatformUserRole, PlatformUserStatus } from "@/types/enums";
import { AlertCircle, Loader2, Plus, UserCog } from "lucide-react";

interface AccessTabProps {
  users: PlatformUser[];
  tenants: Tenant[];
}

interface UserFormState {
  name: string;
  email: string;
  role: PlatformUserRole;
  status: PlatformUserStatus;
  tenantIds: string[];
}

const ROLE_LABELS: Record<PlatformUserRole, string> = {
  [PlatformUserRole.PLATFORM_ADMIN]: "Platform Admin",
  [PlatformUserRole.TENANT_OPERATOR]: "Tenant Operator",
  [PlatformUserRole.TENANT_VIEWER]: "Tenant Viewer",
};

function emptyForm(): UserFormState {
  return {
    name: "",
    email: "",
    role: PlatformUserRole.TENANT_OPERATOR,
    status: PlatformUserStatus.ACTIVE,
    tenantIds: [],
  };
}

function userToForm(user: PlatformUser): UserFormState {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    tenantIds: [...user.tenantIds],
  };
}

export function AccessTab({ users, tenants }: AccessTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [tenantSearch, setTenantSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const tenantMap = useMemo(() => new Map(tenants.map((t) => [t.id, t])), [tenants]);
  const filteredTenants = useMemo(() => {
    const q = tenantSearch.trim().toLowerCase();
    if (!q) return tenants;
    return tenants.filter(
      (t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)
    );
  }, [tenants, tenantSearch]);

  const isPlatformAdmin = form.role === PlatformUserRole.PLATFORM_ADMIN;

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm());
    setTenantSearch("");
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (user: PlatformUser) => {
    setEditingUser(user);
    setForm(userToForm(user));
    setTenantSearch("");
    setError(null);
    setDialogOpen(true);
  };

  const toggleTenant = (tenantId: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      tenantIds: checked
        ? [...prev.tenantIds, tenantId]
        : prev.tenantIds.filter((id) => id !== tenantId),
    }));
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const payload = {
        ...form,
        allTenantsAccess: form.role === PlatformUserRole.PLATFORM_ADMIN,
      };
      const result = editingUser
        ? await updatePlatformUserAction(editingUser.id, payload)
        : await createPlatformUserAction(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }
      setDialogOpen(false);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Manage platform users and control which tenants each user can access.
        </p>
        <Button type="button" className="min-h-11" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add user
        </Button>
      </div>

      <DataTable
        caption="Platform users"
        getRowId={(r) => r.id}
        columns={[
          { key: "name", header: "Name", cell: (r) => r.name },
          { key: "email", header: "Email", hideOnMobile: true, cell: (r) => (
            <span className="font-mono text-xs">{r.email}</span>
          )},
          { key: "role", header: "Role", cell: (r) => <StatusBadge status={r.role} /> },
          {
            key: "tenants",
            header: "Tenant Access",
            hideOnMobile: true,
            cell: (r) => <TenantAccessSummary user={r} tenantMap={tenantMap} />,
          },
          { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          {
            key: "lastLogin",
            header: "Last Login",
            hideOnMobile: true,
            cell: (r) => (
              <span className="text-xs text-muted-foreground">{formatDate(r.lastLoginAt)}</span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            cell: (r) => (
              <Button type="button" variant="ghost" size="sm" className="min-h-10" onClick={() => openEdit(r)}>
                <UserCog className="h-4 w-4 mr-1.5" />
                Manage
              </Button>
            ),
          },
        ]}
        data={users}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Manage user access" : "Add platform user"}</DialogTitle>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could not save user</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="access-user-name">Name</Label>
                <Input
                  id="access-user-name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-user-email">Email</Label>
                <Input
                  id="access-user-email"
                  type="email"
                  className="font-mono text-xs"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      role: value as PlatformUserRole,
                      tenantIds: value === PlatformUserRole.PLATFORM_ADMIN ? [] : prev.tenantIds,
                    }))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, status: value as PlatformUserStatus }))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PlatformUserStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={PlatformUserStatus.INACTIVE}>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border/60 p-4">
              <div>
                <p className="text-sm font-medium">Tenant access</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isPlatformAdmin
                    ? "Platform admins can access all tenants."
                    : "Select tenants this user can access."}
                </p>
              </div>

              {!isPlatformAdmin && (
                <>
                  <Input
                    placeholder="Search tenants..."
                    value={tenantSearch}
                    onChange={(e) => setTenantSearch(e.target.value)}
                    className="min-h-10"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {filteredTenants.map((tenant) => {
                      const checked = form.tenantIds.includes(tenant.id);
                      return (
                        <label
                          key={tenant.id}
                          className="flex items-center gap-3 rounded-md border border-border/40 px-3 py-2 cursor-pointer hover:bg-muted/40"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => toggleTenant(tenant.id, value === true)}
                          />
                          <span className="flex-1 min-w-0">
                            <span className="text-sm font-medium block truncate">{tenant.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{tenant.code}</span>
                          </span>
                          <StatusBadge status={tenant.status} />
                        </label>
                      );
                    })}
                    {filteredTenants.length === 0 && (
                      <p className="text-sm text-muted-foreground py-4 text-center">No tenants match your search.</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {form.tenantIds.length} tenant{form.tenantIds.length === 1 ? "" : "s"} selected
                  </p>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending} className="min-h-10">
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TenantAccessSummary({
  user,
  tenantMap,
}: {
  user: PlatformUser;
  tenantMap: Map<string, Tenant>;
}) {
  if (user.allTenantsAccess) {
    return <StatusBadge status="ALL_TENANTS" />;
  }

  const labels = user.tenantIds
    .slice(0, 2)
    .map((id) => tenantMap.get(id)?.code)
    .filter(Boolean) as string[];

  return (
    <div className="flex flex-wrap items-center gap-1">
      {labels.map((code) => (
        <StatusBadge key={code} status={code} />
      ))}
      {user.tenantIds.length > 2 && (
        <span className="text-xs text-muted-foreground">+{user.tenantIds.length - 2} more</span>
      )}
      {user.tenantIds.length === 0 && (
        <span className="text-xs text-muted-foreground">No tenants</span>
      )}
    </div>
  );
}
