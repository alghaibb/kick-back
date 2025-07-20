import { CalendarDays, Send, UserCheck } from "lucide-react";

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