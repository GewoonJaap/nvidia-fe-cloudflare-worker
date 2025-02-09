import { StockApi } from '../../../types/StockApiTypes';
import { saveStockStatus, getStockStatus } from '../../kv/KVHelper';
import { sendMindfactoryNotification } from '../../ntfy/NTFYConnection';
import { MindfactoryApiResponse, MindfactoryProduct } from '../../../types/MindfactoryApiTypes';

export class MindfactoryApi implements StockApi {
  private stockStatus: Record<string, string> = {};
  private storeKey: string = 'mindfactory_store';
  private searchQueries: string[] = ['rtx 5090', 'rtx 5080'];

  constructor(private env: Env) {}

  public async scanForStock(): Promise<void> {
    await this.initializeStockStatus();
    await this.fetchInventory();
    await this.saveStockStatus();
  }

  private async initializeStockStatus(): Promise<void> {
    this.stockStatus = await getStockStatus(this.env, this.storeKey);
  }

  private async fetchInventory(): Promise<void> {
    const currentStock: Record<string, string> = {};

    for (const query of this.searchQueries) {
      const products = await this.searchProducts(query);
      for (const product of products) {
        currentStock[product.link] = 'in_stock';
        const previousStatus = this.stockStatus[product.link];
        if (previousStatus !== 'in_stock') {
          await sendMindfactoryNotification(product.link, product.text, 'InStock', this.env, product.image);
        }
      }
    }

    // Remove products from stock status if they are not present in the current stock
    for (const link in this.stockStatus) {
      if (!currentStock[link]) {
        delete this.stockStatus[link];
      }
    }

    // Update stock status with current stock
    this.stockStatus = { ...this.stockStatus, ...currentStock };
  }

  private async saveStockStatus(): Promise<void> {
    await saveStockStatus(this.env, this.storeKey, this.stockStatus);
  }

  private async searchProducts(query: string): Promise<MindfactoryProduct[]> {
    const url = `https://www.mindfactory.de/ajax_suggest.php?search_query=${encodeURIComponent(query)}&html=false&select_search=undefined`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
        Accept: 'application/json',
        'Accept-Language': 'nl,en-US;q=0.7,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-GPC': '1',
        Priority: 'u=0, i',
        TE: 'trailers',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${url}`);
    }
    const data: MindfactoryApiResponse = await response.json();
    return data.products;
  }
}
