import { ponder } from '@/generated'
import { formatEther, decodeAbiParameters, parseEther } from 'viem'
import { SL_token_address, SL_pool_id, WR_pool_id } from './constants'
import { ethWeiToPoints } from './utils'
import { G3MNAbi } from '../abis/G3MN'
import { ERC20Abi } from '../abis/ERC20Abi'

ponder.on('DFMM:Swap', async ({ event, context}) => {
  const { Account } = context.db
  const chainId = context.network.chainId as number
  const poolId = event.args.poolId as unknown as number

  // Waiting Room ETH->Superliquid Swap Points
  if (poolId === WR_pool_id[chainId] && event.args.tokenIn === SL_token_address[context.network.chainId]) {
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
  const { Position, Pool, Account, Period } = context.db
  const chainId = context.network.chainId as number
  const poolId = event.args.poolId as unknown as number

  if (poolId === WR_pool_id[chainId]) {

  } else if (poolId === SL_pool_id[chainId]) {

  }
})

ponder.on('DFMM:Deallocate', async ({ event, context }) => {
  const { Position, Pool, Account, Period } = context.db
  const chainId = context.network.chainId as number
  const poolId = event.args.poolId as unknown as number

  if (poolId === WR_pool_id[chainId]) {

  } else if (poolId === SL_pool_id[chainId]) {

  }
})

ponder.on('DFMM:Init', async ({event, context}) => {
  const { Account, Token, TokenIndex, Strategy } = context.db

  const account = await Account.findUnique({ id: event.args.account })

  if (account === null) {
    await Account.create({ 
      id: event.args.account,
      data: {
        swapPoints: BigInt(0),
        wrPoints: BigInt(0),
        slPoints: BigInt(0),
        pointsTotal: BigInt(0),
      }
    })
  }

  // Handling Superliquid 
  const strategy = await Strategy.findUnique({ id: event.args.strategy })

  if (strategy === null) {
    const name = await context.client.readContract({ abi: G3MNAbi, address: event.args.strategy, functionName: 'name' })
    
    await Strategy.create({
      id: event.args.strategy,
      data: {
        name,
      },
    })
  }
  let tokenList = event.args.tokens.concat() // readonly error, concat() workaround

  await Promise.all(tokenList.map(async (token) => {
    const tk = await Token.findUnique({ id: token })
    if (tk === null) {
      const results = await context.client.multicall({
        contracts: [
          { address: token, abi: ERC20Abi, functionName: 'name'},
          { address: token, abi: ERC20Abi, functionName: 'symbol'},
          { address: token, abi: ERC20Abi, functionName: 'decimals'},
        ]
      })
      await Token.create({
        id: token,
        data: {
          name: results[0].result!,
          symbol: results[1].result!,
          decimals: results[2].result!,
        },
      })
    }
  })).then( async () => {
    await TokenIndex.create({
      id: event.args.lpToken,
      data: { tokens: tokenList }, 
    })
  })


  // Handling Waiting Room
})