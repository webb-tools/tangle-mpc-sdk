import { BN } from "@polkadot/util";

export { BN };

export enum Role {
  ZK_SAAS_GROTH16 = "ZkSaaS (Groth16)",
  ZK_SAAS_MARLIN = "ZkSaaS (Marlin)",
  LIGHT_CLIENT_RELAYING = "Light Client Relaying",
  TSS_ZENGOGG20SECP256K1 = "TSS ZengoGG20Secp256k1",
  TSS_DFNS_CGGMP21SECP256K1 = "TSS DfnsCGGMP21Secp256k1",
  TSS_DFNS_CGGMP21SECP256R1 = "TSS DfnsCGGMP21Secp256r1",
  TSS_DFNS_CGGMP21STARK = "TSS DfnsCGGMP21Stark",
  TSS_ZCASH_FROST_P256 = "TSS ZcashFrostP256",
  TSS_ZCASH_FROST_P384 = "TSS ZcashFrostP384",
  TSS_ZCASH_FROST_SECP256K1 = "TSS ZcashFrostSecp256k1",
  TSS_ZCASH_FROST_RISTRETTO255 = "TSS ZcashFrostRistretto255",
  TSS_ZCASH_FROST_ED25519 = "TSS ZcashFrostEd25519",
  TSS_GENNARO_DKG_BLS381 = "TSS GennaroDKGBls381",
  TSS_ZCASH_FROST_ED448 = "TSS ZcashFrostEd448",
}

export type Profile =
  | {
      Independent: {
        records: {
          role: Role;
          amount: BN;
        }[];
      };
    }
  | {
      Shared: {
        records: {
          role: Role;
        }[];
        amount: BN;
      };
    };
