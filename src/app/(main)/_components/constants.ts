import {
  Calendar,
  Users,
  Home,
  Settings,
  User,
  CalendarDays
} from "lucide-react";

export const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Groups", href: "/groups", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
] as const;

export type NavigationItem = typeof navigation[number]; 