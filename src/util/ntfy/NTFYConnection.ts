import { NvidiaStore, ProductApiUrl } from '../../types/ConstTypes';
import { ListMap } from '../../types/NvidiaApiTypes';
import { renderTemplateString } from '../stringHelper/stringTemplateRenderer';

export async function sendToNtfy(
  product: ListMap,
  store: NvidiaStore,
  productNvidia: ProductApiUrl,
  env: Env,
  firstTimeSeen: boolean = true
): Promise<void> {
  console.log('Sending notification to NTFY for product:', product.fe_sku);
  const notificationMessage = getTemplateString(product, firstTimeSeen);
  const bodyObject = {
    topic: env.NTFY_TOPIC,
    message: renderTemplateString(notificationMessage.MESSAGE, {
      PRODUCT_TITLE: productNvidia.name,
      STORE_NAME: store.country,
    }),
    actions: [
      {
        action: 'view',
        label: 'View Product',
        url: product.product_url || productNvidia.consumerUrl,
      },
      {
        action: 'view',
        label: 'NVIDIA Marketplace',
        url: productNvidia.consumerUrl,
      },
    ],
  };

  const headers = {
    Title: renderTemplateString(notificationMessage.MESSAGE, {
      PRODUCT_TITLE: productNvidia.name,
      STORE_NAME: store.country,
    }),
    Priority: getPriorityForProductNotification(product, notificationMessage),
    Tags: getTags(store, product, productNvidia),
    Authorization: 'Bearer ' + env.NTFY_BEARER,
  };

  await postToNtfy(env.NTFY_URL, bodyObject, headers);
}

async function postToNtfy(url: string, body: Record<string, unknown>, headers: Record<string, string>): Promise<void> {
  console.log('Posting to NTFY:', url, body);
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
}

function getTags(store: NvidiaStore, product: ListMap, nvidiaProduct: ProductApiUrl): string {
  let tags = [store.country, product.fe_sku, nvidiaProduct.name];
  // Add more tags logic if needed
  return tags.join(',');
}

function getTemplateString(product: ListMap, firstTimeSeen: boolean): { MESSAGE: string; PRIORITY: { name: string; rank: number } } {
  if (product.is_active != 'false') {
    if (firstTimeSeen) {
      return { MESSAGE: 'Product available for the first time {{PRODUCT_TITLE}}', PRIORITY: { name: 'high', rank: 1 } };
    }
    return { MESSAGE: 'Product available {{PRODUCT_TITLE}}', PRIORITY: { name: 'medium', rank: 2 } };
  }
  return { MESSAGE: 'Product unavailable {{PRODUCT_TITLE}}', PRIORITY: { name: 'low', rank: 3 } };
}

function getPriorityForProductNotification(
  product: ListMap,
  notificationMessage: { MESSAGE: string; PRIORITY: { name: string; rank: number } }
): string {
  // Add logic to determine priority if needed
  return notificationMessage.PRIORITY.name;
}
