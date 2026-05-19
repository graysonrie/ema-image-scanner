"use client";

import { ArrowLeftIcon, InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import OnDemandDragAndDropField from "@/components/on-demand-image/OnDemandDragAndDropField";
import OnDemandTemplateSelector from "@/components/on-demand-image/OnDemandTemplateSelector";
import OnDemandProgramOutput from "@/components/on-demand-image/OnDemandProgramOutput";
import useOnDemandManualEvaluation from "@/components/on-demand-image/hooks/useOnDemandManualEvaluation";
import useOnDemandSettingsHydration from "@/components/on-demand-image/hooks/useOnDemandSettingsHydration";
import { useOnDemandSettingsStore } from "@/components/on-demand-image/store/on-demand-settings-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

export default function OnDemandImagePage() {
  const router = useRouter();

  useOnDemandSettingsHydration();
  const waitForManualEvalTrigger = useOnDemandSettingsStore(
    (state) => state.waitForManualEvalTrigger,
  );
  const setWaitForManualEvalTrigger = useOnDemandSettingsStore(
    (state) => state.setWaitForManualEvalTrigger,
  );
  const { evaluateCurrentImages, canEvaluate } = useOnDemandManualEvaluation();

  function onBackClick() {
    router.push("/");
  }

  return (
    <div className="flex h-[calc(100vh-2.5rem)] flex-col bg-background p-4 font-sans">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBackClick}
        title="Back"
        className="mb-4 shrink-0 self-start"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </Button>
      <div className="mx-auto flex w-full max-w-5xl min-h-0 flex-1 flex-col">
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
          <div className="w-full flex-col h-full flex">
            <OnDemandDragAndDropField />
            <div className="flex flex-0 items-center gap-2 p-2 w-full h-full">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Checkbox
                  id="option"
                  checked={waitForManualEvalTrigger}
                  onCheckedChange={(checked) =>
                    setWaitForManualEvalTrigger(
                      checked === "indeterminate" ? false : checked,
                    )
                  }
                />
                <Label htmlFor="option">Wait for manual evaluation</Label>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <InfoIcon className="size-4 text-muted-foreground shrink-0" />
                  </HoverCardTrigger>
                  <HoverCardContent className="flex w-64 flex-col gap-0.5">
                    <Label>
                      If checked, then you must manually click 'Evaluate' to
                      trigger the OCR analysis on the image(s)
                    </Label>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <Button
                className={cn(
                  "flex-1",
                  !waitForManualEvalTrigger && "invisible"
                )}
                disabled={!waitForManualEvalTrigger || !canEvaluate}
                tabIndex={waitForManualEvalTrigger ? 0 : -1}
                aria-hidden={!waitForManualEvalTrigger}
                onClick={evaluateCurrentImages}
              >
                Evaluate
              </Button>
            </div>
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
            <OnDemandTemplateSelector />
            <div className="shrink-0">
              <OnDemandProgramOutput />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
