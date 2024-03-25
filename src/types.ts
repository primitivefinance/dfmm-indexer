export const csInitParams = [
  { type: 'uint256[]' },
  { type: 'uint256' },
  {
    type: 'tuple',
    components: [
      { type: 'uint256', name: 'price' },
      { type: 'uint256', name: 'swapFee' },
      { type: 'address', name: 'controller' },
    ],
    name: 'ConstantSumParams',
  },
];


