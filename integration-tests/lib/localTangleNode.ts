/* eslint-disable import/order */
import "@webb-tools/tangle-substrate-types";

import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ChildProcess, execSync, spawn } from "child_process";

const TANGLE_DOCKER_IMAGE_URL =
  "ghcr.io/webb-tools/tangle/tangle-standalone-integration-tests:main";

export type DockerMode = {
  mode: "docker";
  forcePullImage: boolean;
};

export type HostMode = {
  mode: "host";
  nodePath: string;
};

export type UsageMode = DockerMode | HostMode;

export type LocalNodeOpts = {
  name: string;
  ports:
    | {
        ws: number;
        http: number;
        p2p: number;
      }
    | "auto";
  authority: "alice" | "bob" | "charlie";
  usageMode: UsageMode;
  enableLogging?: boolean;
  isManual?: boolean; // for manual connection to the substrate node using 9944
};

export type SubstrateEvent = {
  section: string;
  method: string;
};

export type TypedEvent = ProfileCreated;

type ProfileCreated = {
  section: "roles";
  method: "ProfileCreadted";
};

export class LocalTangleNode {
  #api: ApiPromise | null = null;
  constructor(
    protected readonly opts: LocalNodeOpts,
    protected readonly proc?: ChildProcess,
  ) {}

  public static async start(opts: LocalNodeOpts): Promise<LocalTangleNode> {
    opts.ports = await this.makePorts(opts);
    // opts.usageMode.mode = 'docker'
    const startArgs: string[] = [];
    if (opts.usageMode.mode === "docker") {
      this.pullImage({
        forcePull: opts.usageMode.forcePullImage,
        image: TANGLE_DOCKER_IMAGE_URL,
      });
      const dockerArgs = [
        "run",
        "--rm",
        "--name",
        `${opts.authority}-node-${opts.ports.ws}`,
        "-p",
        `${opts.ports.ws}:9944`,
        "-p",
        `${opts.ports.http}:9933`,
        "-p",
        `${opts.ports.p2p}:30333`,
        TANGLE_DOCKER_IMAGE_URL,
        "tangle",
        "--tmp",
        "--chain=testnet",
        "--rpc-cors",
        "all",
        "--ws-external",
        "--rpc-methods=unsafe",
        `--${opts.authority}`,
        ...startArgs,
      ];
      const proc = spawn("docker", dockerArgs);
      if (opts.enableLogging) {
        proc.stdout.on("data", (data: Buffer) => {
          console.log(data.toString());
        });
        proc.stderr.on("data", (data: Buffer) => {
          console.error(data.toString());
        });
      }
      return new LocalTangleNode(opts, proc);
    } else {
      startArgs.push(
        "--tmp",
        "--chain=relayer",
        "--rpc-cors",
        "all",
        "--rpc-methods=unsafe",
        "--ws-external",
        `--ws-port=${opts.ports.ws}`,
        `--rpc-port=${opts.ports.http}`,
        `--port=${opts.ports.p2p}`,
        `--${opts.authority}`,
      );
      const proc = spawn(opts.usageMode.nodePath, startArgs);
      if (opts.enableLogging) {
        proc.stdout.on("data", (data: Buffer) => {
          console.log(data.toString());
        });
        proc.stderr.on("data", (data: Buffer) => {
          console.error(data.toString());
        });
      }
      return new LocalTangleNode(opts, proc);
    }
  }

  public get name(): string {
    return this.opts.name;
  }

  public static async makePorts(
    opts: LocalNodeOpts,
  ): Promise<{ ws: number; http: number; p2p: number }> {
    // Dynamic import used for commonjs compatibility
    const getPort = await import("get-port");
    const { portNumbers } = getPort;

    return opts.ports === "auto"
      ? {
          http: await getPort.default({ port: portNumbers(9933, 9999) }),
          p2p: await getPort.default({ port: portNumbers(30333, 30399) }),
          ws: await getPort.default({ port: portNumbers(9944, 9999) }),
        }
      : (opts.ports as { ws: number; http: number; p2p: number });
  }

  public async api(): Promise<ApiPromise> {
    const ports = this.opts.ports as { ws: number; http: number; p2p: number };
    const host = "127.0.0.1";

    if (this.opts.isManual) {
      return await createApiPromise(`ws://${host}:${ports.ws}`);
    }

    if (this.#api) {
      return this.#api;
    }

    this.#api = await createApiPromise(`ws://${host}:${ports.ws}`);

    return this.#api;
  }

  public async stop(): Promise<void> {
    await this.#api?.disconnect();
    this.#api = null;

    if (this.proc) {
      this.proc.kill("SIGINT");
    }
  }

  public async waitForEvent(typedEvent: TypedEvent): Promise<void> {
    const api = await this.api();

    return new Promise<void>((resolve) => {
      api.query.system.events((events) => {
        events.forEach((record) => {
          const { event } = record;
          if (
            event.section === typedEvent.section &&
            event.method === typedEvent.method
          ) {
            resolve();
          }
        });
      });
    });
  }

  public async executeTransaction(
    tx: SubmittableExtrinsic<"promise">,
  ): Promise<string> {
    const api = await this.api();

    return new Promise((resolve, reject) => {
      tx.send(({ dispatchError, status }) => {
        // status would still be set, but in the case of error we can shortcut
        // to just check it (so an error would indicate InBlock or Finalized)
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { docs, name, section } = decoded;

            reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            reject(dispatchError.toString());
          }
        }

        if (status.isFinalized && !dispatchError) {
          resolve(status.asFinalized.toString());
        }
      }).catch((e) => reject(e));
    });
  }

  public async sudoExecuteTransaction(
    tx: SubmittableExtrinsic<"promise">,
  ): Promise<string> {
    const api = await this.api();
    const keyring = new Keyring({ type: "sr25519" });
    const sudoKey = keyring.addFromUri("//Alice");
    const sudoCall = api.tx.sudo.sudo(tx);
    return new Promise((resolve, reject) => {
      sudoCall
        .signAndSend(sudoKey, { nonce: -1 }, ({ dispatchError, status }) => {
          // status would still be set, but in the case of error we can shortcut
          // to just check it (so an error would indicate InBlock or Finalized)
          if (dispatchError) {
            if (dispatchError.isModule) {
              // for module errors, we have the section indexed, lookup
              const decoded = api.registry.findMetaError(
                dispatchError.asModule,
              );
              const { docs, name, section } = decoded;

              reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
            } else {
              // Other, CannotLookup, BadOrigin, no extra info
              reject(dispatchError.toString());
            }
          }

          if (status.isFinalized && !dispatchError) {
            resolve(status.asFinalized.toString());
          }
        })
        .catch((e) => reject(e));
    });
  }

  protected static checkIfImageExists(image: string): boolean {
    const result = execSync("docker images", { encoding: "utf8" });

    return result.includes(image);
  }

  protected static pullImage(opts: {
    forcePull: boolean;
    image: string;
  }): void {
    if (!this.checkIfImageExists(opts.image) || opts.forcePull) {
      execSync(`docker pull ${opts.image}`, {
        encoding: "utf8",
      });
    }
  }
}

export async function createApiPromise(endpoint: string) {
  const provider = new WsProvider(endpoint);
  return ApiPromise.create({ provider });
}
