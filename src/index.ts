import { ponder } from "@/generated";
import {
  formatEther,
  decodeAbiParameters,
  parseEther,
  decodeFunctionData,
  decodeEventLog,
} from "viem";
import { SL_token_address, SL_pool_id, WR_pool_id } from "./constants";
import { computePositionId, ethWeiToPoints } from "./utils";
import { G3MNAbi } from "../abis/G3MN";
import { ERC20Abi } from "../abis/ERC20Abi";
import { DFMMAbi } from '../abis/DFMMAbi';
import {
  csInitParams,
  geometricMeanInitParams,
  lnInitParams,
  nTokenG3mInitParams,
} from "./types";

ponder.on("DFMM:Swap", async ({ event, context }) => {
  const { Account, Swap } = context.db;
  const chainId = context.network.chainId as number;
  const poolId = event.args.poolId as unknown as number;

  await Swap.create({
    id: event.transaction.hash,
    data: {
      poolId: event.args.poolId,
      sender: event.args.account,
      amountIn: parseFloat(formatEther(event.args.inputAmount)),
      amountInWad: event.args.inputAmount,
      amountOut: parseFloat(formatEther(event.args.outputAmount)),
      amountOutWad: event.args.outputAmount,
      tokenIn: event.args.tokenIn,
      tokenOut: event.args.tokenOut,
      timestamp: event.block.timestamp,
      block: event.block.number,
    },
  });

  const swap = await Swap.findUnique({ id: event.transaction.hash });
  console.log(swap);
});

ponder.on("DFMM:Allocate", async ({ event, context }) => {
  const { Allocate, Position, Pool } = context.db;

  const _pool = await Pool.findUnique({id: event.args.poolId})

  const lptSupply = await context.client.readContract({
    abi: ERC20Abi,
    address: _pool.lpToken,
    functionName: "totalSupply",
  })

  await Allocate.create({
    id: event.transaction.hash,
    data: {
      poolId: event.args.poolId,
      sender: event.args.account,
      deltas: event.args.deltas.concat().map((d) => parseFloat(formatEther(d))),
      deltasWad: event.args.deltas,
      deltaLiquidity: parseFloat(formatEther(event.args.deltaL)),
      deltaLiquidityWad: event.args.deltaL,
      timestamp: event.block.timestamp,
      block: event.block.number
    }
  })

  await Pool.update({
    id: event.args.poolId,
    data: ({ current }) => ({
      reserves: current.reserves
        .concat()
        .map((r, i) => r + parseInt(formatEther(event.args.deltas[i] ?? 0n))),
      reservesWad: current.reservesWad
        .concat()
        .map((r, i) => r + (event.args.deltas[i] ?? 0n)),
      liquidityWad: current.liquidityWad + event.args.deltaL,
      liquidity: parseFloat(
        formatEther(current.liquidityWad + event.args.deltaL)
      ),
      liquidityTokenSupply: parseFloat(formatEther(lptSupply)),
      liquidityTokenSupplyWad: lptSupply,
    }),
  });

  await Position.upsert({
    id: computePositionId(event.args.poolId, event.args.account),
    create: {
      liquidityWad: event.args.deltaL,
      liquidity: parseFloat(formatEther(event.args.deltaL)),
      accountId: event.args.account,
      poolId: event.args.poolId,
    },
    update: ({ current }) => ({
      liquidityWad: current.liquidityWad + event.args.deltaL,
      liquidity:
        parseFloat(current.liquidity.toString()) +
        parseFloat(formatEther(event.args.deltaL)),
    }),
  });
});

ponder.on("DFMM:Deallocate", async ({ event, context }) => {
  const { Deallocate, Position, Pool } = context.db;
  const finalDealloc = event.args.deltas.toString().substr(0,2) === '0x' ? true : false
  
  const _pool = await Pool.findUnique({id: event.args.poolId})

  const lptSupply = await context.client.readContract({
    abi: ERC20Abi,
    address: _pool.lpToken,
    functionName: "totalSupply",
  })

  await Deallocate.create({
    id: event.transaction.hash,
    data: {
      poolId: event.args.poolId,
      sender: event.args.account,
      deltas: finalDealloc ? null : event.args.deltas.concat().map((d) => parseFloat(formatEther(d))),
      deltasWad: finalDealloc ? null : event.args.deltas,
      deltaLiquidity: parseFloat(formatEther(event.args.deltaL)),
      deltaLiquidityWad: event.args.deltaL,
      timestamp: event.block.timestamp,
      block: event.block.number
    }
  })

  await Pool.update({
    id: event.args.poolId,
    data: ({ current }) => ({
      reserves: current.reserves
        .concat()
        .map((r, i) => r - parseInt(formatEther(event.args.deltas[i] ?? 0n))),
      liquidityWad: current.liquidityWad - event.args.deltaL,
      liquidity: parseFloat(
        formatEther(current.liquidityWad - event.args.deltaL)
      ),
      liquidityTokenSupply: parseFloat(formatEther(lptSupply)),
      liquidityTokenSupplyWad: lptSupply,
    }),
  });

  await Position.update({
    id: computePositionId(event.args.poolId, event.args.account),
    data: ({ current }) => ({
      liquidityWad: current.liquidityWad - event.args.deltaL,
      liquidity:
        parseFloat(current.liquidity.toString()) -
        parseFloat(formatEther(event.args.deltaL)),
    }),
  });
});

ponder.on("DFMM:Init", async ({ event, context }) => {
  const {
    Token,
    Pool,
    PoolToken,
    Position,
    Strategy,
    ConstantSumParams,
    NTokenGeometricMeanParams,
    LogNormalParams,
    GeometricMeanParams,
  } = context.db;

  const poolId = event.args.poolId;
  console.log("poolId", poolId);
  const name = await context.client.readContract({
    abi: G3MNAbi,
    address: event.args.strategy,
    functionName: "name",
  });

  const lptSupply = await context.client.readContract({
    abi: ERC20Abi,
    address: event.args.lpToken,
    functionName: "totalSupply",
  })

  console.log("NAME:", name);

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
      reserves: event.args.reserves
        .concat()
        .map((r) => parseFloat(formatEther(r))),
      reservesWad: event.args.reserves.concat(),
      tokens: calldata.tokens,
      liquidity: parseFloat(formatEther(event.args.totalLiquidity)),
      liquidityWad: event.args.totalLiquidity,
      lpToken: event.args.lpToken,
      liquidityTokenSupply: parseFloat(formatEther(lptSupply)),
      liquidityTokenSupplyWad: lptSupply,
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

  const data = calldata?.data as any;

  if (name === "ConstantSum") {
    const csData = decodeAbiParameters(csInitParams, data);
    const params = csData[2] as any;
    const price = params.price as bigint;
    const swapFee = params.swapFee;
    const controller = params.controller;

    await ConstantSumParams.create({
      id: poolId,
      data: {
        poolId: poolId,
        swapFee: swapFee,
        controller: controller,
        lastComputedPrice: parseFloat(formatEther(price)),
        lastComputedPriceWad: price,
        priceUpdatePerSecond: 0,
        priceUpdatePerSecondWad: 0n,
        priceUpdateEnd: 0,
        lastPriceUpdate: 0,
      },
    });
    const csp = await ConstantSumParams.findUnique({ id: poolId });
    console.log(csp);
  }

  if (name === "NTokenGeometricMean") {
    const nTokenData = decodeAbiParameters(nTokenG3mInitParams, data);
    const weights = nTokenData[2] as any[];
    const swapFee = nTokenData[3] as any;
    const controller = nTokenData[4] as any;
    const weightUpdatesPerSecond = weights.map((_) => 0n);

    await NTokenGeometricMeanParams.create({
      id: poolId,
      data: {
        poolId: poolId,
        swapFee: swapFee,
        controller: controller,
        lastComputedWeights: weights,
        weightsUpdatePerSecond: weightUpdatesPerSecond,
        weightsUpdateEnd: 0,
        lastWeightsUpdate: 0,
      },
    });

    const ntp = await NTokenGeometricMeanParams.findUnique({ id: poolId });
    console.log(ntp);
  }

  if (name === "LogNormal") {
    const lnData = decodeAbiParameters(lnInitParams, data);
    const params = lnData[2] as any;
    const mean = params.mean;
    const width = params.width;
    const swapFee = params.swapFee;
    const controller = params.controller;

    await LogNormalParams.create({
      id: poolId,
      data: {
        poolId: poolId,
        swapFee: swapFee,
        controller: controller,
        lastComputedMean: mean,
        lastComputedWidth: width,
        meanUpdatePerSecond: 0n,
        widthUpdatePerSecond: 0n,
        meanUpdateEnd: 0,
        widthUpdateEnd: 0,
        lastMeanUpdate: 0,
        lastWidthUpdate: 0,
      },
    });

    const lnp = await LogNormalParams.findUnique({ id: poolId });
    console.log(lnp);
  }

  if (name === "GeometricMean") {
    const gData = decodeAbiParameters(geometricMeanInitParams, data);
    const wx = gData[3] as bigint;
    const swapFee = gData[4] as bigint;
    const controller = gData[5] as any;

    await GeometricMeanParams.create({
      id: poolId,
      data: {
        poolId: poolId,
        swapFee: swapFee,
        controller: controller,
        lastComputedWeightX: wx,
        weightXUpdatePerSecond: 0n,
        weightXUpdateEnd: 0,
        lastWeightXUpdate: 0,
      },
    });

    const gp = await GeometricMeanParams.findUnique({ id: poolId });
    console.log(gp);
  }

  await Position.create({
    id: computePositionId(event.args.poolId, event.args.account),
    data: {
      liquidityWad: event.args.totalLiquidity - 1000n,
      liquidity: parseFloat(formatEther(event.args.totalLiquidity - 1000n)),
      accountId: event.args.account,
      poolId: event.args.poolId,
    },
  });
});
