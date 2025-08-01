"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  MessageSquare,
  Users2,
  Activity,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAdminStats } from "@/hooks/queries/useAdminStats";
import { AdminDashboardSkeleton } from "./_components/AdminDashboardSkeleton";
import { AdminAccessGuard } from "./_components/AdminAccessGuard";

function AdminDashboard() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load admin stats</p>
      </div>
    );
  }

  const { totalUsers, activeEvents, contactMessages, totalGroups } = stats || {
    totalUsers: 0,
    activeEvents: 0,
    contactMessages: 0,
    totalGroups: 0,
  };

  const statsCards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      href: "/admin/users",
    },
    {
      title: "Active Events",
      value: activeEvents,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      href: "/events",
    },
    {
      title: "Contact Messages",
      value: contactMessages,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      href: "/admin/contacts",
    },
    {
      title: "Total Groups",
      value: totalGroups,
      icon: Users2,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      href: "/groups",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage user accounts and roles",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "View Messages",
      description: "Check contact form submissions",
      icon: MessageSquare,
      href: "/admin/contacts",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Browse Events",
      description: "View all events in the system",
      icon: Calendar,
      href: "/events",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Manage Groups",
      description: "View and manage user groups",
      icon: Users2,
      href: "/groups",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="relative pt-16 md:pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
              <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <Badge variant="secondary" className="text-xs md:text-sm">
              Admin Access
            </Badge>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Monitor and manage your application&apos;s data and users.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statsCards.map((stat) => (
            <Card
              key={stat.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm md:text-base font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-2 md:p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon
                      className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action) => (
              <Card
                key={action.title}
                className="hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group"
              >
                <Link href={action.href}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div
                          className={`p-2 md:p-3 rounded-lg ${action.bgColor} w-fit mb-3`}
                        >
                          <action.icon
                            className={`h-5 w-5 md:h-6 md:w-6 ${action.color}`}
                          />
                        </div>
                        <h3 className="font-semibold text-sm md:text-base mb-2">
                          {action.title}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="flex items-center justify-between p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm md:text-base font-medium">
                    System Online
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm md:text-base font-medium">
                    Database
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminAccessGuard>
      <AdminDashboard />
    </AdminAccessGuard>
  );
}
