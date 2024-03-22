import { createConfig } from "@ponder/core"
import { http } from "viem"

import { DFMMAbi } from "./abis/DFMMAbi"

export default createConfig({
  networks: {
    optimismSepolia: {
      chainId: 11155420,
      transport: http(process.env.PONDER_RPC_URL_11155420),
    },
  },
  contracts: {
    DFMM: {
      abi: DFMMAbi,
      network: {
        optimismSepolia: {
          address: "0xB3277bF4D66eAde935e468Cf0EE1a9DED8EAEc4D",
          startBlock: 9663187,
        },
      },
    },
  },
})