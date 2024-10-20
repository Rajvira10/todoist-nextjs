"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid, List } from "lucide-react";

interface ViewToggleProps {
  initialView: "list" | "grid";
}

export function ViewToggle({ initialView }: ViewToggleProps) {
  const router = useRouter();

  const handleViewChange = (value: string) => {
    if (value === "list" || value === "grid") {
      router.push(`?view=${value}`);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={initialView}
      onValueChange={handleViewChange}
    >
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <Grid className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
