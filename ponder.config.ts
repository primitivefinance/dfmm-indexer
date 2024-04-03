import { createConfig } from "@ponder/core";

import { http } from "viem";

import { DFMMAbi } from "./abis/DFMMAbi";

export default createConfig({
  networks: {
    optimismSepolia: {
      chainId: 11155420,
      transport:  http(process.env.PONDER_RPC_URL_11155420),
    }
  },
  contracts: {
    DFMM: {
      maxBlockRange: 500,
      abi: DFMMAbi,
      network: {
        optimismSepolia: {
          address: "0x2aD77BEb56d7b1875B7bbB4cC29A7061afeF613b",
          startBlock: 10182090,
        },
      },
    },
  },
});
