import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Token: p.createTable({
    id: p.hex(),
    name: p.string(),
    symbol: p.string(),
    decimals: p.int(),
    poolTokens: p.many("PoolToken.tokenId"),
  }),
  Pool: p.createTable({
    id: p.bigint(),
    strategyId: p.hex().references("Strategy.id"),
    strategy: p.one("strategyId"),
    poolTokens: p.many("PoolToken.poolId"),
    tokens: p.hex().list(),
    reserves: p.float().list(),
    reservesWad: p.bigint().list(),
    liquidity: p.float(),
    liquidityWad: p.bigint(),
    liquidityTokenSupply: p.float(),
    liquidityTokenSupplyWad: p.bigint(),
    lpToken: p.hex(),
    name: p.string(),
    positions: p.many("Position.poolId"),
    initTimestamp: p.bigint(),
  }),
  Swap: p.createTable({
    id: p.hex(),
    poolId: p.bigint().references("Pool.id"),
    pool: p.one("poolId"),
    sender: p.hex(),
    amountIn: p.float(),
    amountInWad: p.bigint(),
    amountOut: p.float(),
    amountOutWad: p.bigint(),
    tokenIn: p.hex(),
    tokenOut: p.hex(),
    timestamp: p.bigint(),
    block: p.bigint(),
  }),
  Allocate: p.createTable({
    id: p.hex(),
    poolId: p.bigint().references("Pool.id"),
    pool: p.one("poolId"),
    sender: p.hex(),
    deltas: p.float().list(),
    deltasWad: p.bigint().list(),
    deltaLiquidity: p.float(),
    deltaLiquidityWad: p.bigint(),
    timestamp: p.bigint(),
    block: p.bigint()
  }),
  Deallocate: p.createTable({
    id: p.hex(),
    poolId: p.bigint().references("Pool.id"),
    pool: p.one("poolId"),
    sender: p.hex(),
    deltas: p.float().list().optional(),
    deltasWad: p.bigint().list().optional(),
    deltaLiquidity: p.float(),
    deltaLiquidityWad: p.bigint(),
    timestamp: p.bigint(),
    block: p.bigint()
  }),
  PoolToken: p.createTable({
    id: p.string(),
    tokenId: p.hex().references("Token.id"),
    poolId: p.bigint().references("Pool.id"),
    token: p.one("tokenId"),
    pool: p.one("poolId"),
  }),
  Strategy: p.createTable({
    id: p.hex(),
    name: p.string(),
    pools: p.many("Pool.strategyId"),
  }),
  Position: p.createTable({
    id: p.hex(),
    liquidity: p.float(),
    liquidityWad: p.bigint(),
    accountId: p.hex().references("Account.id"),
    account: p.one("accountId"),
    poolId: p.bigint().references("Pool.id"),
    pool: p.one("poolId"),
  }),
  Account: p.createTable({
    id: p.hex(),
    positions: p.many("Position.accountId"),
    swapPoints: p.bigint(),
    wrPoints: p.bigint(),
    slPoints: p.bigint(),
    pointsTotal: p.bigint(),
  }),
  ConstantSumParams: p.createTable({
    id: p.bigint(),
    poolId: p.bigint().references("Pool.id"),
    pool: p.one("poolId"),
    swapFee: p.bigint(),
    controller: p.hex(),
    lastComputedPrice: p.float(),
    lastComputedPriceWad: p.bigint(),
    priceUpdatePerSecond: p.float(),
    priceUpdatePerSecondWad: p.bigint(),
    priceUpdateEnd: p.int(),
    lastPriceUpdate: p.int(),
  }),
  GeometricMeanParams: p.createTable({
    id: p.bigint(),
    poolId: p.bigint().references("Pool.id"),
    pool: p.one("poolId"),
    swapFee: p.bigint(),
    controller: p.hex(),
    lastComputedWeightX: p.bigint(),
    weightXUpdatePerSecond: p.bigint(),
    weightXUpdateEnd: p.int(),
    lastWeightXUpdate: p.int(),
  }),
  NTokenGeometricMeanParams: p.createTable({
    id: p.bigint(),
    poolId: p.bigint().references("Pool.id"),
    pool: p.one("poolId"),
    swapFee: p.bigint(),
    controller: p.hex(),
    lastComputedWeights: p.bigint().list(),
    weightsUpdatePerSecond: p.bigint().list(),
    weightsUpdateEnd: p.int(),
    lastWeightsUpdate: p.int(),
  }),
  LogNormalParams: p.createTable({
    id: p.bigint(),
    poolId: p.bigint().references("Pool.id"),
    pool: p.one("poolId"),
    swapFee: p.bigint(),
    controller: p.hex(),
    lastComputedMean: p.bigint(),
    lastComputedWidth: p.bigint(),
    meanUpdatePerSecond: p.bigint(),
    widthUpdatePerSecond: p.bigint(),
    meanUpdateEnd: p.int(),
    widthUpdateEnd: p.int(),
    lastMeanUpdate: p.int(),
    lastWidthUpdate: p.int(),
  }),
  SYCoveredCallParams: p.createTable({
    id: p.bigint(),
    poolId: p.bigint().references("Pool.id"),
    pool: p.one("poolId"),
    swapFee: p.bigint(),
    controller: p.hex(),
    lastTimestamp: p.bigint(),
    mean: p.bigint(),
    width: p.bigint(),
    expiry: p.bigint(),
    syTokenId: p.hex().references("SYToken.id"),
    syToken: p.one("syTokenId"),
    ptTokenId: p.hex().references("PTToken.id"),
    ptToken: p.one("ptTokenId"),
    ytTokenId: p.hex().references("YTToken.id"),
    ytToken: p.one("ytTokenId")
  }),
  SYToken: p.createTable({
    id: p.hex(),
    tokenId: p.hex().references("Token.id"),
    token: p.one("tokenId"),
    initialExchangeRate: p.bigint(),
    exchangeRate: p.bigint(),
  }),
  PTToken: p.createTable({
    id: p.hex(),
    tokenId: p.hex().references("Token.id"),
    token: p.one("tokenId"),
  }),
  YTToken: p.createTable({
    id: p.hex(),
    tokenId: p.hex().references("Token.id"), 
    token: p.one("tokenId"),
    redeemableInterest: p.bigint(),
  })
}));
