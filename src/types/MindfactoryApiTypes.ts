export interface MindfactoryApiResponse {
  status: boolean;
  error: string | null;
  num_found: string;
  products: MindfactoryProduct[];
  microsites: any[];
  manufacturer: any[];
}

export interface MindfactoryProduct {
  text: string;
  text_clean: string;
  image: string;
  price: string;
  price_special: string;
  stock_id: string;
  stock_text: string | null;
  link: string;
}
