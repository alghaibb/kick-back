"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  MessageSquare,
  Users2,
  Activity,
  Shield,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  useAdminStats,
  useRefreshAdminStats,
} from "@/hooks/queries/useAdminStats";
import { AdminDashboardSkeleton } from "./AdminDashboardSkeleton";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";

export function AdminDashboardClient() {
  const { data: stats, isLoading, error, isRefetching } = useAdminStats();
  const refreshStats = useRefreshAdminStats();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshStats();
      toast.success("Stats refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh admin stats:", error);
      toast.error("Failed to refresh stats");
    } finally {
      setIsRefreshing(false);
    }
  };

  const {
    totalUsers = 0,
    activeEvents = 0,
    contactMessages = 0,
    totalGroups = 0,
    recentActivity = 0,
    growth = {
      usersThisWeek: 0,
      usersLastWeek: 0,
      userGrowthRate: 0,
      eventsGrowthRate: 0,
    },
    cached = false,
    lastUpdated,
  } = stats || {};

  const statsCards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      href: "/admin/users",
      growth: growth.userGrowthRate,
      subtitle: `${recentActivity} new this week`,
    },
    {
      title: "Active Events",
      value: activeEvents,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      href: "/events",
      growth: growth.eventsGrowthRate,
      subtitle: "Upcoming events",
    },
    {
      title: "Contact Messages",
      value: contactMessages,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      href: "/admin/contacts",
      subtitle: "Pending messages",
    },
    {
      title: "Total Groups",
      value: totalGroups,
      icon: Users2,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      href: "/groups",
      subtitle: "Active communities",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage user accounts, roles, and permissions",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      badge: totalUsers > 0 ? `${totalUsers} users` : null,
    },
    {
      title: "View Messages",
      description: "Check and respond to contact form submissions",
      icon: MessageSquare,
      href: "/admin/contacts",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      badge: contactMessages > 0 ? `${contactMessages} pending` : null,
      urgent: contactMessages > 10,
    },
    {
      title: "Browse Events",
      description: "Monitor all events and their status across the platform",
      icon: Calendar,
      href: "/events",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      badge: activeEvents > 0 ? `${activeEvents} active` : null,
    },
    {
      title: "Manage Groups",
      description: "Oversee user groups and community management",
      icon: Users2,
      href: "/groups",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      badge: totalGroups > 0 ? `${totalGroups} groups` : null,
    },
  ];

  return (
    <div className="relative pt-16 md:pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header with refresh button - Always visible */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Admin Dashboard
              </h1>
              <Badge variant="secondary" className="text-xs md:text-sm">
                Admin Access
              </Badge>
              {cached && (
                <Badge variant="outline" className="text-xs">
                  Cached
                </Badge>
              )}
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing || isRefetching}
              className="shrink-0 w-full sm:w-auto"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing || isRefetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm md:text-base text-muted-foreground">
              Monitor and manage your application&apos;s data and users.
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Last updated:{" "}
                {formatDate(new Date(lastUpdated), {
                  includeTime: true,
                  format: "default",
                  locale: "en-GB",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Content that can show loading/error states */}
        {isLoading ? (
          <AdminDashboardSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-muted-foreground text-center max-w-md">
              Failed to load admin stats. Please try refreshing the page or
              check your connection.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {statsCards.map((stat) => (
                <Link key={stat.title} href={stat.href}>
                  <Card className="hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`p-2 md:p-3 rounded-lg ${stat.bgColor}`}
                        >
                          <stat.icon
                            className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`}
                          />
                        </div>
                        {stat.growth !== undefined && (
                          <div
                            className={`flex items-center gap-1 text-xs ${
                              stat.growth > 0
                                ? "text-green-600"
                                : stat.growth < 0
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {stat.growth > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : stat.growth < 0 ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : null}
                            {stat.growth !== 0 &&
                              `${Math.abs(stat.growth).toFixed(1)}%`}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {stat.title}
                        </p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                          {stat.value.toLocaleString()}
                        </p>
                        {stat.subtitle && (
                          <p className="text-xs text-muted-foreground">
                            {stat.subtitle}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Enhanced Quick Actions */}
            <div className="mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 md:mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                {quickActions.map((action) => (
                  <Card
                    key={action.title}
                    className={`hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group relative ${
                      action.urgent
                        ? "ring-2 ring-red-200 dark:ring-red-800"
                        : ""
                    }`}
                  >
                    <Link href={action.href}>
                      <CardContent className="p-4 lg:p-6">
                        {action.urgent && (
                          <div className="absolute top-3 right-3">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div
                              className={`p-3 rounded-lg ${action.bgColor} w-fit mb-4`}
                            >
                              <action.icon
                                className={`h-6 w-6 ${action.color}`}
                              />
                            </div>
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base lg:text-lg">
                                  {action.title}
                                </h3>
                                {action.badge && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {action.badge}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {action.description}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>

            {/* Enhanced System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Status
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    All Systems Operational
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="flex items-center justify-between p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">API Status</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Database</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 md:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Cache</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    >
                      {cached ? "Active" : "Fresh"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
