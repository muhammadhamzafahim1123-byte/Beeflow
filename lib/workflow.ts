export const PIPELINE_STAGES = [
  "Brief",
  "To Do",
  "In Progress",
  "In Review",
  "Changes Required",
  "Approved",
  "Ready for Delivery",
  "Delivered",
  "Completed"
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type TransitionInput = {
  from: PipelineStage;
  to: PipelineStage;
  attachmentCount?: number;
  reviewerName?: string;
  hasBrief?: boolean;
  hasApproval?: boolean;
  hasDeliveryConfirmation?: boolean;
};

export function validateStageTransition(input: TransitionInput): { ok: true } | { ok: false; message: string } {
  const fromIndex = PIPELINE_STAGES.indexOf(input.from);
  const toIndex = PIPELINE_STAGES.indexOf(input.to);

  if (fromIndex === -1 || toIndex === -1) return { ok: false, message: "Unknown workflow stage." };
  if (input.from === "Changes Required" && input.to === "In Review") return input.attachmentCount && input.hasBrief ? { ok: true } : { ok: false, message: "Attach a deliverable and complete the brief before review." };
  if (toIndex !== fromIndex + 1) return { ok: false, message: "Complete the previous step first." };
  if (input.to === "In Review" && (!input.attachmentCount || !input.hasBrief)) return { ok: false, message: "Attach a deliverable and complete the brief before review." };
  if (input.to === "Approved" && !input.reviewerName?.trim()) return { ok: false, message: "Reviewer approval is required." };
  if (input.to === "Ready for Delivery" && !input.hasApproval) return { ok: false, message: "QA approval is required before delivery." };
  if (input.to === "Completed" && !input.hasDeliveryConfirmation) return { ok: false, message: "Delivery confirmation is required before completion." };

  return { ok: true };
}
