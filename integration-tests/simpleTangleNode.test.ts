/* eslint-disable import/order */

import '@webb-tools/tangle-substrate-types';

import isCi from "is-ci";
import path from "path";

import { LocalTangleNode, UsageMode } from "./lib/localTangleNode";

describe("Substrate SignatureBridge Governor Update", function () {
  // Tangle nodes
  let aliceNode: LocalTangleNode;

  before(async () => {
    const usageMode: UsageMode = isCi
      ? { mode: "docker", forcePullImage: false }
      : {
          mode: "host",
          nodePath: path.resolve(
            "../../tangle/target/release/tangle",
          ),
        };

    // start tangle nodes.
    aliceNode = await LocalTangleNode.start({
      name: "substrate-alice",
      authority: "alice",
      usageMode,
      ports: "auto",
      enableLogging: false,
    });

    
  });

  it("Start tangle node", async () => {
    const api = await aliceNode.api();
    await api.isReady;
    
    const time = await api.query.timestamp.now();
    console.log(`Current time: ${time}`);

    after(async () => {
      await aliceNode?.stop();
    });
  });
});
