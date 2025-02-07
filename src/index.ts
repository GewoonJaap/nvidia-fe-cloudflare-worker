import { Hono } from 'hono';
import { NvidiaApi } from './util/api/nvidia/NvidiaApi';
import { CoolblueApi } from './util/api/coolblue/CoolblueApi';
import { BolApi } from './util/api/bol/BolApi';
import { NVIDIA_STORES, COOLBLUE_PRODUCTS, BOL_PRODUCTS } from './util/const';

const app = new Hono();

(app as any).scheduled = async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
  console.log('Scheduled function triggered with event:', event, 'env:', env, 'ctx:', ctx);
  for (const store of NVIDIA_STORES) {
    const nvidiaApi = new NvidiaApi();
    await nvidiaApi.fetchInventory(store, env);
  }
  for (const product of COOLBLUE_PRODUCTS) {
    const coolblueApi = new CoolblueApi();
    await coolblueApi.fetchInventory(product.url, env);
  }
  for (const product of BOL_PRODUCTS) {
    const bolApi = new BolApi();
    await bolApi.fetchInventory(product.url, env);
  }
};

app.get('/', c => {
  return c.text('Hello Hono!');
});

app.get('/health', c => {
  return c.text('OK');
});

app.get('/api/test', async c => {
  for (const store of NVIDIA_STORES) {
    console.log('Processing store in /api/test route:', store);
    const nvidiaApi = new NvidiaApi();
    await nvidiaApi.fetchInventory(store, c.env as Env);
  }
  for (const product of COOLBLUE_PRODUCTS) {
    console.log('Processing product in /api/test route:', product);
    const coolblueApi = new CoolblueApi();
    await coolblueApi.fetchInventory(product.url, c.env as Env);
  }
  for (const product of BOL_PRODUCTS) {
    console.log('Processing product in /api/test route:', product);
    const bolApi = new BolApi();
    await bolApi.fetchInventory(product.url, c.env as Env);
  }
  return c.json({ message: 'Hello World!' });
});

app.get('/api/sku', async c => {
  const store = NVIDIA_STORES[0]; // Assuming you want to fetch SKU for the first store
  console.log('Processing store in /api/sku route:', store);
  const nvidiaApi = new NvidiaApi();
  const inventory = await nvidiaApi.fetchInventory(store, c.env as Env);
  return c.json({ inventory });
});

app.get('/api/coolblue', async c => {
  for (const product of COOLBLUE_PRODUCTS) {
    console.log('Processing product in /api/coolblue route:', product);
    const coolblueApi = new CoolblueApi();
    await coolblueApi.fetchInventory(product.url, c.env as Env);
  }
  return c.json({ message: 'Coolblue products processed!' });
});

app.get('/api/bol', async c => {
  for (const product of BOL_PRODUCTS) {
    console.log('Processing product in /api/bol route:', product);
    const bolApi = new BolApi();
    await bolApi.fetchInventory(product.url, c.env as Env);
  }
  return c.json({ message: 'Bol.com products processed!' });
});

export default app;
