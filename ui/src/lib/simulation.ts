export const LAUNCH_DELAY_MS = 1500;

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
