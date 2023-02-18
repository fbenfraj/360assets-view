type CoingeckoToken = {
  id: string;
  symbol: string;
  name: string;
};

type CoingeckoPrices = {
  [tokenId: string]: {
    usd: number;
  };
};

type TokenPrices = {
  [key: string]: number;
};

type TokenListSources = {
  [networkName: string]: string;
};

type AddedTokensList = {
  [networkName: string]: string[];
};

type IdMapping = {
  [key: string]: string;
};

type ChainToken = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  chainId: number;
  logoURI: string;
  coingeckoId: string;
  listedIn: string[];
};
