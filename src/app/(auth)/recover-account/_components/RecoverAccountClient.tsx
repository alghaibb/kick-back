"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, CheckCircle } from "lucide-react";
import { useRecoverAccountMutation } from "@/hooks/mutations/useSettingsMutation";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RecoveryState {
  email: string;
  isChecking: boolean;
  canRecover: boolean;
  success: string;
}

export function RecoverAccountClient() {
  const [state, setState] = useState<RecoveryState>({
    email: "",
    isChecking: false,
    canRecover: false,
    success: "",
  });

  const recoverMutation = useRecoverAccountMutation();
  const { user } = useAuth();
  const router = useRouter();

  // If user is soft deleted and logged in, show recovery form with their email pre-filled
  useEffect(() => {
    if (user && user.deletedAt && !state.email && user.email) {
      setState((prev) => ({ ...prev, email: user.email }));
    }
  }, [user, state.email]);

  // If user is not deleted, redirect to dashboard
  if (user && !user.deletedAt) {
    router.push("/dashboard");
    return null;
  }

  const handleCheckAccount = async () => {
    if (!state.email) {
      setState((prev) => ({
        ...prev,
        error: "Please enter your email address",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isChecking: true,
      error: "",
      canRecover: false,
    }));

    try {
      // Check if the account exists and is deleted
      const response = await fetch("/api/auth/check-deleted-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.canRecover) {
          setState((prev) => ({ ...prev, canRecover: true, error: "" }));
        } else {
          setState((prev) => ({
            ...prev,
            error: data.message || "Account cannot be recovered",
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          error: data.error || "Failed to check account",
        }));
      }
    } catch (error) {
      console.error("Failed to check account:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to check account. Please try again.",
      }));
    } finally {
      setState((prev) => ({ ...prev, isChecking: false }));
    }
  };

  const handleRecoverAccount = async () => {
    try {
      await recoverMutation.mutateAsync();
      setState((prev) => ({
        ...prev,
        success: "Account recovered successfully! Redirecting to dashboard...",
      }));
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Failed to recover account:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to recover account. Please try again.",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit">
            <RotateCcw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Recover Account</CardTitle>
          <p className="text-muted-foreground">
            Recover your deleted account within 30 days
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!state.canRecover ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={state.email}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, email: e.target.value }))
                  }
                  disabled={state.isChecking}
                />
              </div>

              <Button
                onClick={handleCheckAccount}
                disabled={state.isChecking || !state.email}
                className="w-full"
              >
                {state.isChecking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Checking...
                  </>
                ) : (
                  "Check Account"
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your account can be recovered! Click the button below to
                  restore your account.
                </p>
              </div>

              <Button
                onClick={handleRecoverAccount}
                disabled={recoverMutation.isPending}
                className="w-full"
              >
                {recoverMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Recovering...
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Recover Account
                  </>
                )}
              </Button>
            </>
          )}

          {state.success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                {state.success}
              </p>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help?{" "}
              <Button variant="link" asChild>
                <Link href="/contact">Contact support</Link>
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
