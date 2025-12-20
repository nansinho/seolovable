import * as React from "react";
import { cn } from "@/lib/utils";

type SectionTone = "default" | "muted";

type LandingSectionProps = {
  id?: string;
  tone?: SectionTone;
  children: React.ReactNode;
  className?: string;
};

export function LandingSection({ id, tone = "default", children, className }: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative border-t border-border",
        tone === "muted" ? "bg-card" : "bg-background",
        className
      )}
    >
      <div className="container mx-auto px-4 py-20 md:py-28">{children}</div>
    </section>
  );
}

type SectionHeadingProps = {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <header
      className={cn(
        align === "center" ? "text-center" : "text-left",
        "max-w-3xl",
        align === "center" ? "mx-auto" : "",
        className
      )}
    >
      <p className="text-xs tracking-[0.24em] uppercase text-muted-foreground">
        {label}
      </p>
      <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base md:text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}
