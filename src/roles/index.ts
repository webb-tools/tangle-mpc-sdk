import { KeyringPair } from "@polkadot/keyring/types";

import { getTangleApi } from "../api";
import { getTxPromise } from "../utils";
import type { Profile } from "./types";

// TODO: add comments
export async function createProfile(
  keyRingPair: KeyringPair,
  profile: Profile,
  maxActiveServices: number | null,
) {
  // TODO: add try catch
  const api = await getTangleApi();

  const createProfileTx = api.tx.roles.createProfile(
    profile,
    maxActiveServices,
  );

  return getTxPromise(keyRingPair, createProfileTx);
}
