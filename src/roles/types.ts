import {
  TanglePrimitivesRolesRoleType,
  TanglePrimitivesRolesTssThresholdSignatureRoleType,
  TanglePrimitivesRolesZksaasZeroKnowledgeRoleType,
} from "@polkadot/types/lookup";
import { BN } from "@polkadot/util";

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

type TangleRoleMapping = {
  // By using `Extract`, the name is linked to the Substrate types,
  // so that if the name changes in the future, it will cause a static
  // type error here, and we can update the mapping accordingly.
  [key in Role]:
    | Extract<TanglePrimitivesRolesRoleType["type"], "LightClientRelaying">
    | {
        Tss: TanglePrimitivesRolesTssThresholdSignatureRoleType["type"];
      }
    | {
        ZkSaaS: TanglePrimitivesRolesZksaasZeroKnowledgeRoleType["type"];
      };
};

/**
 * The values are based off [Tangle's `RoleType` enum](https://github.com/webb-tools/tangle/blob/2a60f0382db2a1234c490766381872d2c7243f5e/primitives/src/roles/mod.rs#L40).
 */
export const SERVICE_TYPE_TO_TANGLE_MAP = {
  [Role.LIGHT_CLIENT_RELAYING]: "LightClientRelaying",
  [Role.ZK_SAAS_GROTH16]: { ZkSaaS: "ZkSaaSGroth16" },
  [Role.ZK_SAAS_MARLIN]: { ZkSaaS: "ZkSaaSMarlin" },
  [Role.TSS_ZENGOGG20SECP256K1]: { Tss: "ZengoGG20Secp256k1" },
  [Role.TSS_DFNS_CGGMP21SECP256K1]: { Tss: "DfnsCGGMP21Secp256k1" },
  [Role.TSS_DFNS_CGGMP21SECP256R1]: { Tss: "DfnsCGGMP21Secp256r1" },
  [Role.TSS_DFNS_CGGMP21STARK]: { Tss: "DfnsCGGMP21Stark" },
  [Role.TSS_ZCASH_FROST_P256]: { Tss: "ZcashFrostP256" },
  [Role.TSS_ZCASH_FROST_P384]: { Tss: "ZcashFrostP384" },
  [Role.TSS_ZCASH_FROST_SECP256K1]: { Tss: "ZcashFrostSecp256k1" },
  [Role.TSS_ZCASH_FROST_RISTRETTO255]: {
    Tss: "ZcashFrostRistretto255",
  },
  [Role.TSS_ZCASH_FROST_ED25519]: { Tss: "ZcashFrostEd25519" },
  [Role.TSS_GENNARO_DKG_BLS381]: { Tss: "GennaroDKGBls381" },
  [Role.TSS_ZCASH_FROST_ED448]: { Tss: "ZcashFrostEd448" },
} as const satisfies TangleRoleMapping;

export type ProfileRecord = {
  role: (typeof SERVICE_TYPE_TO_TANGLE_MAP)[Role];
  amount: BN;
};

export type Profile =
  | {
      Independent: {
        records: ProfileRecord[];
      };
    }
  | {
      Shared: {
        records: ProfileRecord[];
        amount: BN;
      };
    };
