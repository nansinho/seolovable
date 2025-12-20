import * as React from "react";
import { cn } from "@/lib/utils";

export function SurfaceCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50",
        "shadow-[0_1px_0_hsl(var(--foreground)/0.05)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Metric({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

export function IconBullet({
  icon,
  children,
  className,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="mt-0.5 rounded-md border border-border bg-background/50 p-1.5 text-primary">
        {icon}
      </div>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
