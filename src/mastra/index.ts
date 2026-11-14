import { Mastra } from "@mastra/core";
import { reviewSummaryAgent } from "./agents/review-summary-agent";

export const mastra = new Mastra({
  agents: { reviewSummaryAgent },
});
