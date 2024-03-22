import { keccak256, concat, toHex } from 'viem'

export function computePositionId(pool: bigint, account: `0x${string}`): `0x${string}` {
  return keccak256(concat([account, toHex(pool)]));
}

export function ethWeiToPoints(wei: bigint, multiplier: number): bigint {
  return (wei / BigInt(10000)) * BigInt(multiplier)
}