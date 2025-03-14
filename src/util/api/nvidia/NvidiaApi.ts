import { NvidiaStore } from '../../../types/ConstTypes';
import { ApiResponse, ListMap } from '../../../types/NvidiaApiTypes';
import { sendNotification } from '../../ntfy/NTFYConnection';
import { saveStockStatus, getStockStatus } from '../../kv/KVHelper';
import { StockApi } from '../../../types/StockApiTypes';
import { NVIDIA_STORES } from '../../const';

export class NvidiaApi implements StockApi {
  private stockStatus: Record<string, string> = {};

  constructor(private env: Env) {}

  public async scanForStock(): Promise<void> {
    await this.initializeStockStatus();
    for (const store of NVIDIA_STORES) {
      await this.fetchInventory(store);
    }
    await this.saveStockStatus();
  }

  private async initializeStockStatus(): Promise<void> {
    this.stockStatus = await getStockStatus(this.env, 'nvidia_store');
  }

  private async fetchInventory(store: NvidiaStore): Promise<ListMap[]> {
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

        const previousStatus = this.stockStatus[sku];
        const isInStock = product.is_active !== 'false';

        if (isInStock && previousStatus !== 'in_stock') {
          const productData = this.extractProductDataFromHtml(html);
          await sendNotification({
            productUrl: product.product_url,
            productName: product.fe_sku,
            stockStatus: 'InStock',
            env: this.env,
            storeName: 'Nvidia',
            imageUrl: productData?.image,
            price: productData?.price,
            additionalActions: [
              {
                action: 'view',
                label: 'NVIDIA Marketplace',
                url: productApi.consumerUrl,
              },
            ],
          });
        }

        if (previousStatus !== (isInStock ? 'in_stock' : 'out_of_stock')) {
          this.stockStatus[sku] = isInStock ? 'in_stock' : 'out_of_stock';
        }
      }

      results.push(...purchasableProducts);
    }

    return results;
  }

  private async saveStockStatus(): Promise<void> {
    await saveStockStatus(this.env, 'nvidia_store', this.stockStatus);
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

  private extractProductDataFromHtml(html: string): { price: string; image?: string } | null {
    const ldJsonSplit = html.split('<script type="application/ld+json">');
    if (ldJsonSplit.length < 2) {
      return null;
    }

    const ldJson = ldJsonSplit[1].split('</script>')[0];
    const productDatas = JSON.parse(ldJson);
    const productData = productDatas[0];

    const price = productData.offers.price || 'N/A';
    const image = productData.image || undefined;

    return { price, image };
  }

  private determineGpuSeries(productName: string): string | null {
    if (productName.includes('5080')) {
      return '5080';
    } else if (productName.includes('5090')) {
      return '5090';
    }
    return null;
  }
}
