import "@webb-tools/tangle-substrate-types/build/interfaces/augment-types";

import { ApiPromise, WsProvider } from "@polkadot/api";

import { TANGLE_RPC_ENDPOINT } from "./constants";

const apiPromiseCache = new Map<string, Promise<ApiPromise>>();

export async function getTangleApi(
  endpoint = TANGLE_RPC_ENDPOINT
): Promise<ApiPromise> {
  const possiblyCachedInstance = apiPromiseCache.get(endpoint);

  if (possiblyCachedInstance !== undefined) return possiblyCachedInstance;

  const wsProvider = new WsProvider(endpoint);

  const newInstance = ApiPromise.create({
    provider: wsProvider,
    noInitWarn: true,
  });

  apiPromiseCache.set(endpoint, newInstance);

  return newInstance;
}
