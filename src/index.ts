import { Hono } from 'hono';
import { NvidiaApi } from './util/api/nvidia/NvidiaApi';
import { CoolblueApi } from './util/api/coolblue/CoolblueApi';
import { BolApi } from './util/api/bol/BolApi';
import { AlternateApi } from './util/api/alternate/AlternateApi';
import { NVIDIA_STORES, COOLBLUE_PRODUCTS, BOL_PRODUCTS, ALTERNATE_STORE } from './util/const';

const app = new Hono();

(app as any).scheduled = async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
  console.log('Scheduled function triggered with event:', event, 'env:', env, 'ctx:', ctx);

  const nvidiaApi = new NvidiaApi(env);
  await nvidiaApi.initializeStockStatus();
  for (const store of NVIDIA_STORES) {
    await nvidiaApi.fetchInventory(store);
  }
  await nvidiaApi.saveStockStatus();

  const coolblueApi = new CoolblueApi(env);
  await coolblueApi.initializeStockStatus();
  for (const product of COOLBLUE_PRODUCTS) {
    await coolblueApi.fetchInventory(product.url);
  }
  await coolblueApi.saveStockStatus();

  const bolApi = new BolApi(env);
  await bolApi.initializeStockStatus();
  for (const product of BOL_PRODUCTS) {
    await bolApi.fetchInventory(product.url);
  }
  await bolApi.saveStockStatus();

  const alternateApi = new AlternateApi(env);
  await alternateApi.initializeStockStatus();
  for (const product of ALTERNATE_STORE) {
    await alternateApi.fetchInventory(product.url);
  }
  await alternateApi.saveStockStatus();
};

app.get('/', c => {
  return c.text('Hello Hono!');
});

app.get('/health', c => {
  return c.text('OK');
});

app.get('/api/test', async c => {
  const nvidiaApi = new NvidiaApi(c.env as Env);
  await nvidiaApi.initializeStockStatus();
  for (const store of NVIDIA_STORES) {
    console.log('Processing store in /api/test route:', store);
    await nvidiaApi.fetchInventory(store);
  }
  await nvidiaApi.saveStockStatus();

  const coolblueApi = new CoolblueApi(c.env as Env);
  await coolblueApi.initializeStockStatus();
  for (const product of COOLBLUE_PRODUCTS) {
    console.log('Processing product in /api/test route:', product);
    await coolblueApi.fetchInventory(product.url);
  }
  await coolblueApi.saveStockStatus();

  const bolApi = new BolApi(c.env as Env);
  await bolApi.initializeStockStatus();
  for (const product of BOL_PRODUCTS) {
    console.log('Processing product in /api/test route:', product);
    await bolApi.fetchInventory(product.url);
  }
  await bolApi.saveStockStatus();

  const alternateApi = new AlternateApi(c.env as Env);
  await alternateApi.initializeStockStatus();
  for (const product of ALTERNATE_STORE) {
    console.log('Processing product in /api/test route:', product);
    await alternateApi.fetchInventory(product.url);
  }
  await alternateApi.saveStockStatus();

  return c.json({ message: 'Hello World!' });
});

app.get('/api/sku', async c => {
  const store = NVIDIA_STORES[0]; // Assuming you want to fetch SKU for the first store
  console.log('Processing store in /api/sku route:', store);
  const nvidiaApi = new NvidiaApi(c.env as Env);
  await nvidiaApi.initializeStockStatus();
  const inventory = await nvidiaApi.fetchInventory(store);
  await nvidiaApi.saveStockStatus();
  return c.json({ inventory });
});

app.get('/api/coolblue', async c => {
  const coolblueApi = new CoolblueApi(c.env as Env);
  await coolblueApi.initializeStockStatus();
  for (const product of COOLBLUE_PRODUCTS) {
    console.log('Processing product in /api/coolblue route:', product);
    await coolblueApi.fetchInventory(product.url);
  }
  await coolblueApi.saveStockStatus();
  return c.json({ message: 'Coolblue products processed!' });
});

app.get('/api/bol', async c => {
  const bolApi = new BolApi(c.env as Env);
  await bolApi.initializeStockStatus();
  for (const product of BOL_PRODUCTS) {
    console.log('Processing product in /api/bol route:', product);
    await bolApi.fetchInventory(product.url);
  }
  await bolApi.saveStockStatus();
  return c.json({ message: 'Bol.com products processed!' });
});

app.get('/api/alternate', async c => {
  const alternateApi = new AlternateApi(c.env as Env);
  await alternateApi.initializeStockStatus();
  for (const product of ALTERNATE_STORE) {
    console.log('Processing product in /api/alternate route:', product);
    await alternateApi.fetchInventory(product.url);
  }
  await alternateApi.saveStockStatus();
  return c.json({ message: 'Alternate products processed!' });
});

export default app;
