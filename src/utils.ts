import { SubmittableExtrinsic } from "@polkadot/api/types";
import { KeyringPair } from "@polkadot/keyring/types";
import type { ISubmittableResult } from "@polkadot/types/types";
import type { HexString } from "@polkadot/util/types";

export const getTxPromise = async (
  keyringPair: KeyringPair,
  tx: SubmittableExtrinsic<"promise", ISubmittableResult>,
): Promise<HexString> => {
  return new Promise((resolve, reject) => {
    tx.signAndSend(
      keyringPair,
      {
        // when sending multiple transactions in quick succession (see batching above), there may be transactions in the pool that has the same nonce
        // override the nonce, following the Polkadotjs doc: https://polkadot.js.org/docs/api/cookbook/tx#how-do-i-take-the-pending-tx-pool-into-account-in-my-nonce
        nonce: -1,
      },
      ({ status, dispatchError, events }) => {
        console.log("status :", status.isInBlock, status.isFinalized);
        if (status.isInBlock || status.isFinalized) {
          for (const event of events) {
            const {
              event: { method },
            } = event;

            if (dispatchError && method === "ExtrinsicFailed") {
              let message: string = dispatchError.type;

              if (dispatchError.isModule) {
                try {
                  const mod = dispatchError.asModule;
                  const error = dispatchError.registry.findMetaError(mod);

                  message = `${error.section}.${error.name}`;
                } catch (error) {
                  console.error(error);
                  reject(message);
                }
              } else if (dispatchError.isToken) {
                message = `${dispatchError.type}.${dispatchError.asToken.type}`;
              }

              reject(message);
              // TODO: Tx status is never finalized, so the function will never resolve
            } else if (method === "ExtrinsicSuccess" && status.isFinalized) {
              resolve(status.asFinalized.toHex());
            }
          }
        }
      },
    );
  });
};
