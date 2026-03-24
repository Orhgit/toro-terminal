/**
 * Mock mode: when OPENAI_API_KEY is not set, agents return realistic
 * simulated data so the full Toro UI can be demonstrated end-to-end.
 */
export function isMockMode(): boolean {
  return !process.env.OPENAI_API_KEY;
}
