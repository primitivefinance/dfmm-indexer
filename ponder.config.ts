import { createConfig } from "@ponder/core";
import { http } from "viem";

import { DFMMAbi } from "./abis/DFMMAbi";
import { G3MNAbi } from "./abis/G3MN";
import { SL_strategy_address } from "./src/constants";

export default createConfig({
  networks: {
    optimismSepolia: {
      chainId: 11155420,
      transport: http(process.env.PONDER_RPC_URL_11155420),
      maxRequestsPerSecond: 1,
    },
  },
  contracts: {
    DFMM: {
      maxBlockRange: 1000,
      abi: DFMMAbi,
      network: {
        optimismSepolia: {
          address: "0x46d0266d3Feb0E65b7c7a9F8aE7A6C3E44216205",
          startBlock: 9802863,
        },
      },
    },
    G3MN: {
      maxBlockRange: 1000,
      abi: G3MNAbi,
      network: {
        optimismSepolia: {
          address: SL_strategy_address[111555420],
          startBlock: 9665692,
        },
      },
    },
  },
});
