"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download } from "lucide-react";

interface ExportDropdownProps {
  onExportAll: () => void;
  onExportFolders: () => void;
}

export default function ExportDropdown({
  onExportAll,
  onExportFolders,
}: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary" title="Export">
          <Download className="h-4 w-4 shrink-0 sm:mr-2" />
          <span className="hidden sm:inline">Export</span>
          <ChevronDown className="ml-1 hidden h-4 w-4 opacity-60 sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportAll}>Export All</DropdownMenuItem>
        <DropdownMenuItem onClick={onExportFolders}>
          Export Folders
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
