import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import type { Option } from "@polkadot/types";
import type { PalletRolesRestakingLedger } from "@polkadot/types/lookup";
import { expect } from "chai";

import submitJob from "./submitJob";

// TODO: Setup a test environment with a local node
const ENDPOINT = "ws://127.0.0.1:9944";

describe("submitJob()", () => {
  let api: ApiPromise;

  before(async () => {
    const provider = new WsProvider(ENDPOINT);
    api = await ApiPromise.create({ provider, noInitWarn: true });
  });

  test("should submit a job and return the job id", async () => {
    await api.isReadyOrError;

    // Initialize keyring for sr25519 type
    const sr25519Keyring = new Keyring({ type: "sr25519" });

    // Define Alice and Bob's identities and role seeds
    const ALICE = sr25519Keyring.addFromUri("//Alice");
    const BOB = sr25519Keyring.addFromUri("//Bob");

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
          amount: "10000000000000000000",
        },
      },
      10,
    );

    const [aliceLedger, bobLedger] = await api.queryMulti<
      [Option<PalletRolesRestakingLedger>, Option<PalletRolesRestakingLedger>]
    >([
      [api.query.roles.ledger, ALICE.address],
      [api.query.roles.ledger, BOB.address],
    ]);

    // Sign and send the transaction for creating Alice's profile if it doesn't exist
    if (aliceLedger.isNone) {
      await new Promise((resolve) => {
        let unsub: () => void | undefined;

        creatingProfileTx
          .signAndSend(ALICE, async ({ status }) => {
            if (status.isInBlock) {
              unsub?.();
              resolve(0);
            }
          })
          .then((unsubscrive) => {
            unsub = unsubscrive;
          });
      });
    }

    // Sign and send the transaction for creating Bob's profile if it doesn't exist
    if (bobLedger.isNone) {
      await new Promise((resolve) => {
        let unsub: () => void | undefined;

        creatingProfileTx
          .signAndSend(BOB, async ({ status }) => {
            if (status.isInBlock) {
              unsub?.();
              resolve(0);
            }
          })
          .then((unsubscribe) => {
            unsub = unsubscribe;
          });
      });
    }

    // Get the job id
    const expectedJobId = await api.query.jobs.nextJobId();

    const expiry = 100;
    const ttl = 100;

    const jobType = {
      DkgtssPhaseOne: {
        participants: [ALICE.address, BOB.address],
        threshold: 1,
        permittedCaller: null,
        roleType: "DfnsCGGMP21Secp256k1" as const,
      },
    };

    const { jobId, jobDetails, roleType } = await submitJob(
      api,
      ALICE,
      expiry,
      ttl,
      jobType,
      "Destroy",
    );

    expect(expectedJobId.eq(jobId)).to.be.true;
    expect(roleType.isTss).to.be.true;
    expect(roleType.asTss.isDfnsCGGMP21Secp256k1).to.be.true;

    expect(jobDetails.expiry.eq(ttl)).to.be.true;
    expect(jobDetails.ttl.eq(ttl)).to.be.true;
    expect(jobDetails.jobType.isDkgtssPhaseOne).to.be.true;
    expect(jobDetails.fallback.isDestroy).to.be.true;
  });

  after(async () => {
    await api.disconnect();
  });
});
