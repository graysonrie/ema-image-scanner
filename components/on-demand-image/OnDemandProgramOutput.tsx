import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TerminalIcon } from "lucide-react";

export default function OnDemandProgramOutput() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4" />
          <CardTitle>Program Output</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              OCR extraction result will be displayed here. It will follow the
              format you specified in the template.
            </p>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
