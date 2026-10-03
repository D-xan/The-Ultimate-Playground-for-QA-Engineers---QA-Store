import clickTrapsSpec from '../../../e2e/click-traps.spec.ts?raw';
import locatorTrapsSpec from '../../../e2e/locator-traps.spec.ts?raw';
import deepDomSpec from '../../../e2e/deep-dom.spec.ts?raw';
import flakySpec from '../../../e2e/flaky.spec.ts?raw';
import widgetsSpec from '../../../e2e/widgets.spec.ts?raw';
import progressBarSpec from '../../../e2e/progress-bar.spec.ts?raw';
import windowsSpec from '../../../e2e/windows.spec.ts?raw';
import sortableSpec from '../../../e2e/sortable.spec.ts?raw';
import { clickTraps } from './click-traps';
import { locatorTraps } from './locator-traps';
import { deepDom } from './deep-dom';
import { flaky } from './flaky';
import { widgets } from './widgets';
import { progressBar } from './progress-bar';
import { windows } from './windows';
import { sortable } from './sortable';

export interface Solution {
  playwright: string;
  seleniumJava: string;
  seleniumPython: string;
  cypress: string;
}

export const solutions: Record<string, Solution> = {
  'click-traps': { playwright: clickTrapsSpec, ...clickTraps },
  'locator-traps': { playwright: locatorTrapsSpec, ...locatorTraps },
  'deep-dom': { playwright: deepDomSpec, ...deepDom },
  flaky: { playwright: flakySpec, ...flaky },
  widgets: { playwright: widgetsSpec, ...widgets },
  'progress-bar': { playwright: progressBarSpec, ...progressBar },
  windows: { playwright: windowsSpec, ...windows },
  sortable: { playwright: sortableSpec, ...sortable },
};
