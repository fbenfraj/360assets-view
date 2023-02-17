import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PricingService {
  constructor(private readonly httpService: HttpService) {}

  async addUsdValues(balances: Balance[]): Promise<Balance[]> {
    const balanceNames: string[] = balances.map(
      (balance: Balance) => balance.name,
    );
    const tokenList: CoingeckoToken[] = await this.getTokenList();
    const filteredTokenList: CoingeckoToken[] = this.filterTokenList(
      tokenList,
      balanceNames,
    );
    const addedTokenIds: string[] = filteredTokenList.map(
      (token: CoingeckoToken) => token.id,
    );
    const idMapping: IdMapping = this.mapIdsToNames(
      filteredTokenList,
      balanceNames,
    );
    const usdPricings: TokenPrices = await this.getTokenPrices(
      addedTokenIds,
      idMapping,
    );

    const balancesWithUSD: Balance[] = balances.map((balance) => {
      return {
        ...balance,
        balanceUsd: this.calculateBalanceUsd(balance, usdPricings),
      };
    });

    return balancesWithUSD;
  }

  getTokenList = async (): Promise<CoingeckoToken[]> =>
    this.httpService.axiosRef
      .get(`https://api.coingecko.com/api/v3/coins/list?include_platform=false`)
      .then((response) => response.data);

  filterTokenList(
    tokenList: CoingeckoToken[],
    addedTokens: string[],
  ): CoingeckoToken[] {
    return tokenList.filter((token) => addedTokens.includes(token.name));
  }

  mapIdsToNames(tokenList: CoingeckoToken[], addedTokens: string[]): IdMapping {
    return tokenList
      .filter((token) => addedTokens.includes(token.name))
      .reduce((acc, token) => {
        acc[token.name] = token.id;
        return acc;
      }, {});
  }

  getTokenPrices = async (
    tokenIds: string[],
    idMapping: IdMapping,
  ): Promise<TokenPrices> => {
    const usdPricings: TokenPrices = {};
    const joinedTokenIds = tokenIds.join('%2C');
    const addedTokenPrices = (
      await this.httpService.axiosRef.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${joinedTokenIds}&vs_currencies=usd`,
      )
    ).data;

    for (const name in idMapping) {
      const id: string = idMapping[name];

      usdPricings[name] = addedTokenPrices[id].usd;
    }

    return usdPricings;
  };

  calculateBalanceUsd = (
    balance: Balance,
    usdPricings: TokenPrices,
  ): number => {
    const name: string = balance.name;
    const unitPrice: number = usdPricings[name] || 0;
    const amount: number = balance.balance;
    const result: string = (unitPrice * amount).toFixed(2);

    return parseFloat(result);
  };
}
