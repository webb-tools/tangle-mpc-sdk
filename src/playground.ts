import { Keyring } from "@polkadot/keyring";
import { BN, BN_ZERO } from "@polkadot/util";
import { cryptoWaitReady } from "@polkadot/util-crypto";

import { createProfile } from "./roles";
import { Role, SERVICE_TYPE_TO_TANGLE_MAP } from "./roles/types";

(async () => {
  try {
    await cryptoWaitReady();

    const keyring = new Keyring({ type: "sr25519" });
    const alice = keyring.addFromUri("//Alice");

    // Create a profile for Alice
    // createProfile successful (can check the event in Polkadot Dashboard)
    // but the transaction is not finalized so no hash is returned
    const hash1 = await createProfile(
      alice,
      {
        Shared: {
          records: [
            {
              role: SERVICE_TYPE_TO_TANGLE_MAP[Role.TSS_DFNS_CGGMP21SECP256K1],
              amount: BN_ZERO,
            },
          ],
          amount: new BN("10000000000000000000"),
        },
      },
      10,
    );

    console.log(`Alice's profile creation transaction hash: ${hash1}`);

    // const bob = keyring.addFromUri("//Bob");

    // // Create a profile for Alice
    // const hash2 = await createProfile(
    //   bob,
    //   {
    //     Independent: {
    //       records: [
    //         {
    //           role: SERVICE_TYPE_TO_TANGLE_MAP[Role.TSS_DFNS_CGGMP21SECP256K1],
    //           amount: new BN("10000000000000000000"),
    //         },
    //         {
    //           role: SERVICE_TYPE_TO_TANGLE_MAP[Role.TSS_DFNS_CGGMP21SECP256R1],
    //           amount: new BN("10000000000000000000"),
    //         },
    //       ],
    //     },
    //   },
    //   10
    // );
    // console.log(`Bob's profile creation transaction hash: ${hash2}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
