import { ApiPromise, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'

import submitJob from './submitJob'

// TODO: Setup a test environment with a local node
const ENDPOINT = 'ws://127.0.0.1:9944'

describe('submitJob()', () => {
  let api: ApiPromise

  beforeAll(async () => {
    const provider = new WsProvider(ENDPOINT)
    api = await ApiPromise.create({ provider, noInitWarn: true })
  })

  test('should submit a job and return the job id', async () => {
    await api.isReadyOrError

    // Initialize keyring for sr25519 type
    const sr25519Keyring = new Keyring({ type: 'sr25519' })

    // Define Alice and Bob's identities and role seeds
    const ALICE = sr25519Keyring.addFromUri('//Alice')
    const BOB = sr25519Keyring.addFromUri('//Bob')

    // Transaction to create a profile for Alice
    const creatingProfileTx = api.tx.roles.createProfile(
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
          amount: '10000000000000000000',
        },
      },
      10
    )

    // Sign and send the transaction for creating Alice's profile
    await new Promise(resolve => {
      let unsub: () => void | undefined

      creatingProfileTx
        .signAndSend(ALICE, async ({ status }) => {
          if (status.isInBlock) {
            unsub?.()
            resolve(0)
          }
        })
        .then(unsubscrive => {
          unsub = unsubscrive
        })
    })

    // Sign and send the transaction for creating Bob's profile
    await new Promise(resolve => {
      let unsub: () => void | undefined

      creatingProfileTx
        .signAndSend(BOB, async ({ status }) => {
          if (status.isInBlock) {
            unsub?.()
            resolve(0)
          }
        })
        .then(unsubscribe => {
          unsub = unsubscribe
        })
    })

    // Get the job id
    const expectedJobId = await api.query.jobs.nextJobId()

    const expiry = 100
    const ttl = 100

    const jobType = {
      DkgtssPhaseOne: {
        participants: [ALICE.address, BOB.address],
        threshold: 1,
        permittedCaller: null,
        roleType: 'DfnsCGGMP21Secp256k1' as const,
      },
    }

    const { jobId, jobDetails, roleType } = await submitJob(
      api,
      ALICE,
      expiry,
      ttl,
      jobType,
      'Destroy'
    )

    expect(expectedJobId.eq(jobId)).toBe(true)
    expect(roleType.isTss).toBe(true)
    expect(roleType.asTss.isDfnsCGGMP21Secp256k1).toBe(true)

    expect(jobDetails.expiry.eq(ttl)).toBe(true)
    expect(jobDetails.ttl.eq(ttl)).toBe(true)
    expect(jobDetails.jobType.isDkgtssPhaseOne).toBe(true)
    expect(jobDetails.fallback.isDestroy).toBe(true)
  }, 50000)

  afterAll(async () => {
    await api.disconnect()
  })
})
