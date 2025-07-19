export type DashboardStat = {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
};

export const dashboardStatsTemplate: DashboardStat[] = [
  {
    title: "Today's Events",
    value: 0,
    change: "",
    icon: "Calendar",
  },
  {
    title: "Upcoming Events",
    value: 0,
    change: "",
    icon: "Calendar",
  },
  {
    title: "Groups",
    value: 0,
    change: "",
    icon: "Users",
  },
  {
    title: "Events Created",
    value: 0,
    change: "",
    icon: "TrendingUp",
  },
];

export const quickActions = [
  {
    title: "Create New Event",
    description: "Plan your next get-together with friends and family",
    buttonText: "Create Event",
    buttonVariant: "default" as const,
    icon: "Plus",
    href: "",
  },
  {
    title: "Create Group",
    description: "Start a new group for your friends or family",
    buttonText: "Create Group",
    buttonVariant: "default" as const,
    icon: "Users",
    href: "",
  },
  {
    title: "View Calendar",
    description: "See all your upcoming events and plans",
    buttonText: "Open Calendar",
    buttonVariant: "outline" as const,
    icon: "Calendar",
    href: "/calendar",
  },
] as const; 