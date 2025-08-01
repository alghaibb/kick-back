import {
  Calendar,
  Users,
  Home,
  Settings,
  User,
  CalendarDays,
  Shield,
  Trash2,
} from "lucide-react";

export const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Groups", href: "/groups", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
] as const;

export const adminNavigation = [
  { name: "Admin Panel", href: "/admin", icon: Shield },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Deleted Users", href: "/admin/deleted-users", icon: Trash2 },
] as const;

export type NavigationItem = (typeof navigation)[number];
