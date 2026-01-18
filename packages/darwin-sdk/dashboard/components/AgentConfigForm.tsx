"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type AgentMode = "run" | "evolve";

interface AgentConfigFormProps {
  onSubmit: (config: any, mode: AgentMode) => Promise<void>;
  isLoading?: boolean;
}

export function AgentConfigForm({ onSubmit, isLoading }: AgentConfigFormProps) {
  const [mode, setMode] = useState<AgentMode>("run");
  const [formData, setFormData] = useState({
    website: "https://example.com",
    task: "",
    model: "google/gemini-3-flash-preview",
    maxSteps: 20,
    env: "LOCAL" as "LOCAL" | "BROWSERBASE",
    apiKey: "",
    projectId: "",
    verbose: 1 as 0 | 1 | 2,
    systemPrompt: "",
    thinkingFormat: "",
    targetAppPath: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const config: any = {
      website: formData.website,
      task: formData.task,
      model: formData.model,
      maxSteps: formData.maxSteps,
      env: formData.env,
      verbose: formData.verbose,
    };

    if (formData.env === "BROWSERBASE") {
      if (formData.apiKey) config.apiKey = formData.apiKey;
      if (formData.projectId) config.projectId = formData.projectId;
    }

    if (formData.systemPrompt) config.systemPrompt = formData.systemPrompt;
    if (formData.thinkingFormat) config.thinkingFormat = formData.thinkingFormat;
    if (mode === "evolve" && formData.targetAppPath) {
      config.targetAppPath = formData.targetAppPath;
    }

    await onSubmit(config, mode);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Configuration</CardTitle>
        <CardDescription>Configure your browser agent task</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Mode</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === "run" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setMode("run")}
              >
                Run Agent
              </Button>
              <Button
                type="button"
                variant={mode === "evolve" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setMode("evolve")}
              >
                Evolve
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === "run"
                ? "Run the browser agent to test your app"
                : "Full evolution loop: Agent → Analyze → Claude fixes code"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task">Task Description</Label>
            <Textarea
              id="task"
              value={formData.task}
              onChange={(e) =>
                setFormData({ ...formData, task: e.target.value })
              }
              placeholder="Describe what you want the agent to do..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={formData.model}
                onValueChange={(value) =>
                  setFormData({ ...formData, model: value })
                }
              >
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google/gemini-3-flash-preview">
                    Gemini 3 Flash
                  </SelectItem>
                  <SelectItem value="google/gemini-2.0-flash-exp">
                    Gemini 2.0 Flash
                  </SelectItem>
                  <SelectItem value="anthropic/claude-3.5-sonnet">
                    Claude 3.5 Sonnet
                  </SelectItem>
                  <SelectItem value="openai/gpt-4o">
                    GPT-4o
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSteps">Max Steps</Label>
              <Input
                id="maxSteps"
                type="number"
                min={1}
                max={100}
                value={formData.maxSteps}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxSteps: parseInt(e.target.value) || 20,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="env">Environment</Label>
              <Select
                value={formData.env}
                onValueChange={(value: "LOCAL" | "BROWSERBASE") =>
                  setFormData({ ...formData, env: value })
                }
              >
                <SelectTrigger id="env">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOCAL">Local</SelectItem>
                  <SelectItem value="BROWSERBASE">Browserbase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verbose">Verbose Level</Label>
              <Select
                value={formData.verbose.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    verbose: parseInt(value) as 0 | 1 | 2,
                  })
                }
              >
                <SelectTrigger id="verbose">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Quiet (0)</SelectItem>
                  <SelectItem value="1">Info (1)</SelectItem>
                  <SelectItem value="2">Verbose (2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.env === "BROWSERBASE" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Browserbase API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) =>
                    setFormData({ ...formData, apiKey: e.target.value })
                  }
                  placeholder="Optional (uses env var if not provided)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectId">Browserbase Project ID</Label>
                <Input
                  id="projectId"
                  type="text"
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                  placeholder="Optional (uses env var if not provided)"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt (Optional)</Label>
            <Textarea
              id="systemPrompt"
              value={formData.systemPrompt}
              onChange={(e) =>
                setFormData({ ...formData, systemPrompt: e.target.value })
              }
              placeholder="Custom system prompt for the agent..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thinkingFormat">Thinking Format (Optional)</Label>
            <Textarea
              id="thinkingFormat"
              value={formData.thinkingFormat}
              onChange={(e) =>
                setFormData({ ...formData, thinkingFormat: e.target.value })
              }
              placeholder="Instructions for how the agent should format its thinking..."
              rows={2}
            />
          </div>

          {mode === "evolve" && (
            <div className="space-y-2">
              <Label htmlFor="targetAppPath">Target App Path</Label>
              <Input
                id="targetAppPath"
                type="text"
                value={formData.targetAppPath}
                onChange={(e) =>
                  setFormData({ ...formData, targetAppPath: e.target.value })
                }
                placeholder="../../demo-app (default)"
              />
              <p className="text-xs text-muted-foreground">
                Path to the app codebase that Claude will modify
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? mode === "evolve"
                ? "Evolving..."
                : "Starting..."
              : mode === "evolve"
              ? "Start Evolution"
              : "Start Agent"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
