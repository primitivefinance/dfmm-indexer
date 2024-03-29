import { createConfig } from "@ponder/core";
import { http } from "viem";

import { DFMMAbi } from "./abis/DFMMAbi";
import { G3MNAbi } from "./abis/G3MN";
import { SL_strategy_address } from "./src/constants";

export default createConfig({
  networks: {
    optimismSepolia: {
      chainId: 11155420,
      transport: webSocket(process.env.PONDER_RPC_URL_11155420),
      maxRequestsPerSecond: 1,
    },
  },
  contracts: {
    DFMM: {
      maxBlockRange: 500,
      abi: DFMMAbi,
      network: {
        optimismSepolia: {
          address: "0x20876BA9A79fBfD0841BDC71F310f7Ca3C813221",
          startBlock: 9841600,
        },
      },
    },
  },
});
