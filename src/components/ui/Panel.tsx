"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PanelProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  /** Konten di sisi kanan judul (tombol kecil, switch, dsb). */
  actions?: ReactNode;
  children?: ReactNode;
}

/** Kotak section dengan judul, dipakai di seluruh editor. */
export function Panel({ title, description, icon: Icon, className, actions, children }: PanelProps) {
  return (
    <section className={cn("rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur", className)}>
      {(title || actions) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            {Icon && (
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                <Icon size={16} />
              </span>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-sm font-bold text-white">{title}</h3>}
              {description && <p className="text-xs text-white/55">{description}</p>}
            </div>
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
