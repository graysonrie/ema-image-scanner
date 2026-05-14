"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import OnDemandDragAndDropField from "@/components/on-demand-image/OnDemandDragAndDropField";
import OnDemandTemplateSelector from "@/components/on-demand-image/OnDemandTemplateSelector";
import OnDemandProgramOutput from "@/components/on-demand-image/OnDemandProgramOutput";

export default function OnDemandImagePage() {
  const router = useRouter();

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
          <OnDemandDragAndDropField />
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
