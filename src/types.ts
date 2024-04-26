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

export const geometricMeanInitParams = [
  { type: "uint256" },
  { type: "uint256" },
  { type: "uint256" },
  { type: "uint256" },
  { type: "uint256" },
  { type: "address" },
];

export const SYCCInitParams = [
  { type: "uint256[]" },
  { type: "uint256" },
  {
    type: "tuple",
    components: [
      { type: "uint256", name: "mean" },
      { type: "uint256", name: "width" },
      { type: "uint256", name: "maturity" },
      { type: "uint256", name: "swapFee" },
      { type: "address", name: "controller" },
      { type: "uint256", name: "lastTimestamp" },
      { type: "uint256", name: "lastImpliedPrice" },
      { type: "tuple", components: [
        { type: "address", name: "address"}
      ], name: "SY" },
      { type: "tuple", components: [
        { type: "address", name: "address" }
      ], name: "PT" },
      { type: "tuple", components: [
       { type: "address", name: "address"} 
      ], name: "YT" }
    ] 
  }
]
