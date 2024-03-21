import type {
  TanglePrimitivesJobsJobSubmission,
  TanglePrimitivesRolesRoleType,
  TanglePrimitivesRolesTssThresholdSignatureRoleType,
  TanglePrimitivesRolesZksaasZeroKnowledgeRoleType,
} from '@polkadot/types/lookup'

export type ZksaasHyperData =
  | {
      Raw: Uint8Array
    }
  | {
      Url: Uint8Array
    }
  | {
      Http: Uint8Array
    }

export type ZksaasGroth16System = {
  Groth16: {
    circuit: ZksaasHyperData
    numInputs: number
    numConstraints: number
    provingKey: ZksaasHyperData
    verifyingKey: Uint8Array
    wasm: ZksaasHyperData
  }
}

export type ZkSaasSystem = ZksaasGroth16System

export type ZksaasGroth16ProveRequest = {
  Groth16: {
    readonly publicInput: Uint8Array
    readonly aShares: Array<ZksaasHyperData>
    readonly axShares: Array<ZksaasHyperData>
    readonly qapShares: Array<{
      a: ZksaasHyperData
      b: ZksaasHyperData
      c: ZksaasHyperData
    }>
  }
}

export type ZkSaaSPhaseTwoRequest = ZksaasGroth16ProveRequest

export type DkgTssPhaseOne = {
  DkgtssPhaseOne: {
    participants: Array<string>
    threshold: number
    permittedCaller: string | null
    roleType: TanglePrimitivesRolesTssThresholdSignatureRoleType['type']
  }
}

export type DkgTssPhaseTwo = {
  DkgtssPhaseTwo: {
    phaseOneId: number
    submission: Uint8Array
    derivationPath: Uint8Array | null
    roleType: TanglePrimitivesRolesTssThresholdSignatureRoleType['type']
  }
}

export type DkgTssPhaseThree = {
  DkgtssPhaseThree: {
    phaseOneId: number
    roleType: TanglePrimitivesRolesTssThresholdSignatureRoleType['type']
  }
}

export type DkgTssPhaseFour = {
  DkgtssPhaseFour: {
    phaseOneId: number
    newPhaseOneId: number
    roleType: TanglePrimitivesRolesTssThresholdSignatureRoleType['type']
  }
}

export type ZkSaaSPhaseOne = {
  ZkSaaSPhaseOne: {
    participants: Array<string>
    permittedCaller: string | null
    system: ZkSaasSystem
    roleType: TanglePrimitivesRolesZksaasZeroKnowledgeRoleType['type']
  }
}

export type ZkSaaSPhaseTwo = {
  ZkSaaSPhaseTwo: {
    phaseOneId: number
    request: ZkSaaSPhaseTwoRequest
    roleType: TanglePrimitivesRolesZksaasZeroKnowledgeRoleType['type']
  }
}

/**
 * Simple the `TanglePrimitivesJobsJobType` type from the Tangle Primitives
 */
export type JobType =
  | DkgTssPhaseOne
  | DkgTssPhaseTwo
  | DkgTssPhaseThree
  | DkgTssPhaseFour
  | ZkSaaSPhaseOne
  | ZkSaaSPhaseTwo

export type FallbackOptions =
  | 'Destroy'
  | {
      RegenerateWithThreshold: number
    }

export type SubmitJobResult = {
  jobId: number
  roleType: TanglePrimitivesRolesRoleType
  jobDetails: TanglePrimitivesJobsJobSubmission
}
