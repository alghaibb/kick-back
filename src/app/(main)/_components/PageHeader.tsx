"use client";
import { ReactNode } from "react";

export function PageHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action: ReactNode;
}) {
  return (
    <div className="mb-12">
      <div className="bg-card border border-border rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
                {icon}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          </div>

          <div className="flex-shrink-0">{action}</div>
        </div>
      </div>
    </div>
  );
}
