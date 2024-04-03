export type contractAddress = {
  [key: number]: `0x${string}`
}

export const WR_token_address: contractAddress = {
  11155420: "0xB91578Ff19d4ec6754a1103fEBfE095bF668191b"
}

export const SL_token_address: contractAddress = {
  11155420: "0xd26CC5E66b5BaE0412D89Eb8ddDF54b9A7afe600"
}

export const WR_strategy_address: contractAddress = {
  11155420: "0x1623841962bCB856C44Ac55Ef1D1C3c3354F56Ac"
}

export const SL_strategy_address: contractAddress = {
  11155420: "0x8Cc5377b8384F210170901c5EAb6C8a257f02316"
}

export const WR_pool_id: { [key: number]: number } = {
  11155420: 1
}

export const SL_pool_id: { [key: number]: number } = {
  11155420: 0
}
