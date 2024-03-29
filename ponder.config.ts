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
          address: "0x20876BA9A79fBfD0841BDC71F310f7Ca3C813221",
          startBlock: 9841600,
        },
      },
    },
  },
});
