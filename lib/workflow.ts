export const PIPELINE_STAGES = ["Brief", "To Do", "In Progress", "In Review", "Approved", "Delivered"] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type TransitionInput = {
  from: PipelineStage;
  to: PipelineStage;
  attachmentCount?: number;
  reviewerName?: string;
};

export function validateStageTransition(input: TransitionInput): { ok: true } | { ok: false; message: string } {
  const fromIndex = PIPELINE_STAGES.indexOf(input.from);
  const toIndex = PIPELINE_STAGES.indexOf(input.to);

  if (fromIndex === -1 || toIndex === -1) return { ok: false, message: "Unknown workflow stage." };
  if (toIndex !== fromIndex + 1) return { ok: false, message: "Tasks can only move forward one stage at a time." };
  if (input.to === "In Review" && !input.attachmentCount) return { ok: false, message: "Attach a deliverable before moving to review." };
  if (input.to === "Approved" && !input.reviewerName?.trim()) return { ok: false, message: "Reviewer name is required for approval." };

  return { ok: true };
}
