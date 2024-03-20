import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";

import { createProfile } from "./roles";

async function playground() {
  try {
    await cryptoWaitReady();

    // Initialize keyring for sr25519 type
    const keyring = new Keyring({ type: "sr25519" });

    // Add Alice to our keyring with a hard-derivation path (empty phrase, so uses dev)
    const alice = keyring.addFromUri("//Alice");

    // Create a profile for Alice
    const hash = await createProfile(
      alice,
      {
        Independent: [],
      },
      2,
    );

    console.log(`Profile creation transaction hash: ${hash}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

playground();
