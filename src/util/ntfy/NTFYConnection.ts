import { NotificationPayload, StockStatus, NotificationMessage } from '../../types/NTFYTypes';
import { renderTemplateString } from '../stringHelper/stringTemplateRenderer';

export async function sendNotification(payload: NotificationPayload): Promise<void> {
  console.log('Sending notification to NTFY for product:', payload.productName);
  const notificationMessage = getTemplateString(payload.stockStatus);
  const bodyObject = {
    topic: payload.env.NTFY_TOPIC,
    message: renderTemplateString(notificationMessage.MESSAGE, {
      PRODUCT_NAME: payload.productName,
      STOCK_STATUS: payload.stockStatus,
      STORE_NAME: payload.storeName || 'Unknown store',
      PRICE: payload.price || 'Unknown price',
    }),
    actions: [
      {
        action: 'view',
        label: 'View Product',
        url: payload.productUrl,
      },
      ...(payload.additionalActions || []),
    ],
  };

  const headers: Record<string, string> = {
    Title: renderTemplateString(notificationMessage.MESSAGE, {
      PRODUCT_NAME: payload.productName,
      STOCK_STATUS: payload.stockStatus,
      STORE_NAME: payload.storeName || 'Unknown store',
      PRICE: payload.price || 'Unknown price',
    }),
    Priority: notificationMessage.PRIORITY.name,
    Tags: `${payload.storeName || 'Unknown store'},${payload.stockStatus}`,
    Authorization: 'Bearer ' + payload.env.NTFY_BEARER,
  };

  if (payload.imageUrl) {
    headers.Attach = payload.imageUrl;
  }

  await postToNtfy(payload.env.NTFY_URL, bodyObject, headers);

  // Determine GPU series and send notification to series-specific topic
  const gpuSeries = determineGpuSeries(payload.productName);
  if (gpuSeries) {
    const seriesTopic = payload.env[`NTFY_TOPIC_${gpuSeries}`];
    if (seriesTopic) {
      bodyObject.topic = seriesTopic;
      await postToNtfy(payload.env.NTFY_URL, bodyObject, headers);
    }
  }
}

function getTemplateString(stockStatus: StockStatus): NotificationMessage {
  if (stockStatus === 'InStock') {
    return { MESSAGE: '{{STORE_NAME}} - Product is now in stock {{PRODUCT_NAME}} for {{PRICE}}', PRIORITY: { name: 'max', rank: 1 } };
  }
  return { MESSAGE: '{{STORE_NAME}} - Product is out of stock {{PRODUCT_NAME}}', PRIORITY: { name: 'low', rank: 3 } };
}

function determineGpuSeries(productName: string): string | null {
  if (productName.includes('5080')) {
    return '5080';
  } else if (productName.includes('5090')) {
    return '5090';
  }
  return null;
}

async function postToNtfy(url: string, body: Record<string, unknown>, headers: Record<string, string>): Promise<void> {
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
}
