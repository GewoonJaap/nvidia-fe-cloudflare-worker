import { sendCoolblueNotification } from '../../ntfy/NTFYConnection';
import { saveStockStatus, getStockStatus } from '../../kv/KVHelper';
import { COOLBLUE_PRODUCTS } from '../../const';

export class CoolblueApi {
  public async fetchInventory(productUrl: string, env: Env): Promise<void> {
    const html = await this.fetchHtmlContent(productUrl);
    const stockStatus = this.extractStockStatusFromHtml(html);

    const previousStatus = await getStockStatus(env, productUrl);
    if (stockStatus === 'in_stock' && stockStatus !== previousStatus) {
      const product = COOLBLUE_PRODUCTS.find(p => p.url === productUrl);
      const productName = product ? product.name : 'Unknown Product';
      await sendCoolblueNotification(productUrl, productName, stockStatus, env);
      await saveStockStatus(env, productUrl, stockStatus);
    }
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
