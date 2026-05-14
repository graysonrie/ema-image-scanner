"use client";

import { Card } from "@/components/ui/card";
import { AlertCircle, FileText, Sparkles } from "lucide-react";
import type { ImageEvaluation } from "@/lib/hooks/models";

interface EvaluationCardProps {
  evaluation: ImageEvaluation | undefined;
}

export function EvaluationCard({ evaluation }: EvaluationCardProps) {
  if (!evaluation) {
    return null;
  }

  const hasError = !!evaluation.failReason;
  const result = evaluation.result;

  if (hasError) {
    return (
      <Card className="p-4 border-destructive/50 bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">
              Evaluation Failed
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {evaluation.failReason}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.briefDescription}
            </p>
          </div>
          {result.newSuggestedFilepathSuffix && (
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Suggested Filename
              </p>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                {result.newSuggestedFilepathSuffix}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
