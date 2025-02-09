export async function saveStockStatus(env: Env, storeKey: string, newStatus: Record<string, string>): Promise<void> {
  const oldStatus = await getStockStatus(env, storeKey);
  if (JSON.stringify(oldStatus) !== JSON.stringify(newStatus)) {
    await env.NVIDIA_FE_KV.put(storeKey, JSON.stringify(newStatus));
  }
}

export async function getStockStatus(env: Env, storeKey: string): Promise<Record<string, string>> {
  const status = await env.NVIDIA_FE_KV.get(storeKey);
  return status ? JSON.parse(status) : {};
}