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

export async function sendCoolblueNotification(productUrl: string, productName: string, stockStatus: string, env: Env): Promise<void> {
  console.log('Sending notification to NTFY for Coolblue product:', productName);
  const notificationMessage = getCoolblueTemplateString(stockStatus);
  const bodyObject = {
    topic: env.NTFY_TOPIC,
    message: renderTemplateString(notificationMessage.MESSAGE, {
      PRODUCT_NAME: productName,
      STOCK_STATUS: stockStatus,
    }),
    actions: [
      {
        action: 'view',
        label: 'View Product',
        url: productUrl,
      },
    ],
  };

  const headers = {
    Title: renderTemplateString(notificationMessage.MESSAGE, {
      PRODUCT_NAME: productName,
      STOCK_STATUS: stockStatus,
    }),
    Priority: notificationMessage.PRIORITY.name,
    Tags: `coolblue,${stockStatus}`,
    Authorization: 'Bearer ' + env.NTFY_BEARER,
  };

  await postToNtfy(env.NTFY_URL, bodyObject, headers);
}

async function postToNtfy(url: string, body: Record<string, unknown>, headers: Record<string, string>): Promise<void> {
  console.log('Posting to NTFY:', url, body, headers);
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
  console.log('NTFY fetch result:', response);
  if (response.ok) {
    const responseBody = await response.json();
    console.log('NTFY response body:', responseBody);
  } else {
    console.log('NTFY response status:', response.status);
  }
}

function getTags(store: NvidiaStore, product: ListMap, nvidiaProduct: ProductApiUrl): string {
  let tags = [store.country, product.fe_sku, nvidiaProduct.name];
  // Add more tags logic if needed
  return tags.join(',');
}

function getTemplateString(product: ListMap, firstTimeSeen: boolean): { MESSAGE: string; PRIORITY: { name: string; rank: number } } {
  if (product.is_active != 'false') {
    if (firstTimeSeen) {
      return { MESSAGE: 'Product available for the first time {{PRODUCT_TITLE}}', PRIORITY: { name: 'max', rank: 1 } };
    }
    return { MESSAGE: 'Product available {{PRODUCT_TITLE}}', PRIORITY: { name: 'max', rank: 2 } };
  }
  return { MESSAGE: 'Product unavailable {{PRODUCT_TITLE}}', PRIORITY: { name: 'low', rank: 3 } };
}

function getCoolblueTemplateString(stockStatus: string): { MESSAGE: string; PRIORITY: { name: string; rank: number } } {
  if (stockStatus === 'on_stock') {
    return { MESSAGE: 'Coolblue product is now in stock {{PRODUCT_NAME}}', PRIORITY: { name: 'max', rank: 1 } };
  } else if (stockStatus === 'available_soon') {
    return { MESSAGE: 'Coolblue product will be available soon {{PRODUCT_NAME}}', PRIORITY: { name: 'default', rank: 2 } };
  }
  return { MESSAGE: 'Coolblue product is out of stock {{PRODUCT_NAME}}', PRIORITY: { name: 'low', rank: 3 } };
}

function getPriorityForProductNotification(
  product: ListMap,
  notificationMessage: { MESSAGE: string; PRIORITY: { name: string; rank: number } }
): string {
  // Add logic to determine priority if needed
  return notificationMessage.PRIORITY.name;
}
