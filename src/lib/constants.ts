import { Calendar, CalendarClock, Home, Settings, Users } from "lucide-react";

export const navItems = [
  { title: "Groups", url: "/dashboard/groups" },
  { title: "Events", url: "/dashboard/events" },
  { title: "Calendar", url: "/dashboard/calendar" },
  { title: "Dashboard", url: "/dashboard" },
];

export const dashboardNavItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Groups", url: "/dashboard/groups", icon: Users },
  { title: "Events", url: "/dashboard/events", icon: CalendarClock },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export const mobileNavFooterLinks = [
  { title: "About Us", url: "/about" },
  { title: "Contact Us", url: "/contact" },
  { title: "Terms of Service", url: "/terms" },
];