"use client";
import { useState } from "react";
import type { OniEvent } from "@/lib/sources/oni";
import { OniHistory } from "./OniHistory";
import { HistoricalEvents } from "./HistoricalEvents";

/** Shares the selected episode between the ONI chart and the events table. */
export function OniSection() {
  const [selected, setSelected] = useState<OniEvent | null>(null);
  return (
    <>
      <OniHistory highlight={selected} />
      <HistoricalEvents selected={selected} onSelect={setSelected} />
    </>
  );
}
