"use client";

import { useMemo, useState } from "react";
import { FolderOpen, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface FolderViewerItem {
  imageName: string;
  suffix: string;
}

interface FolderViewerProps {
  folderName: string;
  evaluations: FolderViewerItem[];
  evaluatedCount: number;
  undeterminedCount: number;
  onSelectImage: (imageName: string) => void;
}

export function FolderViewer({
  folderName,
  evaluations,
  evaluatedCount,
  undeterminedCount,
  onSelectImage,
}: FolderViewerProps) {
  const [query, setQuery] = useState("");

  const rankedEvaluations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return evaluations;
    }

    const scoreMatch = (suffix: string): number => {
      const value = suffix.toLowerCase();
      if (value === normalizedQuery) return 100;
      if (value.startsWith(normalizedQuery)) return 80;
      if (value.includes(normalizedQuery)) return 60;
      const tokens = value.split(/[_\-\s]+/g).filter(Boolean);
      if (tokens.some((t) => t.startsWith(normalizedQuery))) return 40;
      return 0;
    };

    return evaluations
      .map((item) => ({ item, score: scoreMatch(item.suffix) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.item.suffix.localeCompare(b.item.suffix);
      })
      .map((entry) => entry.item);
  }, [evaluations, query]);

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto font-sans">
      <div className="flex flex-1 flex-col gap-4 min-h-0 w-full max-w-3xl mx-auto">
        <div className="shrink-0">
          <h2 className="text-xl font-semibold break-all">{folderName}</h2>
          <p className="text-sm text-muted-foreground">
            {evaluatedCount} evaluated image{evaluatedCount === 1 ? "" : "s"}.{" "}
            {undeterminedCount} undetermined
          </p>
        </div>
        <div className="relative shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search images"
            className="pl-9"
          />
        </div>
        {rankedEvaluations.length > 0 ? (
          <div className="flex-1 min-h-0 rounded-lg border overflow-y-auto font-sans">
            <div className="divide-y">
              {rankedEvaluations.map((item) => (
                <div
                  key={item.imageName}
                  className="px-4 py-3 flex items-start justify-between gap-4 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => onSelectImage(item.imageName)}
                >
                  <p className="text-sm font-medium break-all">
                    {item.imageName.startsWith(`${folderName}/`)
                      ? item.imageName.slice(folderName.length + 1)
                      : item.imageName}
                  </p>
                  <p className="text-xs text-primary text-right break-all">
                    {item.suffix}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center overflow-hidden font-sans">
            <Card className="p-8">
              <div className="flex flex-col items-center gap-2 text-center">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {query.trim()
                    ? "No suffix matches found."
                    : evaluatedCount > 0
                    ? "No determined suffixes in this folder yet."
                    : "No evaluated images in this folder yet."}
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
