"use client";
import Link from "next/link";
import { QuickActionCard } from "./QuickActionCard";
import { quickActions } from "./dashboard-data";
import { useModal, ModalType } from "@/hooks/use-modal";

const titleToModalType: Record<string, ModalType | undefined> = {
  "Create Group": "create-group",
  "Create New Event": "create-event",
};

export function DashboardQuickActionsClient() {
  const { open } = useModal();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quickActions.map((action) =>
        action.href ? (
          <Link key={action.title} href={action.href} className="contents">
            <QuickActionCard {...action} />
          </Link>
        ) : (
          <QuickActionCard
            key={action.title}
            {...action}
            onClick={
              titleToModalType[action.title]
                ? () => open(titleToModalType[action.title]!)
                : undefined
            }
          />
        )
      )}
    </div>
  );
}
