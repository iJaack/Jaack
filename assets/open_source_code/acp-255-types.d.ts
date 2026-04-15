type Acp255FormulaKey = 'acp77' | 'gaussian' | 'mono' | 'hybrid';
type Acp255ChartColorKey = 'acp77' | 'current' | 'mono' | 'hybrid';

interface Acp255Point {
  x: number;
  y: number;
}

interface Acp255Series {
  color: string;
  data: Acp255Point[];
}

interface Acp255State {
  fixedV: number;
  fixedN: number;
  acp77Days: number;
}

interface Acp255ComputeApi {
  current255(V: number, n: number): number;
  monotonic255(n: number): number;
  hybrid255(V: number, n: number): number;
  acp77Total(V: number, n: number, sustainedDays: number): number;
  hybridBranch(n: number): number;
}

interface Acp255ExplorerApi {
  compute: Acp255ComputeApi;
  highlightFormula(name: Acp255FormulaKey | null): void;
  clearHighlight(): void;
  setParams(params: Partial<Acp255State>): void;
}

interface Acp255MiniChartConfig {
  formula: Acp255FormulaKey;
  fixedV: number;
  fixedN: number;
  days: number;
}

interface RenderMathOptions {
  delimiters: Array<{
    left: string;
    right: string;
    display: boolean;
  }>;
  throwOnError: boolean;
}

interface Window {
  acp255Explorer?: Acp255ExplorerApi;
  renderMathInElement?: (element: HTMLElement, options: RenderMathOptions) => void;
}
