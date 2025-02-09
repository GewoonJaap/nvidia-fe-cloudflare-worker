import { saveStockStatus, getStockStatus } from '../../kv/KVHelper';
import { COOLBLUE_PRODUCTS } from '../../const';
import { StockApi } from '../../../types/StockApiTypes';
import { sendNotification } from '../../ntfy/NTFYConnection';

export class CoolblueApi implements StockApi {
  private stockStatus: Record<string, string> = {};

  constructor(private env: Env) {}

  public async scanForStock(): Promise<void> {
    await this.initializeStockStatus();
    console.log(`Checking coolblue stock status for: ${COOLBLUE_PRODUCTS.length} products...`);
    for (const product of COOLBLUE_PRODUCTS) {
      await this.fetchInventory(product.url);
    }
    await this.saveStockStatus();
  }

  private async initializeStockStatus(): Promise<void> {
    this.stockStatus = await getStockStatus(this.env, 'coolblue_store');
  }

  private async fetchInventory(productUrl: string): Promise<void> {
    const html = await this.fetchHtmlContent(productUrl);
    const productData = this.extractProductDataFromHtml(html);

    if (!productData) {
      console.log(`Failed to extract product data from ${productUrl}`);
      return;
    }

    const { availability, image, price } = productData;
    const previousStatus = this.stockStatus[productUrl];

    console.log(`Fetched status for: ${productUrl}:`, availability, 'Previous status:', previousStatus);

    if (availability === 'InStock' && availability !== previousStatus) {
      const product = COOLBLUE_PRODUCTS.find(p => p.url === productUrl);
      const productName = product ? product.name : 'Unknown Product';
      await sendNotification({
        productUrl,
        productName,
        stockStatus: 'InStock',
        env: this.env,
        storeName: 'Coolblue',
        imageUrl: image,
        price,
      });
    }
    this.stockStatus[productUrl] = availability;
  }

  private async saveStockStatus(): Promise<void> {
    await saveStockStatus(this.env, 'coolblue_store', this.stockStatus);
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

  private extractProductDataFromHtml(html: string): { availability: string; image?: string; price?: string } | null {
    const ldJsonSplit = html.split('<script type="application/ld+json">');
    if (ldJsonSplit.length < 2) {
      return null;
    }

    const ldJson = ldJsonSplit[1].split('</script>')[0];
    const productData = JSON.parse(ldJson);

    const availability = productData.offers.availability.split('/').pop() || 'OutOfStock';
    const image = productData.image || undefined;
    const price = productData.offers.price || undefined;

    return { availability, image, price };
  }
}
