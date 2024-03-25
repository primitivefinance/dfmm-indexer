import { createConfig } from "@ponder/core"
import { http } from "viem"

import { DFMMAbi } from "./abis/DFMMAbi"
import { G3MNAbi } from "./abis/G3MN"
import { SL_strategy_address } from "./src/constants"

export default createConfig({
  networks: {
    optimismSepolia: {
      chainId: 11155420,
      transport: http(process.env.PONDER_RPC_URL_11155420),
      maxRequestsPerSecond: 1
    },
  },
  contracts: {
    DFMM: {
      maxBlockRange: 1000,
      abi: DFMMAbi,
      network: {
        optimismSepolia: {
          address: "0xB3277bF4D66eAde935e468Cf0EE1a9DED8EAEc4D",
          startBlock: 9663187,
        },
      },
    },
    G3MN: {
      maxBlockRange: 1000,
      abi: G3MNAbi,
      network: {
        optimismSepolia: {
          address: SL_strategy_address[111555420],
          startBlock: 9665692
        }
      }
    }
  },
})
