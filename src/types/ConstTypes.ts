export interface NvidiaStore {
  country: string;
  productApiUrls: ProductApiUrl[];
}

export interface ProductApiUrl {
  url: string;
  name: string;
  consumerUrl: string;
}

export interface CoolblueProduct {
  url: string;
  name: string;
}
