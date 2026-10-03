export const TARGET_W = 600;
export const TARGET_H = 300;
export const TARGET_R = 30;

export interface Point { x: number; y: number }

/** Where the moving target is after `t` seconds, in drawing coordinates. Peak speed is about 55 px/s. */
export function targetAt(t: number): Point {
  return { x: 300 + 220 * Math.sin(t * 0.2), y: 150 + 100 * Math.sin(t * 0.33 + 1) };
}

export function isHit(p: Point, target: Point, r: number): boolean {
  return Math.hypot(p.x - target.x, p.y - target.y) <= r;
}

export const SALES: { month: string; value: number }[] = [
  { month: 'Jan', value: 3120 }, { month: 'Feb', value: 2890 }, { month: 'Mar', value: 4210 },
  { month: 'Apr', value: 3980 }, { month: 'May', value: 4560 }, { month: 'Jun', value: 5120 },
  { month: 'Jul', value: 6030 }, { month: 'Aug', value: 7940 }, { month: 'Sep', value: 6410 },
  { month: 'Oct', value: 5280 }, { month: 'Nov', value: 4870 }, { month: 'Dec', value: 6650 },
];
