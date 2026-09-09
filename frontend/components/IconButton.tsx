"use client";

import type { ButtonHTMLAttributes } from "react";
import type { TrevoIcon } from "@/components/icons";
import { Tooltip } from "@/components/Tooltip";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: TrevoIcon;
  label: string;
  showTooltip?: boolean;
};

export function IconButton({ className = "", icon: Icon, label, showTooltip = true, type = "button", ...props }: IconButtonProps) {
  const button = (
    <button
      {...props}
      aria-label={label}
      className={`icon-button focus-ring theme-control inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-app border text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-leaf/50 hover:text-leaf disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      type={type}
    >
      <Icon size={18} aria-hidden />
    </button>
  );

  return (
    <Tooltip disabled={!showTooltip} label={label}>
      {button}
    </Tooltip>
  );
}
