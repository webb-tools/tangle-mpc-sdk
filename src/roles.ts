import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";

import { getTangleApi } from "./api";

// TODO: add comments
export async function createProfile(keyRingPair: KeyringPair) {
  // TODO: add try catch
  const api = await getTangleApi();

  const createProfileTx = api.tx.roles.createProfile("Independent", 2);

  // TODO: handle events
  const hash = await createProfileTx.signAndSend(keyRingPair);

  return hash;
}

export async function createSharedProfile() {
  const api = await getTangleApi();

  const sr25519Keyring = new Keyring({ type: "sr25519" });
  const ALICE = sr25519Keyring.addFromUri("//Alice");

  const createSharedProfileTx = api.tx.roles.createProfile(
    {
      Shared: {
        records: [
          {
            role: {
              Tss: {
                DfnsCGGMP21Secp256k1: {},
              },
            },
          },
        ],
        amount: "10_000_000_000_000_000_000",
      },
    },
    10
  );

  // TODO: handle events
  const hash = await createSharedProfileTx.signAndSend(ALICE);

  return hash;
}
