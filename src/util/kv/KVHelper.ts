export async function saveStockStatus(env: Env, storeKey: string, status: Record<string, string>): Promise<void> {
  await env.NVIDIA_FE_KV.put(storeKey, JSON.stringify(status));
}

export async function getStockStatus(env: Env, storeKey: string): Promise<Record<string, string>> {
  const status = await env.NVIDIA_FE_KV.get(storeKey);
  return status ? JSON.parse(status) : {};
}
