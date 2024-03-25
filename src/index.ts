import { ponder } from "@/generated";
import {
  formatEther,
  decodeAbiParameters,
  parseEther,
  decodeFunctionData,
  parseAbiParameters,
} from "viem";
import { SL_token_address, SL_pool_id, WR_pool_id } from "./constants";
import { ethWeiToPoints } from "./utils";
import { G3MNAbi } from "../abis/G3MN";
import { ERC20Abi } from "../abis/ERC20Abi";
import { DFMMAbi } from "../abis/DFMMAbi";
import { csInitParams } from "./types";

ponder.on("DFMM:Swap", async ({ event, context }) => {
  const { Account } = context.db;
  const chainId = context.network.chainId as number;
  const poolId = event.args.poolId as unknown as number;

  // Waiting Room ETH->Superliquid Swap Points
  if (
    poolId === WR_pool_id[chainId] &&
    event.args.tokenIn === SL_token_address[context.network.chainId]
  ) {
    const swapPoints = ethWeiToPoints(event.args.outputAmount, 5); // swap from ETH->SL is 5x the points of holding LP tokens over 1 hour per ETH
    await Account.upsert({
      id: event.args.account,
      create: {
        swapPoints,
        wrPoints: BigInt(0),
        slPoints: BigInt(0),
        pointsTotal: swapPoints,
      },
      update: ({ current }) => ({
        swapPoints: ethWeiToPoints(event.args.outputAmount, 5),
        pointsTotal: current.wrPoints + current.slPoints + swapPoints,
      }),
    });
  }
});
/*
ponder.on("DFMM:Allocate", async ({ event, context }) => {
  const { Position, Pool, Account, Period } = context.db;
  const chainId = context.network.chainId as number;
  const poolId = event.args.poolId as unknown as number;

  if (poolId === WR_pool_id[chainId]) {
  } else if (poolId === SL_pool_id[chainId]) {
  }
});

ponder.on("DFMM:Deallocate", async ({ event, context }) => {
  const { Position, Pool, Account, Period } = context.db;
  const chainId = context.network.chainId as number;
  const poolId = event.args.poolId as unknown as number;

  if (poolId === WR_pool_id[chainId]) {
  } else if (poolId === SL_pool_id[chainId]) {
  }
});
*/

ponder.on("DFMM:Init", async ({ event, context }) => {
  const { Token, Pool, PoolToken, Strategy, ConstantSumParams } = context.db;

  const poolId = event.args.poolId;
  const name = await context.client.readContract({
    abi: G3MNAbi,
    address: event.args.strategy,
    functionName: "name",
  });

  const strategy = await Strategy.findUnique({ id: event.args.strategy });

  if (strategy === null) {
    await Strategy.create({
      id: event.args.strategy,
      data: {
        name,
      },
    });
  }

  const { args } = decodeFunctionData({
    abi: DFMMAbi,
    data: event.transaction.input,
  });

  const calldata = args?.[0] as any;

  await Pool.create({
    id: poolId,
    data: {
      strategyId: event.args.strategy,
      name: calldata?.name,
      reserves: event.args.reserves.concat(),
      tokens: calldata.tokens,
      liquidity: event.args.totalLiquidity,
      lpToken: event.args.lpToken,
      initTimestamp: event.block.timestamp,
    },
  });

  await Promise.all(
    calldata.tokens.map(async (token) => {
      const tk = await Token.findUnique({ id: token });
      if (tk === null) {
        const results = await context.client.multicall({
          contracts: [
            { address: token, abi: ERC20Abi, functionName: "name" },
            { address: token, abi: ERC20Abi, functionName: "symbol" },
            { address: token, abi: ERC20Abi, functionName: "decimals" },
          ],
        });
        await Token.create({
          id: token,
          data: {
            name: results[0].result!,
            symbol: results[1].result!,
            decimals: results[2].result!,
          },
        });
      }
      await PoolToken.create({
        id: poolId.toString().concat(token),
        data: { poolId: poolId, tokenId: token },
      });
    })
  );

  const pool = await Pool.findUnique({ id: poolId });
  console.log(pool);

  const data = calldata?.data as any;

  if (name === "ConstantSum") {
    const csData = decodeAbiParameters(csInitParams, data);
    const params = csData[2] as any;
    const price = params.price as bigint;

    await ConstantSumParams.create({
      id: poolId,
      data: {
        poolId: poolId,
        lastComputedPrice: price,
        priceUpdatePerSecond: 0n,
        priceUpdateEnd: 0,
        lastPriceUpdate: 0,
      },
    });
  }
});
