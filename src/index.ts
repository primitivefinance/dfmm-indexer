import { ponder } from '@/generated'
import { formatEther, decodeAbiParameters, parseEther } from 'viem'
import { SL_pool_id, WR_pool_id } from './constants'
import { ethWeiToPoints } from './utils';

ponder.on('DFMM:Swap', async ({ event, context}) => {
  const { Position, Pool, Period, Account } = context.db
  const chainId = context.network.chainId as number
  const poolId = event.args.poolId as unknown as number

  if (event.args.isSwapXForY) {
    await Pool.update({
      id: event.args.poolId,
      data: ({ current }) => ({
        reserveX: parseFloat(current.reserveX.toString()) + parseFloat(formatEther(event.args.inputAmount)),
        reserveXWad: current.reserveXWad + event.args.inputAmount,
        reserveYWad: current.reserveYWad - event.args.outputAmount,
        reserveY: parseFloat(current.reserveY.toString()) - parseFloat(formatEther(event.args.outputAmount)),
      }),
    })
  } else {
    await Pool.update({
      id: event.args.poolId,
      data: ({ current }) => ({
        reserveX: parseFloat(current.reserveX.toString()) - parseFloat(formatEther(event.args.outputAmount)),
        reserveXWad: current.reserveXWad - event.args.outputAmount,
        reserveYWad: current.reserveYWad + event.args.inputAmount,
        reserveY: parseFloat(current.reserveY.toString()) + parseFloat(formatEther(event.args.inputAmount)),
      }),
    })
  }

  // Waiting Room ETH->Superliquid Swap Points
  if (poolId === WR_pool_id[chainId] && event.args.isSwapXForY) {
    const swapPoints = ethWeiToPoints(event.args.outputAmount, 5) // swap from ETH->SL is 5x the points of holding LP tokens over 1 hour per ETH
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
        pointsTotal: current.wrPoints + current.slPoints + swapPoints
      })
    })
  }
})


ponder.on('DFMM:Allocate', async ({event, context}) => {
  
})