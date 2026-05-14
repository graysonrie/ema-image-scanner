"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import useCustomPrompt from "@/lib/hooks/useCustomPrompt";

const DEFAULT_PROMPT_PREVIEW =
  "Analyze this image of mechanical equipment.\n\n" +
  "1. Identify any unit tags, serial numbers, model numbers, or identifying labels visible in the image.\n" +
  "2. Determine the equipment type (e.g. HVAC unit, pump, compressor, boiler, electrical panel).\n" +
  "3. Note any other important identifying information such as manufacturer, capacity ratings, or installation details.\n\n" +
  "For the filepath_suffix, use the most specific identifier you find (e.g. \"_UNIT_123\", \"_SERIAL_ABC456\", \"_MODEL_XYZ789\"). Prefer unit tags over serial numbers, and serial numbers over model numbers.\n" +
  "For the brief_description, state the equipment type and mention the identifier you used for the suffix.";

interface PromptSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PromptSettingsModal({
  open: isOpen,
  onOpenChange,
}: PromptSettingsModalProps) {
  const customPrompt = useSettingsStore((s) => s.customPrompt);
  const customTemperature = useSettingsStore((s) => s.customTemperature);
  const { saveCustomPrompt, saveCustomTemperature } = useCustomPrompt();
  const [draft, setDraft] = useState("");
  const [tempDraft, setTempDraft] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(customPrompt ?? "");
      setTempDraft(customTemperature);
    }
  }, [isOpen, customPrompt, customTemperature]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    await saveCustomPrompt(trimmed || null);
    await saveCustomTemperature(tempDraft);
    onOpenChange(false);
  };

  const handleReset = () => {
    setDraft("");
    setTempDraft(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluation Prompt Settings</DialogTitle>
          <DialogDescription>
            Customize the prompt sent to the AI when evaluating images. The AI
            is instructed to respond with a brief desciption and file path
            suffix regardless of your prompt.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="custom-prompt">Custom analysis prompt</Label>
          <Textarea
            id="custom-prompt"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Leave empty to use the default prompt..."
            rows={6}
            className="resize-y"
          />
          {!draft.trim() && (
            <details className="text-sm text-muted-foreground">
              <summary className="cursor-pointer select-none">
                View default prompt
              </summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                {DEFAULT_PROMPT_PREVIEW}
              </pre>
            </details>
          )}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <Label>Determinism</Label>
              <span className="text-sm text-muted-foreground">
                {tempDraft !== null ? tempDraft.toFixed(2) : "Default"}
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[tempDraft ?? 0.5]}
              onValueChange={([v]) => setTempDraft(v)}
            />
            <p className="text-xs text-muted-foreground">
              Lower values produce more focused responses.{" "}
              {tempDraft !== null && (
                <button
                  type="button"
                  className="underline"
                  onClick={() => setTempDraft(null)}
                >
                  Reset to default
                </button>
              )}
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!draft.trim() && tempDraft === null}
          >
            Reset to Default
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
