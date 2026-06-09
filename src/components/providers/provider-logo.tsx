"use client";

import { useState } from "react";
import {
  SiSap,
  SiSapHex,
  SiShopee,
  SiShopeeHex,
  SiTiktok,
  SiTiktokHex,
} from "@icons-pack/react-simple-icons";
import { getProviderIcon } from "@/lib/provider-icons";
import { getProviderCategoryStyles } from "@/lib/provider-card-styles";
import { getLogoDevUrl, getProviderDomain } from "@/lib/logo-dev";
import { cn } from "@/lib/utils";
import { ProviderCategory } from "@/types/enums";

type SimpleIconComponent = React.ComponentType<{
  color?: string;
  size?: number;
  title?: string;
}>;

/** Offline fallback when Logo.dev is unavailable or fails to load */
const SIMPLE_ICON_FALLBACK: Record<
  string,
  { Icon: SimpleIconComponent; color: string; bg: string }
> = {
  shopee: { Icon: SiShopee, color: SiShopeeHex, bg: "#EE4D2D12" },
  tiktok: { Icon: SiTiktok, color: SiTiktokHex, bg: "#00000012" },
  sap: { Icon: SiSap, color: SiSapHex, bg: "#008FD312" },
};

const LOCAL_LOGO_MAP: Record<string, string> = {
  rest: "/providers/rest.svg",
  webhook: "/providers/webhook.svg",
  sftp: "/providers/sftp.svg",
  ftp: "/providers/ftp.svg",
};

interface ProviderLogoProps {
  code: string;
  name: string;
  category: ProviderCategory;
  size?: number;
  className?: string;
  logoClassName?: string;
}

function LogoContainer({
  size,
  className,
  bgClassName,
  children,
}: {
  size: number;
  className?: string;
  bgClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-border/50",
        bgClassName ?? "bg-muted/60",
        className
      )}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}

function SimpleIconLogo({
  code,
  name,
  size,
  className,
  logoClassName,
}: {
  code: string;
  name: string;
  size: number;
  className?: string;
  logoClassName?: string;
}) {
  const config = SIMPLE_ICON_FALLBACK[code.toLowerCase()];
  if (!config) return null;

  const { Icon, color } = config;
  const iconSize = Math.round(size * 0.55);
  return (
    <LogoContainer size={size} className={className} bgClassName={logoClassName}>
      <Icon color={color} size={iconSize} title={`${name} logo`} />
    </LogoContainer>
  );
}

function LogoDevImage({
  domain,
  name,
  size,
  code,
  category,
  className,
  logoClassName,
}: {
  domain: string;
  name: string;
  size: number;
  code: string;
  category: ProviderCategory;
  className?: string;
  logoClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const logoUrl = getLogoDevUrl(domain, {
    size: Math.round(size * 2),
    format: "webp",
    retina: true,
    fallback: "monogram",
  });

  if (!logoUrl || failed) {
    if (SIMPLE_ICON_FALLBACK[code.toLowerCase()]) {
      return (
        <SimpleIconLogo
          code={code}
          name={name}
          size={size}
          className={className}
          logoClassName={logoClassName}
        />
      );
    }

    return (
      <LucideFallback
        code={code}
        name={name}
        category={category}
        size={size}
        className={className}
        logoClassName={logoClassName}
      />
    );
  }

  return (
    <LogoContainer size={size} className={className} bgClassName={logoClassName ?? "bg-card"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-[72%] w-[72%] object-contain"
      />
    </LogoContainer>
  );
}

function LocalLogo({
  src,
  name,
  size,
  className,
  logoClassName,
}: {
  src: string;
  name: string;
  size: number;
  className?: string;
  logoClassName?: string;
}) {
  return (
    <LogoContainer size={size} className={className} bgClassName={logoClassName}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${name} logo`}
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </LogoContainer>
  );
}

function LucideFallback({
  code,
  name,
  category,
  size,
  className,
  logoClassName,
}: {
  code: string;
  name: string;
  category: ProviderCategory;
  size: number;
  className?: string;
  logoClassName?: string;
}) {
  const FallbackIcon = getProviderIcon(code, category);
  return (
    <LogoContainer
      size={size}
      className={cn("text-muted-foreground", className)}
      bgClassName={logoClassName ?? "bg-muted/70"}
    >
      <FallbackIcon className="h-5 w-5" aria-hidden="true" />
      <span className="sr-only">{name}</span>
    </LogoContainer>
  );
}

export function ProviderLogo({
  code,
  name,
  category,
  size = 44,
  className,
  logoClassName,
}: ProviderLogoProps) {
  const key = code.toLowerCase();
  const categoryBg = logoClassName ?? getProviderCategoryStyles(category).logoBg;

  const domain = getProviderDomain(key);
  if (domain) {
    return (
      <LogoDevImage
        domain={domain}
        name={name}
        size={size}
        code={code}
        category={category}
        className={className}
        logoClassName={categoryBg}
      />
    );
  }

  const localSrc = LOCAL_LOGO_MAP[key];
  if (localSrc) {
    return (
      <LocalLogo
        src={localSrc}
        name={name}
        size={size}
        className={className}
        logoClassName={categoryBg}
      />
    );
  }

  if (SIMPLE_ICON_FALLBACK[key]) {
    return (
      <SimpleIconLogo
        code={code}
        name={name}
        size={size}
        className={className}
        logoClassName={categoryBg}
      />
    );
  }

  return (
    <LucideFallback
      code={code}
      name={name}
      category={category}
      size={size}
      className={className}
      logoClassName={categoryBg}
    />
  );
}

export function getProviderLogoSrc(code: string): string | undefined {
  const key = code.toLowerCase();
  const domain = getProviderDomain(key);
  if (domain) return getLogoDevUrl(domain) ?? undefined;
  return LOCAL_LOGO_MAP[key];
}
