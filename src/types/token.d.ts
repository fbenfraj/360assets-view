type CoingeckoToken = {
  id: string;
  symbol: string;
  name: string;
};

type TokenPrices = {
  [key: string]: number;
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
