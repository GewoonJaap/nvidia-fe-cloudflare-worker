export async function saveStockStatus(env: Env, key: string, status: string): Promise<void> {
  await env.NVIDIA_FE_KV.put(key, status);
}

export async function getStockStatus(env: Env, key: string): Promise<string | null> {
  return await env.NVIDIA_FE_KV.get(key);
}
