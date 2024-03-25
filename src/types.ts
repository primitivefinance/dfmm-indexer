export const csInitParams = [
  { type: "uint256[]" },
  { type: "uint256" },
  {
    type: "tuple",
    components: [
      { type: "uint256", name: "price" },
      { type: "uint256", name: "swapFee" },
      { type: "address", name: "controller" },
    ],
    name: "ConstantSumParams",
  },
];

export const nTokenG3mInitParams = [
  { type: "uint256[]" },
  { type: "uint256" },
  { type: "uint256[]" },
  { type: "uint256" },
  { type: "address" },
];

export const lnInitParams = [
  { type: "uint256[]" },
  { type: "uint256" },
  {
    type: "tuple",
    components: [
      { type: "uint256", name: "mean" },
      { type: "uint256", name: "width" },
      { type: "uint256", name: "swapFee" },
      { type: "address", name: "controller" },
    ],
    name: "LogNormalParams",
  },
];

