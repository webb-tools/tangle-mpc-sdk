import { KeyringPair } from "@polkadot/keyring/types";

class Account {
  keyRingPair: KeyringPair;

  constructor(keyRingPair: KeyringPair) {
    this.keyRingPair = keyRingPair;
  }

  // create Profile
  async createProfile() {
    // return await createProfile(this.keyRingPair);
  }

  // delete Profile

  // update Profile
}

export default Account;
