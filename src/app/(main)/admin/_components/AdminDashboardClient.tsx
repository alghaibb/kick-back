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
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pt-16 md:pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Modern Header with Glassmorphism */}
        <div className="mb-8 md:mb-10">
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl" />
                    <div className="relative h-12 w-12 md:h-14 md:w-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                      <Shield className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        Admin Access
                      </Badge>
                      {cached && (
                        <Badge variant="secondary" className="text-xs">
                          <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                          Cached
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleRefresh}
                  size="sm"
                  disabled={isRefreshing || isRefetching}
                  className="shrink-0 w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:scale-105"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isRefreshing || isRefetching ? "animate-spin" : ""}`}
                  />
                  Refresh Data
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm md:text-base text-muted-foreground/90">
                  Monitor and manage your application&apos;s data and users in
                  real-time.
                </p>
                {lastUpdated && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>
                      Updated{" "}
                      {formatDate(new Date(lastUpdated), {
                        includeTime: true,
                        format: "short",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
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
            {/* Modern Stats Grid with Gradient Effects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {statsCards.map((stat) => (
                <Link key={stat.title} href={stat.href}>
                  <div className="relative group">
                    {/* Animated gradient border */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500 group-hover:animate-pulse" />
                    <Card className="relative h-full border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardContent className="relative p-5 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="relative">
                            <div
                              className={`absolute inset-0 ${stat.bgColor} blur-xl opacity-60`}
                            />
                            <div
                              className={`relative p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}
                            >
                              <stat.icon
                                className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`}
                              />
                            </div>
                          </div>
                          {stat.growth !== undefined && stat.growth !== 0 && (
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                stat.growth > 0
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400"
                              }`}
                            >
                              {stat.growth > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {Math.abs(stat.growth).toFixed(1)}%
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground/80 mb-1">
                            {stat.title}
                          </p>
                          <p className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                            {stat.value.toLocaleString()}
                          </p>
                          {stat.subtitle && (
                            <p className="text-xs text-muted-foreground/70">
                              {stat.subtitle}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </Link>
              ))}
            </div>

            {/* Modern Quick Actions with Glassmorphism */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                {quickActions.map((action) => (
                  <Link key={action.title} href={action.href}>
                    <div className="relative group h-full">
                      {/* Animated gradient border */}
                      <div
                        className={`absolute -inset-0.5 bg-gradient-to-r ${
                          action.urgent
                            ? "from-red-500/30 to-red-600/30"
                            : "from-primary/20 to-primary/10"
                        } rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`}
                      />

                      <Card
                        className={`relative h-full border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden ${
                          action.urgent ? "border-red-500/20" : ""
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <CardContent className="relative p-5 lg:p-6">
                          {action.urgent && (
                            <div className="absolute top-4 right-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-red-500 blur-md animate-pulse" />
                                <AlertCircle className="relative h-5 w-5 text-red-500" />
                              </div>
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="relative mb-4">
                                <div
                                  className={`absolute inset-0 ${action.bgColor} blur-xl opacity-60`}
                                />
                                <div
                                  className={`relative p-3 rounded-xl ${action.bgColor} w-fit group-hover:scale-110 transition-transform duration-300`}
                                >
                                  <action.icon
                                    className={`h-6 w-6 ${action.color}`}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-base lg:text-lg">
                                    {action.title}
                                  </h3>
                                  {action.badge && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-secondary/30 border-secondary/50"
                                    >
                                      {action.badge}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                                {action.description}
                              </p>
                            </div>

                            <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </Link>
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
