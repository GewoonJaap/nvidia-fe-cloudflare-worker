import { Hono } from 'hono';
import { NvidiaApi } from './util/api/nvidia/NvidiaApi';
import { CoolblueApi } from './util/api/coolblue/CoolblueApi';
import { BolApi } from './util/api/bol/BolApi';
import { StockApi } from './types/StockApiTypes';
import { MindfactoryApi } from './util/api/mindfactory/MindfactoryApi';
import { AlternateApi } from './util/api/alternate/AlternateApi';

const app = new Hono();

async function checkAllStores(env: Env) {
  const stockApis: StockApi[] = [new NvidiaApi(env), new CoolblueApi(env), new BolApi(env), new AlternateApi(env), new MindfactoryApi(env)];

  for (const stockApi of stockApis) {
    try {
      await stockApi.scanForStock();
    } catch (ex: unknown) {
      console.warn(`Failled getting stock...`);
    }
  }
}

(app as any).scheduled = async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
  console.log('Scheduled function triggered with event:', event, 'env:', env, 'ctx:', ctx);
  await checkAllStores(env);
};

app.get('/', c => {
  return c.text('Hello Hono!');
});

app.get('/health', c => {
  return c.text('OK');
});

app.get('/api/test', async c => {
  await checkAllStores(c.env as Env);
  return c.json({ message: 'Hello World!' });
});

export default app;
