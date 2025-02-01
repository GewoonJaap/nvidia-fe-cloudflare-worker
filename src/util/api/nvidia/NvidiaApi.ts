import { NvidiaStore } from '../../../types/ConstTypes';
import { ApiResponse, ListMap } from '../../../types/NvidiaApiTypes';
import { sendToNtfy } from '../../ntfy/NTFYConnection';

export class NvidiaApi {
  public async fetchInventory(store: NvidiaStore, env: Env): Promise<ListMap[]> {
    const results: ListMap[] = [];

    for (const productApi of store.productApiUrls) {
      const response = await fetch(productApi.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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
        throw new Error(`Failed to fetch data from ${productApi.url}`);
      }
      const data: ApiResponse = await response.json();
      const purchasableProducts = this.filterPurchasableProducts(data.listMap);

      for (const product of purchasableProducts) {
        await sendToNtfy(product, store, productApi, env, true);
      }

      results.push(...purchasableProducts);
    }

    return results;
  }

  private filterPurchasableProducts(products: ListMap[]): ListMap[] {
    return products.filter(product => product.is_active != 'false');
  }
}
