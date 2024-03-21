import type { ApiPromise } from '@polkadot/api'
import { AddressOrPair } from '@polkadot/api/types'
import type { TanglePrimitivesJobsJobSubmission } from '@polkadot/types/lookup'

import type { FallbackOptions, JobType, SubmitJobResult } from './types'

async function submitJob(
  api: ApiPromise,
  account: AddressOrPair,
  expiry: number,
  ttl: number,
  jobType: JobType,
  fallback: FallbackOptions
): Promise<SubmitJobResult> {
  const arg = api.createType<TanglePrimitivesJobsJobSubmission>(
    'TanglePrimitivesJobsJobSubmission',
    {
      expiry,
      ttl,
      jobType,
      fallback,
    }
  )

  const tx = api.tx.jobs.submitJob(arg)

  return await new Promise(resolve => {
    let unsub: () => void | undefined

    tx.signAndSend(account, async ({ events = [], status }) => {
      if (!status.isInBlock) {
        return
      }

      events.forEach(({ event }) => {
        if (!api.events.jobs.JobSubmitted.is(event)) {
          return
        }

        const jobId = event.data.jobId.toNumber()
        const roleType = event.data.roleType
        const jobDetails = event.data.details

        unsub?.()
        resolve({
          jobId,
          roleType,
          jobDetails,
        })
      })
    }).then(unsubscribe => {
      unsub = unsubscribe
    })
  })
}

export default submitJob
