export interface NotificationPayload {
  productUrl: string;
  productName: string;
  stockStatus: StockStatus;
  env: Env;
  imageUrl?: string;
  storeName?: StoreName;
  additionalActions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  label: string;
  url: string;
}

export interface NotificationMessage {
  MESSAGE: string;
  PRIORITY: NotificationPriority;
}

export interface NotificationPriority {
  name: string;
  rank: number;
}

export type StockStatus = 'InStock' | 'OutOfStock';

export type StoreName = 'Coolblue' | 'Bol' | 'Alternate' | 'Mindfactory' | 'Nvidia';
