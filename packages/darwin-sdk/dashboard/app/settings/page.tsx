"use client";

import { useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Github, Key, Bell, Globe, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General
    defaultPort: "3000",
    defaultMaxSteps: "50",
    defaultIterations: "5",
    // Notifications
    emailNotifications: true,
    slackNotifications: false,
    notifyOnComplete: true,
    notifyOnError: true,
    // Integration
    githubConnected: false,
    githubRepo: "",
    autoCreatePR: false,
    // Privacy
    collectAnalytics: true,
    shareUsageData: false,
  });

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure your Darwin preferences
            </p>
          </div>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                General
              </CardTitle>
              <CardDescription>
                Default settings for evolution runs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="default-port">Default Port</Label>
                  <Input
                    id="default-port"
                    value={settings.defaultPort}
                    onChange={(e) => updateSetting("defaultPort", e.target.value)}
                    placeholder="3000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-steps">Max Steps</Label>
                  <Input
                    id="default-steps"
                    value={settings.defaultMaxSteps}
                    onChange={(e) => updateSetting("defaultMaxSteps", e.target.value)}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-iterations">Iterations</Label>
                  <Input
                    id="default-iterations"
                    value={settings.defaultIterations}
                    onChange={(e) => updateSetting("defaultIterations", e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Github className="h-4 w-4" />
                GitHub Integration
              </CardTitle>
              <CardDescription>
                Connect GitHub to create PRs automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.githubConnected ? (
                <>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
                        <Github className="h-4 w-4 text-background" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Connected</p>
                        <p className="text-xs text-muted-foreground">
                          {settings.githubRepo || "No repository selected"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSetting("githubConnected", false)}
                      className="bg-transparent"
                    >
                      Disconnect
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github-repo">Repository</Label>
                    <Select
                      value={settings.githubRepo}
                      onValueChange={(v) => updateSetting("githubRepo", v)}
                    >
                      <SelectTrigger id="github-repo">
                        <SelectValue placeholder="Select a repository" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="org/main-app">org/main-app</SelectItem>
                        <SelectItem value="org/web-frontend">org/web-frontend</SelectItem>
                        <SelectItem value="user/personal-site">user/personal-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-create PR</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically create PR after evolution
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoCreatePR}
                      onCheckedChange={(v) => updateSetting("autoCreatePR", v)}
                    />
                  </div>
                </>
              ) : (
                <Button
                  onClick={() => updateSetting("githubConnected", true)}
                  className="w-full gap-2"
                >
                  <Github className="h-4 w-4" />
                  Connect GitHub
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(v) => updateSetting("emailNotifications", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notify on Complete</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when evolution completes
                  </p>
                </div>
                <Switch
                  checked={settings.notifyOnComplete}
                  onCheckedChange={(v) => updateSetting("notifyOnComplete", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notify on Error</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when errors occur
                  </p>
                </div>
                <Switch
                  checked={settings.notifyOnError}
                  onCheckedChange={(v) => updateSetting("notifyOnError", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Privacy
              </CardTitle>
              <CardDescription>
                Control your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Usage Analytics</Label>
                  <p className="text-xs text-muted-foreground">
                    Help improve Darwin with anonymous usage data
                  </p>
                </div>
                <Switch
                  checked={settings.collectAnalytics}
                  onCheckedChange={(v) => updateSetting("collectAnalytics", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
