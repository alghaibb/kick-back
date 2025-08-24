"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";
import { EnhancedLoadingButton } from "./enhanced-loading-button";
import {
  PulseLoader,
  BounceLoader,
  WaveLoader,
  ActionLoader,
  ProgressLoader,
  SkeletonLoader,
  SuccessAnimation,
  ErrorAnimation,
  SmartLoader,
} from "./loading-animations";

export function LoadingDemo() {
  const [progress, setProgress] = useState(0);
  const [demoStates, setDemoStates] = useState<Record<string, boolean>>({});

  const startProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const toggleDemo = (key: string) => {
    setDemoStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const actions = [
    "upload",
    "send",
    "save",
    "delete",
    "invite",
    "create",
    "update",
    "admin",
    "sync",
    "process",
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Custom Loading Animations</h1>
        <p className="text-muted-foreground">
          A collection of unique loading animations for different actions
        </p>
      </div>

      {/* Basic Loaders */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Loaders</CardTitle>
          <CardDescription>Simple loading animations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Pulse:</span>
              <PulseLoader size="sm" />
              <PulseLoader size="md" />
              <PulseLoader size="lg" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Bounce:</span>
              <BounceLoader size="sm" />
              <BounceLoader size="md" />
              <BounceLoader size="lg" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Wave:</span>
              <WaveLoader size="sm" />
              <WaveLoader size="md" />
              <WaveLoader size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action-Specific Loaders */}
      <Card>
        <CardHeader>
          <CardTitle>Action-Specific Loaders</CardTitle>
          <CardDescription>Context-aware loading animations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {actions.map((action) => (
              <div key={action} className="text-center space-y-2">
                <div className="flex justify-center">
                  <ActionLoader
                    action={
                      action as
                        | "upload"
                        | "send"
                        | "save"
                        | "delete"
                        | "invite"
                        | "create"
                        | "update"
                        | "admin"
                        | "sync"
                        | "process"
                    }
                    size="md"
                  />
                </div>
                <p className="text-xs font-medium capitalize">{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Loader */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Loader</CardTitle>
          <CardDescription>Animated progress with percentage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <ProgressLoader progress={progress} size="sm" />
            <ProgressLoader progress={progress} size="md" />
            <ProgressLoader progress={progress} size="lg" />
          </div>
          <Button
            onClick={startProgress}
            disabled={progress > 0 && progress < 100}
          >
            {progress === 100 ? "Reset" : "Start Progress"}
          </Button>
        </CardContent>
      </Card>

      {/* Skeleton Loaders */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Loaders</CardTitle>
          <CardDescription>Content placeholders while loading</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <SkeletonLoader type="text" />
            <SkeletonLoader type="avatar" />
            <SkeletonLoader type="button" />
            <SkeletonLoader type="card" className="w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Success & Error Animations */}
      <Card>
        <CardHeader>
          <CardTitle>Success & Error States</CardTitle>
          <CardDescription>
            Feedback animations for completed actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Success:</span>
              <SuccessAnimation size="sm" />
              <SuccessAnimation size="md" />
              <SuccessAnimation size="lg" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Error:</span>
              <ErrorAnimation size="sm" />
              <ErrorAnimation size="md" />
              <ErrorAnimation size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Loader */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Loader</CardTitle>
          <CardDescription>
            Context-aware loading with automatic selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <SmartLoader context="form" action="submit" size="md" />
              <p className="text-xs">Form Submit</p>
            </div>
            <div className="text-center space-y-2">
              <SmartLoader context="user" action="invite" size="md" />
              <p className="text-xs">User Invite</p>
            </div>
            <div className="text-center space-y-2">
              <SmartLoader context="file" action="upload" size="md" />
              <p className="text-xs">File Upload</p>
            </div>
            <div className="text-center space-y-2">
              <SmartLoader context="data" action="sync" size="md" />
              <p className="text-xs">Data Sync</p>
            </div>
            <div className="text-center space-y-2">
              <SmartLoader context="communication" action="send" size="md" />
              <p className="text-xs">Send Message</p>
            </div>
            <div className="text-center space-y-2">
              <SmartLoader context="data" size="md" />
              <p className="text-xs">Default (Data)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Loading Button Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Loading Buttons</CardTitle>
          <CardDescription>
            Buttons with custom loading animations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Upload Action</h4>
              <EnhancedLoadingButton
                loading={demoStates.upload}
                action="upload"
                loadingText="Uploading..."
                onClick={() => toggleDemo("upload")}
                className="w-full"
              >
                Upload File
              </EnhancedLoadingButton>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Create Action</h4>
              <EnhancedLoadingButton
                loading={demoStates.create}
                action="create"
                loadingText="Creating..."
                onClick={() => toggleDemo("create")}
                className="w-full"
              >
                Create Event
              </EnhancedLoadingButton>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Send Action</h4>
              <EnhancedLoadingButton
                loading={demoStates.send}
                action="send"
                loadingText="Sending..."
                onClick={() => toggleDemo("send")}
                className="w-full"
              >
                Send Invitation
              </EnhancedLoadingButton>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Admin Action</h4>
              <EnhancedLoadingButton
                loading={demoStates.admin}
                action="admin"
                loadingText="Processing..."
                onClick={() => toggleDemo("admin")}
                className="w-full"
              >
                Admin Action
              </EnhancedLoadingButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Demo</CardTitle>
          <CardDescription>Test different loading states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => setDemoStates({})}>
              Reset All
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setDemoStates((prev) => ({ ...prev, all: !prev.all }))
              }
            >
              Toggle All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.slice(0, 8).map((action) => (
              <div key={action} className="text-center space-y-2">
                <div className="flex justify-center">
                  {demoStates.all ? (
                    <ActionLoader
                      action={
                        action as
                          | "upload"
                          | "send"
                          | "save"
                          | "delete"
                          | "invite"
                          | "create"
                          | "update"
                          | "admin"
                          | "sync"
                          | "process"
                      }
                      size="md"
                    />
                  ) : (
                    <div className="h-5 w-5 bg-muted rounded" />
                  )}
                </div>
                <p className="text-xs font-medium capitalize">{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
