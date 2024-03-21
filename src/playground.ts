import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";

import Account from "./account";
import { BN, Role } from "./types";

(async () => {
  try {
    await cryptoWaitReady();

    const keyring = new Keyring({ type: "sr25519" });
    const aliceKeyRing = keyring.addFromUri("//Alice");

    const alice = new Account(aliceKeyRing);

    // Create a profile for Alice
    const hash1 = await alice.createProfile(
      {
        Shared: {
          records: [
            {
              role: Role.TSS_DFNS_CGGMP21SECP256K1,
            },
          ],
          amount: new BN("10000000000000000000"),
        },
      },
      10,
    );

    console.log(`Alice's profile creation transaction hash: ${hash1}`);

    // Update Alice's profile
    const hash2 = await alice.updateProfile({
      Independent: {
        records: [
          {
            role: Role.TSS_DFNS_CGGMP21SECP256K1,
            amount: new BN("10000000000000000000"),
          },
          {
            role: Role.TSS_DFNS_CGGMP21SECP256R1,
            amount: new BN("10000000000000000000"),
          },
        ],
      },
    });

    console.log(`Alice's profile update transaction hash: ${hash2}`);

    // Delete Alice's profile
    const hash3 = await alice.deleteProfile();

    console.log(`Alice's profile deletion transaction hash: ${hash3}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
