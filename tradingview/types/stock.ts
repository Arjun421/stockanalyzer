export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  volume: string;
  marketCap: string;
  sector: string;
}

export interface ChartPoint {
  time: string;
  price: number;
}
