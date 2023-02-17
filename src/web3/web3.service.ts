import { Logger, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TOKEN_LISTS, ADDED_TOKENS } from '../../config/token-lists';
import { HttpService } from '@nestjs/axios';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';

@Injectable()
export class Web3Service {
  private web3Instance: Web3;
  private readonly logger = new Logger(Web3Service.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.web3Instance = new Web3(
      this.configService.get<string>('WEB3_RPC_ENDPOINT'),
    );
  }

  /**
   * Returns a list of balances for the given wallet on the specified network.
   * @param network - The blockchain network to query.
   * @param wallet - The wallet address to get the balances for.
   * @returns A list of balances for the given wallet on the specified network.
   * @throws HttpException if an error occurs while retrieving token list, token amounts or formatting the content.
   */
  async getWalletContent(network: string, wallet: string): Promise<Balance[]> {
    const tokenList: ChainToken[] = await this.getTokens(network);
    const filteredTokenList: ChainToken[] = this.filterTokenList(tokenList);

    const amounts: any[] = await this.getAmounts(filteredTokenList, wallet);
    const content: Balance[] = await this.formatContent(
      filteredTokenList,
      amounts,
    );

    return content;
  }

  /**
   * Retrieves a list of tokens for a specified blockchain network.
   * @param chain - The name of the blockchain network for which to retrieve the token list.
   * @returns A Promise resolving to an array of ChainToken objects representing the token list for the specified blockchain network.
   * @throws HttpException if the request to retrieve the token list fails.
   */
  async getTokens(chain: string): Promise<ChainToken[]> {
    try {
      const tokenSource: string = TOKEN_LISTS[chain];
      return (await this.httpService.axiosRef.get(tokenSource)).data;
    } catch (error) {
      const errorMessage = `Failed to retrieve token list for ${chain}`;
      this.logger.error(error, errorMessage);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Converts a string value to a number by dividing it by 10^decimals
   * @param value - The value to convert to number
   * @param decimals - The number of decimals to divide the value by (default: 18)
   * @returns A number representing the value divided by 10^decimals
   */
  convertToNumber(value: string, decimals = 18): number {
    return parseInt(value) / 10 ** decimals;
  }

  /**
   * Filters a list of ChainToken objects to only include tokens with addresses
   * present in the ADDED_TOKENS array.
   * @param tokenList - The list of ChainToken objects to filter
   * @returns An array of ChainToken objects with addresses present in the ADDED_TOKENS array
   */
  filterTokenList(tokenList: ChainToken[]): ChainToken[] {
    const filteredTokenList: ChainToken[] = tokenList.filter(
      (token: ChainToken) => {
        return ADDED_TOKENS.includes(token.address);
      },
    );

    return filteredTokenList;
  }

  /**
   * Retrieve the ERC20 ABI from a remote source.
   * @returns {Promise<AbiItem>} A promise that resolves to the ERC20 ABI.
   * @throws {HttpException} Throws an exception if the ERC20 ABI could not be retrieved.
   */
  async getERC20ABI(): Promise<AbiItem> {
    try {
      return (
        await this.httpService.axiosRef.get(
          'https://gist.githubusercontent.com/veox/8800debbf56e24718f9f483e1e40c35c/raw/f853187315486225002ba56e5283c1dba0556e6f/erc20.abi.json',
        )
      ).data;
    } catch (error) {
      const errorMessage = 'Failed to retrieve ERC20 ABI';
      this.logger.error(error, errorMessage);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Gets the amounts of ERC20 tokens in a given wallet.
   * @param filteredTokenList - The list of ERC20 tokens to check the balance of.
   * @param wallet - The wallet to check the balances of.
   * @returns An array of numbers representing the amounts of each ERC20 token in the wallet.
   * @throws HttpException with 500 status code if the amounts could not be retrieved.
   */
  async getAmounts(
    filteredTokenList: ChainToken[],
    wallet: string,
  ): Promise<number[]> {
    try {
      // any is used here because of balanceOf() definition in ERC20 ABI
      const proms: Promise<any>[] = [];
      const ERC20_ABI: AbiItem = await this.getERC20ABI();

      for (const token of filteredTokenList) {
        const contract: Contract = new this.web3Instance.eth.Contract(
          ERC20_ABI,
          token.address,
        );
        proms.push(contract.methods.balanceOf(wallet));
      }

      // any is used here because of balanceOf() definition in ERC20 ABI
      const promiseResults: any[] = await Promise.all(proms);

      return promiseResults;
    } catch (error) {
      const errorMessage = `Failed to retrieve amounts for ${wallet}`;
      this.logger.error(error, errorMessage);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Formats the wallet content by converting the balances from their raw form to the user-friendly form and mapping them to Balance object.
   * @param filteredTokenList The list of token details filtered for this network
   * @param amounts The raw amounts of the filtered tokens in the wallet
   * @returns A list of the formatted wallet balances mapped to the Balance object
   * @throws HttpException with status code 500 if the formatting fails
   */
  async formatContent(
    filteredTokenList: ChainToken[],
    amounts: any[],
  ): Promise<Balance[]> {
    try {
      const content: Balance[] = [];

      for (let index = 0; index < filteredTokenList.length; index++) {
        // any is used here because of balanceOf() definition in ERC20 ABI
        const balance: string = await (amounts[index] as any).call();

        const formattedBalance: number = this.convertToNumber(
          balance,
          filteredTokenList[index].decimals,
        );

        content.push({
          address: filteredTokenList[index].address,
          name: filteredTokenList[index].name,
          symbol: filteredTokenList[index].symbol,
          decimals: filteredTokenList[index].decimals,
          balance: formattedBalance,
        });
      }

      return content;
    } catch (error) {
      const errorMessage = 'Failed to format wallet content';
      this.logger.error(error, errorMessage);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
