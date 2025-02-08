import { sendBolNotification } from '../../ntfy/NTFYConnection';
import { saveStockStatus, getStockStatus } from '../../kv/KVHelper';
import { BOL_PRODUCTS } from '../../const';

export class BolApi {
  public async fetchInventory(productUrl: string, env: Env): Promise<void> {
    const html = await this.fetchHtmlContent(productUrl);
    const stockStatus = this.extractStockStatusFromHtml(html);

    if (stockStatus === 'InStock') {
      const previousStatus = await getStockStatus(env, productUrl);
      if (stockStatus !== previousStatus) {
        const product = BOL_PRODUCTS.find(p => p.url === productUrl);
        const productName = product ? product.name : 'Unknown Product';
        await sendBolNotification(productUrl, productName, stockStatus, env);
        await saveStockStatus(env, productUrl, stockStatus);
      }
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
    const ldJsonSplit = html.split('<script type="application/ld+json">');
    if (ldJsonSplit.length < 2) {
      return 'OutOfStock';
    }

    const ldJson = ldJsonSplit[1].split('</script>')[0];
    const productData = JSON.parse(ldJson);

    if (productData.hasVariant && Array.isArray(productData.hasVariant) && productData.hasVariant.length > 0) {
      return productData.hasVariant[0].offers.availability || 'OutOfStock';
    }

    return productData.offers.availability || 'OutOfStock';
  }
}
