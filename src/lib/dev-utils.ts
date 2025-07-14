/**
 * Development utility to simulate network delays for testing loading states
 * This helps developers see loading skeletons in development mode
 */

export const DEV_DELAY_MS = process.env.NODE_ENV === 'development' ? 800 : 0;

export async function simulateDelay(ms: number = DEV_DELAY_MS): Promise<void> {
  if (ms > 0) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function withDelay<T>(promise: Promise<T>, delay: number = DEV_DELAY_MS): Promise<T> {
  if (delay === 0) return promise;
  
  return Promise.all([
    promise,
    simulateDelay(delay)
  ]).then(([result]) => result);
}
