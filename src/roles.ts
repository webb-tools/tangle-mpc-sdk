import { Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { u128 } from "@polkadot/types";

import { getTangleApiPromise } from "./api";

export async function createProfile(keyRingPair: KeyringPair) {
  const api = await getTangleApiPromise();
  //   const registry = api.registry;

  const nominators = await api.query.staking.nominators.entries();

  // const nextJobId = await api.query.jobs.nextJobId();

  //   const creatingProfileTx = api.tx.roles.createProfile({
  //     Shared: {
  //       records: [
  //         {
  //           role: {
  //             Tss: {
  //               DfnsCGGMP21Secp256k1: {},
  //             },
  //           },
  //         },
  //       ],
  //       amount: new u128(registry, 100),
  //     },
  //   });
}
