import { sendNotification } from '../../ntfy/NTFYConnection';
import { saveStockStatus, getStockStatus } from '../../kv/KVHelper';
import { ALTERNATE_STORE } from '../../const';
import { StockApi } from '../../../types/StockApiTypes';

export class AlternateApi implements StockApi {
  private stockStatus: Record<string, string> = {};
  private storeKey: string = 'alternate_store';

  constructor(private env: Env) {}

  async scanForStock(): Promise<void> {
    await this.initializeStockStatus();
    for (const product of ALTERNATE_STORE) {
      await this.fetchInventory(product.url);
    }
    await this.saveStockStatus();
  }

  public async initializeStockStatus(): Promise<void> {
    this.stockStatus = await getStockStatus(this.env, this.storeKey);
  }

  public async fetchInventory(productUrl: string): Promise<void> {
    const html = await this.fetchHtmlContent(productUrl);
    const productData = this.extractProductDataFromHtml(html);

    if (!productData) {
      console.log(`Failed to extract product data from ${productUrl}`);
      return;
    }

    const { price, image, availability } = productData;
    const previousStatus = this.stockStatus[productUrl];

    console.log(`Fetched status for: ${productUrl}:`, availability, 'Previous status:', previousStatus);

    if (availability === 'InStock' && availability !== previousStatus) {
      const product = ALTERNATE_STORE.find(p => p.url === productUrl);
      const productName = product ? product.name : 'Unknown Product';
      await sendNotification({
        productUrl,
        productName,
        stockStatus: 'InStock',
        env: this.env,
        imageUrl: image,
        storeName: 'Alternate',
        price: price,
      });
    }
    this.stockStatus[productUrl] = availability;
  }

  public async saveStockStatus(): Promise<void> {
    await saveStockStatus(this.env, this.storeKey, this.stockStatus);
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

  private extractProductDataFromHtml(html: string): { price: string; image?: string; availability: string } | null {
    const ldJsonSplit = html.split('<script type="application/ld+json">');
    if (ldJsonSplit.length < 2) {
      return null;
    }

    const ldJson = ldJsonSplit[1].split('</script>')[0];
    const productDatas = JSON.parse(ldJson);
    const productData = productDatas[0];

    const price = productData.offers.price || 'N/A';
    const image = productData.image || undefined;
    let availability = productData.offers.availability || 'OutOfStock';

    if (html.includes('Artikel kann derzeit nicht gekauft werden')) {
      availability = 'OutOfStock';
    }

    return { price, image, availability };
  }
}
