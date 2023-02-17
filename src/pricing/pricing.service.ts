import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PricingService {
  constructor(private readonly httpService: HttpService) {}

  async addUSDValues(balances) {
    // get tokenlist from coingecko api
    const tokenList = (
      await this.httpService.axiosRef.get(
        `https://api.coingecko.com/api/v3/coins/list?include_platform=false`,
      )
    ).data;

    const balanceNames = balances.map((balance) => balance.name);

    // get ids of added tokens
    const addedTokenIds = tokenList
      .filter((token) => balanceNames.includes(token.name))
      .map((token) => token.id);

    const idMapping = tokenList
      .filter((token) => balanceNames.includes(token.name))
      .reduce((acc, token) => {
        acc[token.name] = token.id;
        return acc;
      }, {});

    const joinedTokenIds = addedTokenIds.join('%2C');

    // get usd prices of added tokens
    const addedTokenPrices = (
      await this.httpService.axiosRef.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${joinedTokenIds}&vs_currencies=usd`,
      )
    ).data;

    const usdPricings = {};

    for (const name in idMapping) {
      const id = idMapping[name];
      usdPricings[name] = addedTokenPrices[id].usd;
    }

    // add usd price to each item in balances using usdPricings object
    const balancesWithUSD = balances.map((balance) => {
      return {
        ...balance,
        balanceUsd: parseFloat(
          (
            (usdPricings[balance.name] as number) * (balance.balance as number)
          ).toFixed(2),
        ),
      };
    });

    return balancesWithUSD;
  }
}
