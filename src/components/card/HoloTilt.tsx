"use client";

import { useCallback, useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { clamp } from "@/lib/utils";

export interface HoloTiltProps {
  children: ReactNode;
  className?: string;
  /** Sudut miring maksimum (derajat). */
  maxTilt?: number;
  /** Nonaktifkan efek miring + kilau. */
  disabled?: boolean;
  /** Mengambang naik-turun pelan saat idle. */
  floating?: boolean;
  /** Gerakkan kartu dengan sensor gerak HP (izin harus sudah diberikan). */
  gyro?: boolean;
}

/**
 * Pembungkus 3D: kartu miring mengikuti kursor / jari / sensor gerak dan mengisi
 * CSS variable --mx / --my (0–100%) untuk posisi kilau holo di dalamnya.
 */
export function HoloTilt({ children, className, maxTilt = 14, disabled = false, floating = false, gyro = false }: HoloTiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);

  const apply = useCallback(
    (px: number, py: number, active: boolean) => {
      const el = ref.current;
      if (!el) return;
      const rx = (0.5 - py) * 2 * maxTilt;
      const ry = (px - 0.5) * 2 * maxTilt;
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      el.style.setProperty("--rx", `${active ? rx : 0}deg`);
      el.style.setProperty("--ry", `${active ? ry : 0}deg`);
    },
    [maxTilt],
  );

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // sensor gerak: kemiringan HP menggerakkan kartu
  useEffect(() => {
    if (!gyro || disabled) return;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      const px = 0.5 + clamp(e.gamma / 35, -1, 1) * 0.5;
      const py = 0.5 + clamp((e.beta - 45) / 35, -1, 1) * 0.5;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => apply(px, py, true));
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      apply(0.5, 0.5, false);
    };
  }, [gyro, disabled, apply]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || gyro) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => apply(px, py, true));
  };

  const onLeave = () => {
    if (gyro) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    apply(0.5, 0.5, false);
  };

  return (
    <div
      className={cn("[perspective:1000px]", className)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerCancel={onLeave}
      style={{ touchAction: "pan-y" }}
    >
      <div
        ref={ref}
        className="will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: disabled ? undefined : "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          transition: "transform 180ms ease-out",
          animation: floating && !disabled ? "card-float 5s ease-in-out infinite" : undefined,
          // nilai awal kilau
          ["--mx" as string]: "50%",
          ["--my" as string]: "50%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
