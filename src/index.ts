import { Hono } from 'hono';
import { NvidiaApi } from './util/api/nvidia/NvidiaApi';
import { NVIDIA_STORES } from './util/const';

const app = new Hono();

(app as any).scheduled = async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
  for (const store of NVIDIA_STORES) {
    const nvidiaApi = new NvidiaApi();
    await nvidiaApi.fetchInventory(store, env);
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
    const nvidiaApi = new NvidiaApi();
    await nvidiaApi.fetchInventory(store, c.env as Env);
  }
  return c.json({ message: 'Hello World!' });
});

app.get('/api/sku', async c => {
  const store = NVIDIA_STORES[0]; // Assuming you want to fetch SKU for the first store
  const nvidiaApi = new NvidiaApi();
  const inventory = await nvidiaApi.fetchInventory(store, c.env as Env);
  const sku = inventory.length > 0 ? inventory[0].fe_sku : 'SKU not found';
  return c.json({ sku });
});

export default app;
