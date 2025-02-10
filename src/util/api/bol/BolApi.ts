import { sendNotification } from '../../ntfy/NTFYConnection';
import { saveStockStatus, getStockStatus } from '../../kv/KVHelper';
import { BOL_PRODUCTS } from '../../const';
import { StockApi } from '../../../types/StockApiTypes';

export class BolApi implements StockApi {
  private stockStatus: Record<string, string> = {};

  constructor(private env: Env) {}

  public async scanForStock(): Promise<void> {
    await this.initializeStockStatus();
    await this.fetchInventory();
    await this.saveStockStatus();
  }

  private async initializeStockStatus(): Promise<void> {
    this.stockStatus = await getStockStatus(this.env, 'bol_store');
  }

  private async fetchInventory(): Promise<void> {
    console.log(`Checking bol stock for ${BOL_PRODUCTS.length} products...`);
    for (const product of BOL_PRODUCTS) {
      const html = await this.fetchHtmlContent(product.url);
      if (!html) {
        console.warn(`Failed to fetch for: `, product.url);
        return;
      }
      const stockStatus = this.extractStockStatusFromHtml(html);

      if (!stockStatus) {
        return;
      }

      const previousStatus = this.stockStatus[product.url];

      console.log(`Fetched status for: ${product.url}:`, stockStatus, 'Previous status:', previousStatus);

      if (stockStatus.availability === 'InStock' && stockStatus.availability !== previousStatus) {
        await sendNotification({
          productUrl: product.url,
          productName: product.name,
          stockStatus: 'InStock',
          env: this.env,
          storeName: 'Bol',
          imageUrl: stockStatus.image,
          price: stockStatus.price,
        });
      }
      this.stockStatus[product.url] = stockStatus.availability;
    }
  }

  private async saveStockStatus(): Promise<void> {
    await saveStockStatus(this.env, 'bol_store', this.stockStatus);
  }

  private async fetchHtmlContent(url: string): Promise<string | undefined> {
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
      return undefined;
    }
    return response.text();
  }

  private extractStockStatusFromHtml(html: string): { availability: string; image?: string; price?: string } | undefined {
    const ldJsonSplit = html.split('<script type="application/ld+json">');
    if (ldJsonSplit.length < 2) {
      return undefined;
    }

    const ldJson = ldJsonSplit[1].split('</script>')[0];
    const productData = JSON.parse(ldJson);

    if (productData.hasVariant && Array.isArray(productData.hasVariant) && productData.hasVariant.length > 0) {
      return {
        availability: productData.hasVariant[0].offers.availability || 'OutOfStock',
        image: productData.hasVariant[0].image?.url,
        price: productData.hasVariant[0].offers.price,
      };
    }

    return { availability: productData.offers.availability || 'OutOfStock', image: productData.image?.url, price: productData.offers.price };
  }
}
