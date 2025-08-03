import {
  Calendar,
  Users,
  Home,
  Settings,
  User,
  Group,
  CalendarDays,
  Shield,
  Trash2,
  BarChart3,
  MessageSquare,
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
  { name: "Admin Panel", href: "", icon: Shield },
  { name: "Admin Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Groups", href: "/admin/groups", icon: Group },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Deleted Users", href: "/admin/deleted-users", icon: Trash2 },
  { name: "Contacts", href: "/admin/contacts", icon: MessageSquare },
] as const;

export type NavigationItem = (typeof navigation)[number];
