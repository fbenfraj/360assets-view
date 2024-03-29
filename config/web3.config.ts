import dotenv from 'dotenv';

dotenv.config();

const WEB3_CONFIG: Web3Config = {
  eth: {
    rpcEndpoint: process.env.ETH_RPC_ENDPOINT,
    tokenListSource:
      'https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/ethereum.json',
    addedTokens: [
      '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      '0xc00e94Cb662C3520282E6f5717214004A7f26888',
      '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC',
      '0xD31a59c85aE9D8edEFeC411D448f90841571b89c',
      '0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5',
      '0xCC4304A31d09258b0029eA7FE63d032f52e44EFe',
      '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      '0x9B99CcA871Be05119B2012fd4474731dd653FEBe',
      '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
      '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      '0x72F020f8f3E8fd9382705723Cd26380f8D0c66Bb',
      '0x72E5390EDb7727E3d4e3436451DADafF675dBCC0',
      '0x6fC13EACE26590B80cCCAB1ba5d51890577D83B2',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      '0x607F4C5BB672230e8672085532f7e901544a7375',
      '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
      '0x5C406D99E04B8494dc253FCc52943Ef82bcA7D75',
      '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
      '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
      '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
      '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
      '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
      '0x06F3C323f0238c72BF35011071f2b5B7F43A054c',
    ],
  },
  poly: {
    rpcEndpoint: process.env.POLY_RPC_ENDPOINT,
    tokenListSource:
      'https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/polygon.json',
    addedTokens: [
      '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    ],
  },
  arb: {
    rpcEndpoint: process.env.ARB_RPC_ENDPOINT,
    tokenListSource:
      'https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/arbitrum.json',
    addedTokens: [
      '0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868',
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
      '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    ],
  },
};

export { WEB3_CONFIG };
