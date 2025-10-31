export type OptionType = 'CE' | 'PE' | 'SPOT';
export type ProductType = 'MIS' | 'NRML';
export type OrderSide = 'BUY' | 'SELL';

export interface Position {
  id: string;
  symbol: string;
  optionType: OptionType;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  stopLoss?: number;
  target?: number;
}

export interface ChartData {
  time: number;
  price: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Order {
  quantity: number;
  price: number;
  productType: ProductType;
  side: OrderSide;
  optionType: OptionType;
}
