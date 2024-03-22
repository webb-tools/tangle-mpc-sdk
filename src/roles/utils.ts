import {
  TanglePrimitivesRolesRoleType,
  TanglePrimitivesRolesTssThresholdSignatureRoleType,
  TanglePrimitivesRolesZksaasZeroKnowledgeRoleType,
} from "@polkadot/types/lookup";

import { BN, Profile, Role } from "../types";

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
const SERVICE_TYPE_TO_TANGLE_MAP = {
  [Role.LIGHT_CLIENT_RELAYING]: "LightClientRelaying",
  [Role.ZK_SAAS_GROTH16]: { ZkSaaS: "ZkSaaSGroth16" },
  [Role.ZK_SAAS_MARLIN]: { ZkSaaS: "ZkSaaSMarlin" },
  [Role.TSS_SILENT_SHARD_DKLS23SECP256K1]: {
    Tss: "SilentShardDKLS23Secp256k1",
  },
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

type ValidProfileParam =
  | {
      Independent: {
        records: {
          role: (typeof SERVICE_TYPE_TO_TANGLE_MAP)[Role];
          amount: BN;
        }[];
      };
    }
  | {
      Shared: {
        records: {
          role: (typeof SERVICE_TYPE_TO_TANGLE_MAP)[Role];
        }[];
        amount: BN;
      };
    };

export function convertToValidApiParam(profile: Profile): ValidProfileParam {
  if ("Independent" in profile) {
    return {
      Independent: {
        records: profile.Independent.records.map((record) => ({
          role: SERVICE_TYPE_TO_TANGLE_MAP[record.role],
          amount: record.amount,
        })),
      },
    };
  } else {
    return {
      Shared: {
        records: profile.Shared.records.map((record) => ({
          role: SERVICE_TYPE_TO_TANGLE_MAP[record.role],
        })),
        amount: profile.Shared.amount,
      },
    };
  }
}
