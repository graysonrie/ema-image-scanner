"use client";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import OnDemandDragAndDropField from "@/components/on-demand-image/OnDemandDragAndDropField";
import OnDemandTemplateSelector from "@/components/on-demand-image/OnDemandTemplateSelector";

export default function OnDemandImagePage() {
  const router = useRouter();
  function onBackClick() {
    router.push("/");
  }
  return (
    <div className="p-4 max-w-3xl mx-auto font-sans">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBackClick}
        title="Back"
        className="mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </Button>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex-1">
          <OnDemandDragAndDropField />
        </div>
        <div className="flex-1">
          <OnDemandTemplateSelector />
        </div>
      </div>
    </div>
  );
}
