import { NvidiaStore } from '../../../types/ConstTypes';
import { ApiResponse, ListMap } from '../../../types/NvidiaApiTypes';
import { sendToNtfy } from '../../ntfy/NTFYConnection';
import { saveStockStatus, getStockStatus } from '../../kv/KVHelper';

export class NvidiaApi {
  public async fetchInventory(store: NvidiaStore, env: Env): Promise<ListMap[]> {
    console.log('Fetching inventory for store:', store);
    const results: ListMap[] = [];

    for (const productApi of store.productApiUrls) {
      const html = await this.fetchHtmlContent(productApi.consumerUrl);
      console.log('Fetched HTML content:');
      const sku = this.extractSkuFromHtml(html);
      console.log('Extracted SKU from HTML:', sku);

      const apiUrlWithSku = `${productApi.url}${sku}&locale=nl-nl`;
      const response = await fetch(apiUrlWithSku, {
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
        throw new Error(`Failed to fetch data from ${apiUrlWithSku}`);
      }
      const data: ApiResponse = await response.json();
      console.log('Fetched API response:', data);
      const purchasableProducts = data.listMap; //this.filterPurchasableProducts(data.listMap);
      console.log('Filtered purchasable products:', purchasableProducts);

      for (const product of purchasableProducts) {
        product.fe_sku = sku;

        const previousStatus = await getStockStatus(env, sku);
        const isInStock = product.is_active !== 'false';

        if (isInStock && previousStatus !== 'in_stock') {
          await sendToNtfy(product, store, productApi, env, true);
        }

        if (previousStatus !== (isInStock ? 'in_stock' : 'out_of_stock')) {
          await saveStockStatus(env, sku, isInStock ? 'in_stock' : 'out_of_stock');
        }
      }

      results.push(...purchasableProducts);
    }

    return results;
  }

  private async fetchHtmlContent(url: string): Promise<string> {
    const response = await fetch(url, {
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
      throw new Error(`Failed to fetch HTML content from ${url}`);
    }
    return response.text();
  }

  private filterPurchasableProducts(products: ListMap[]): ListMap[] {
    return products.filter(product => product.is_active != 'false' || product.product_url);
  }

  private extractSkuFromHtml(html: string): string {
    const mpnSplit = html.split('"mpn":"');
    if (mpnSplit.length < 2) {
      return 'SKU not found';
    }

    const skuSplit = mpnSplit[1].split('"');
    if (skuSplit.length < 2) {
      return 'SKU not found';
    }

    return skuSplit[0];
  }
}
