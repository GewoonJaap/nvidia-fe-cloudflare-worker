export interface ApiResponse {
  success: boolean;
  map: any; // Adjust the type if you know the structure of 'map'
  listMap: ListMap[];
}

export interface ListMap {
  is_active: string;
  product_url: string;
  price: string;
  fe_sku: string;
  locale: string;
}
