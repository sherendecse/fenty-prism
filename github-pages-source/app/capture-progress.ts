export const captureChecks=['light','even','pose','frame'] as const;
export type CaptureChecks=Record<(typeof captureChecks)[number],boolean>;
export function canContinueCapture(checks:CaptureChecks,bare:boolean){return bare&&captureChecks.every(k=>checks[k]);}
