"use client";

import ContextualInspector from "./ContextualInspector";
import { useWorkstation } from "./WorkstationProvider";

export default function InspectorHost() {
  const { inspectorActive, selectedCase } = useWorkstation();
  if (!inspectorActive || !selectedCase) return null;
  return <ContextualInspector selectedCase={selectedCase} />;
}
