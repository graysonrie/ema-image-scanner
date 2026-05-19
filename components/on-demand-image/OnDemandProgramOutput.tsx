"use client";

import { Loader2, TerminalIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import useOnDemandProgramOutputLoader from "./hooks/useOnDemandProgramOutputLoader";
import { useOnDemandImagesStore } from "./store/on-demand-images-store";
import { useOnDemandProgramOutputStore } from "./store/on-demand-program-output-store";

export default function OnDemandProgramOutput() {
  const { autoCopyToSystemClipboard, saveAutoCopyToSystemClipboard } =
    useOnDemandProgramOutputLoader();
  const output = useOnDemandProgramOutputStore((state) => state.output);
  const isEvaluating = useOnDemandProgramOutputStore(
    (state) => state.isEvaluating
  );
  const imageCount = useOnDemandImagesStore(
    (state) => state.currentImagePaths.length,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4" />
          <CardTitle>Program Output</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="flex flex-col gap-2">
            {isEvaluating ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Evaluating {imageCount > 1 ? "images" : "image"}...
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {output}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">
                OCR extraction result will be displayed here. It will follow the
                format you specified in the template.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-2">
          <Checkbox
            id="sysclip"
            checked={autoCopyToSystemClipboard}
            onCheckedChange={(checked) =>
              saveAutoCopyToSystemClipboard(
                checked === "indeterminate" ? false : checked
              )
            }
          />
          <Label htmlFor="sysclip" className="text-sm text-muted-foreground">
            Automatically copy to system clipboard
          </Label>
        </div>
      </CardFooter>
    </Card>
  );
}
