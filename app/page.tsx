"use client";

import { useState } from "react";
import { ImageIcon, Settings, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import OpenAIApiKeyInput from "@/components/OpenAIApiKeyInput";
import { ProjectsViewer, PromptSettingsModal } from "@/components/projects";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();

  function onOnDemandImageClick() {
    router.push("/on-demand-image");
  }

  return (
    <div className="h-[calc(100vh-2.5rem)] overflow-auto bg-background font-sans">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
        <section className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">App Settings</h2>
              <p className="text-xs text-muted-foreground">
                Prompt settings apply globally across all projects.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              title="Prompt Settings"
              className="shrink-0 font-sans text-xs"
            >
              <Settings className="mr-2 h-4 w-4" />
              Prompt Settings
            </Button>
          </div>
          <OpenAIApiKeyInput />
        </section>

        <section className="rounded-lg border bg-card p-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <StarIcon className="w-4 h-4" />
                <CardTitle>Quick Start</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  Evaluate images on demand using drag and drop
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onOnDemandImageClick}
                  title="On Demand Image"
                  className="shrink-0 font-sans text-xs"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  On Demand Images
                </Button>
              </div>
              
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="sr-only">Projects</h2>
          <ProjectsViewer />
        </section>

        <PromptSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </div>
  );
}
