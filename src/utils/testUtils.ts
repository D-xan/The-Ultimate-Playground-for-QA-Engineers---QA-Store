import { useChallengeMode } from '@/store/useChallengeMode';

// Generates a random string if dynamic IDs are enabled, otherwise returns the stable ID
export const getDynamicId = (stableId: string) => {
  const { enabled, dynamicIds } = useChallengeMode.getState();
  
  if (!enabled || !dynamicIds) {
    return stableId;
  }
  
  // Random suffix that changes on every render
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${stableId}_${randomSuffix}`;
};

// Generates a stable data-testid only if challenge mode is disabled
export const getTestId = (testId: string) => {
  const { enabled } = useChallengeMode.getState();
  
  if (enabled) {
    return undefined; // Remove test IDs in challenge mode
  }
  
  return testId;
};
