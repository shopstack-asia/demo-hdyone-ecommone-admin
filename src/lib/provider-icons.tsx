import {
  ArrowLeftRight,
  Cloud,
  Globe,
  HardDrive,
  Package,
  Server,
  ShoppingBag,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { ProviderCategory } from "@/types/enums";

const PROVIDER_ICON_MAP: Record<string, LucideIcon> = {
  shopee: ShoppingBag,
  lazada: ShoppingBag,
  tiktok: ShoppingBag,
  sap: Server,
  rest: Globe,
  webhook: Webhook,
  sftp: HardDrive,
  ftp: HardDrive,
  s3: Cloud,
  netsuite: Server,
};

const CATEGORY_ICON_MAP: Record<ProviderCategory, LucideIcon> = {
  MARKETPLACE: ShoppingBag,
  ERP: Server,
  PROTOCOL: ArrowLeftRight,
  STORAGE: HardDrive,
  CRM: Package,
  WMS: Package,
  CUSTOM: Globe,
};

export function getProviderIcon(code: string, category: ProviderCategory): LucideIcon {
  return PROVIDER_ICON_MAP[code] ?? CATEGORY_ICON_MAP[category] ?? Globe;
}
