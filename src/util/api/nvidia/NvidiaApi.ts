import { NvidiaStore } from '../../../types/ConstTypes';
import { ApiResponse, ListMap } from '../../../types/NvidiaApiTypes';
import { sendToNtfy } from '../../ntfy/NTFYConnection';
import cheerio from 'cheerio';

export class NvidiaApi {
  public async fetchInventory(store: NvidiaStore, env: Env): Promise<ListMap[]> {
    const results: ListMap[] = [];

    for (const productApi of store.productApiUrls) {
      const html = await this.fetchHtmlContent(productApi.consumerUrl);
      const sku = this.extractSkuFromHtml(html);

      const apiUrlWithSku = `${productApi.url}${sku}`;
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
      const purchasableProducts = this.filterPurchasableProducts(data.listMap);

      for (const product of purchasableProducts) {
        product.fe_sku = sku;
        await sendToNtfy(product, store, productApi, env, true);
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
    return products.filter(product => product.is_active != 'false');
  }

  private extractSkuFromHtml(html: string): string {
    const $ = cheerio.load(html);
    const jsonLdScript = $('script[type="application/ld+json"]').html();
    if (jsonLdScript) {
      const jsonLd = JSON.parse(jsonLdScript);
      const product = jsonLd.find((item: any) => item['@type'] === 'Product');
      if (product && product.mpn) {
        return product.mpn;
      }
    }
    return 'SKU not found';
  }
}
