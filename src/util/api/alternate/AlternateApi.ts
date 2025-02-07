import { sendAlternateNotification } from '../../ntfy/NTFYConnection';
import { saveStockStatus, getStockStatus } from '../../kv/KVHelper';
import { ALTERNATE_STORE } from '../../const';

export class AlternateApi {
  public async fetchInventory(productUrl: string, env: Env): Promise<void> {
    const html = await this.fetchHtmlContent(productUrl);
    const productData = this.extractProductDataFromHtml(html);

    if (!productData) {
      console.log(`Failed to extract product data from ${productUrl}`);
      return;
    }

    const { price, image, availability } = productData;
    const previousStatus = await getStockStatus(env, productUrl);

    if (availability !== previousStatus) {
      const product = ALTERNATE_STORE.find(p => p.url === productUrl);
      const productName = product ? product.name : 'Unknown Product';
      await sendAlternateNotification(productUrl, productName, availability, env, image);
      await saveStockStatus(env, productUrl, availability);
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

  private extractProductDataFromHtml(html: string): { price: string; image: string; availability: string } | null {
    const ldJsonSplit = html.split('<script type="application/ld+json">');
    if (ldJsonSplit.length < 2) {
      return null;
    }

    const ldJson = ldJsonSplit[1].split('</script>')[0];
    const productDatas = JSON.parse(ldJson);
    const productData = productDatas[0];

    const price = productData.offers.price || 'N/A';
    const image = productData.image || '';
    const availability = productData.offers.availability || 'OutOfStock';

    return { price, image, availability };
  }
}
