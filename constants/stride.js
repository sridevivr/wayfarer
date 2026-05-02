// Fitbit's profile endpoint reports stride length in centimeters
// (`strideLengthWalking`). Wayfarer works everywhere in steps-per-mile
// because that's what the visual design + onboarding copy use.
//
// 1 mile = 160,934 cm — round to integer steps so distances stay clean.
//
// PRD §6.1 fallback: if Fitbit doesn't have a stride for the user
// (unusual but possible), default to 2,200 steps/mile and let the
// user adjust on the StrideConfirm screen.

export const CM_PER_MILE = 160934;
export const STRIDE_FALLBACK = 2200;

export function cmToStepsPerMile(cm) {
  if (!cm || cm <= 0) return STRIDE_FALLBACK;
  return Math.round(CM_PER_MILE / cm);
}
