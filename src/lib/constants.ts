import { Bell, CalendarClock, Users } from "lucide-react";

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

export const features = [
  {
    icon: Bell,
    title: "Automated Reminders",
    description:
      "SMS, email, or both: reminders sent automatically at the time you set during onboarding.",
  },
  {
    icon: Users,
    title: "Groups & Events",
    description:
      "Create groups, invite friends, manage all your events—keep everything organized in one place.",
  },
  {
    icon: CalendarClock,
    title: "Smart Scheduling",
    description:
      "Find the perfect time for everyone, sync with your calendar, and avoid double bookings.",
  },
];
