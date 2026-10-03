import { useChallengeMode } from '@/store/useChallengeMode';
import { PLANTED_BUGS, type PlantedBug } from '@/data/bugCatalog';

/** Read at call time so toggling Bug Hunt takes effect without a reload. */
export function isBugActive(id: string): boolean {
  return useChallengeMode.getState().bugHunt && PLANTED_BUGS.some((b) => b.id === id);
}

export function matchReport(area: string, symptom: string): PlantedBug | undefined {
  return PLANTED_BUGS.find((b) => b.area === area && b.symptom === symptom);
}

/** Tax rate shown as 8%; the `cart-tax-rate` bug charges 18%. */
export function taxRate(): number {
  return isBugActive('cart-tax-rate') ? 0.18 : 0.08;
}
