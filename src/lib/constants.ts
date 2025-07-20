import { Bell, CalendarDays, Clock, Send, Smartphone, UserCheck, Users } from "lucide-react";

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

export const userMenuLinks = [
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export const howItWorks = [
  {
    icon: UserCheck,
    title: "Set Your Preferences",
    description:
      "During onboarding, choose how you want to be reminded — via SMS, email, or both — and what time works best for you.",
  },
  {
    icon: CalendarDays,
    title: "Create Events",
    description:
      "Plan your important moments anytime. Add events from your dashboard and manage them easily.",
  },
  {
    icon: Send,
    title: "Get Timely Reminders",
    description:
      "You'll receive reminders exactly when you chose — no missed moments, no extra effort.",
  },
];

export const coreFeatures = [
  {
    icon: CalendarDays,
    title: "Effortless Event Creation",
    description: "Create events in seconds and manage them from anywhere.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Get SMS or email reminders exactly when you need them.",
  },
  {
    icon: Users,
    title: "Group Scheduling",
    description: "Coordinate plans easily with group invites and responses.",
  },
  {
    icon: Smartphone,
    title: "Mobile-Optimized",
    description: "Designed to work seamlessly on all your devices.",
  },
  {
    icon: Clock,
    title: "Time Zone Support",
    description: "Schedule across time zones without confusion.",
  },
  {
    icon: Send,
    title: "Notifications That Work",
    description: "Reliable delivery via your chosen channel: SMS, email, or both.",
  },
];