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
    const stockStatus = this.extractStockStatusFromHtml(html);

    const previousStatus = this.stockStatus[productUrl];

    console.log(`Fetched status for: ${productUrl}:`, stockStatus, 'Previous status:', previousStatus);

    if (stockStatus === 'on_stock' && stockStatus !== previousStatus) {
      const product = COOLBLUE_PRODUCTS.find(p => p.url === productUrl);
      const productName = product ? product.name : 'Unknown Product';
      await sendNotification({
        productUrl,
        productName,
        stockStatus: 'InStock',
        env: this.env,
        storeName: 'Coolblue',
      });
    }
    this.stockStatus[productUrl] = stockStatus;
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

  private extractStockStatusFromHtml(html: string): string {
    const gaDataSplit = html.split('window.cb.gaData = ');
    if (gaDataSplit.length < 2) {
      return 'stock_status not found';
    }

    const gaDataJson = gaDataSplit[1].split('};')[0] + '}';
    const gaData = JSON.parse(gaDataJson);

    return gaData.contextParams.stock_status || 'stock_status not found';
  }
}
