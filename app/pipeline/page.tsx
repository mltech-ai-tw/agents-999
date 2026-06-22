import type { Metadata } from "next";
import PipelineRunner from "@/components/PipelineRunner";

export const metadata: Metadata = {
  title: "Agent Pipeline · agents-999",
};

export default function PipelinePage() {
  return <PipelineRunner />;
}
