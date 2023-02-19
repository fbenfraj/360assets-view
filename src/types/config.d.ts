type NetworkData = {
  rpcEndpoint: string;
  tokenListSource: string;
  addedTokens: string[];
};

type Web3Config = {
  [network_key: string]: NetworkData;
};
