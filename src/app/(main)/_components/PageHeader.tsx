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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 border-b pb-4 bg-background/80 backdrop-blur">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {icon}
          {title}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
