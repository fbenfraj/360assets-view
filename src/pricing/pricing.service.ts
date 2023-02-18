import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Adds USD values to an array of Balance objects
   * @param balances An array of Balance objects
   * @returns An array of Balance objects with the balanceUsd property added to each object
   */
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

  /**
   * Retrieves the list of tokens from Coingecko API.
   *
   * @returns A promise of the list of tokens.
   * @throws HttpException when the token list retrieval fails.
   */
  getTokenList = async (): Promise<CoingeckoToken[]> => {
    try {
      return this.httpService.axiosRef
        .get(
          `https://api.coingecko.com/api/v3/coins/list?include_platform=false`,
        )
        .then((response) => response.data);
    } catch (error) {
      const errorMessage = `Failed to retrieve token list from Coingecko`;
      this.logger.error(error, errorMessage);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };

  /**
   * Filters the given token list by the tokens with matching names
   *
   * @param tokenList - The list of tokens to be filtered
   * @param addedTokens - The list of token names to be matched against
   * @returns - The filtered list of tokens
   */
  filterTokenList(
    tokenList: CoingeckoToken[],
    addedTokens: string[],
  ): CoingeckoToken[] {
    return tokenList.filter((token) => addedTokens.includes(token.name));
  }

  /**
   * Maps token names to their corresponding Coingecko IDs.
   * @param {CoingeckoToken[]} tokenList - The token list to map from.
   * @param {string[]} addedTokens - The names of the tokens to map.
   * @returns {IdMapping} An object that maps token names to their corresponding Coingecko IDs.
   */

  mapIdsToNames(tokenList: CoingeckoToken[], addedTokens: string[]): IdMapping {
    return tokenList
      .filter((token) => addedTokens.includes(token.name))
      .reduce((acc, token) => {
        acc[token.name] = token.id;
        return acc;
      }, {});
  }

  /**
   * Retrieve the USD pricing for given token IDs
   * @param tokenIds An array of token IDs to retrieve prices for
   * @param idMapping A mapping of token names to IDs
   * @returns An object containing the USD pricing of the requested tokens
   * @throws {HttpException} If there is an error retrieving the token prices from Coingecko
   */
  getTokenPrices = async (
    tokenIds: string[],
    idMapping: IdMapping,
  ): Promise<TokenPrices> => {
    try {
      const usdPricings: TokenPrices = {};
      const joinedTokenIds: string = tokenIds.join('%2C');

      let addedTokenPrices: CoingeckoPrices = await this.cacheManager.get(
        joinedTokenIds,
      );

      if (!addedTokenPrices) {
        addedTokenPrices = (
          await this.httpService.axiosRef.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${joinedTokenIds}&vs_currencies=usd`,
          )
        ).data;

        await this.cacheManager.set(joinedTokenIds, addedTokenPrices);
      }

      for (const name in idMapping) {
        const id: string = idMapping[name];

        usdPricings[name] = addedTokenPrices[id].usd;
      }

      return usdPricings;
    } catch (error) {
      const errorMessage = `Failed to retrieve token prices from Coingecko`;
      this.logger.error(error, errorMessage);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };

  /**
   * Calculates the balance in USD for a given token balance and USD pricing.
   *
   * @param balance The balance object.
   * @param usdPricings The token prices in USD.
   * @returns The balance in USD.
   */
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
