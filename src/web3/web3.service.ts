import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Eth } from 'web3-eth';
import { TOKEN_LISTS, ADDED_TOKENS } from '../../config/token-lists';
import { HttpService } from '@nestjs/axios';
import * as Web3 from 'web3';

@Injectable()
export class Web3Service {
  private client: Eth;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.client = new (Web3 as any)(
      this.configService.get<string>('WEB3_RPC_ENDPOINT'),
    ).eth;
  }

  async getTokens(chain: string) {
    try {
      // get token list file URL by chain
      const tokenSource = TOKEN_LISTS[chain];
      // retrieve token list from URL
      const response = await this.httpService.axiosRef.get(tokenSource);

      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to retrieve token list for chain ${chain}`);
    }
  }

  async getSingleTokenBalance(token, wallet: string) {
    const ERC20_ABI = await this.httpService.axiosRef.get(
      'https://gist.githubusercontent.com/veox/8800debbf56e24718f9f483e1e40c35c/raw/f853187315486225002ba56e5283c1dba0556e6f/erc20.abi.json',
    );
    const contract = new this.client.Contract(ERC20_ABI.data, token.address);
    const balance = await contract.methods.balanceOf(wallet).call();

    return balance;
  }

  async getWalletContent(network: string, wallet: string) {
    try {
      const proms = [];
      const results = [];
      const ERC20_ABI = await this.httpService.axiosRef.get(
        'https://gist.githubusercontent.com/veox/8800debbf56e24718f9f483e1e40c35c/raw/f853187315486225002ba56e5283c1dba0556e6f/erc20.abi.json',
      );

      const tokenList = await this.getTokens(network);
      const filteredTokenList = this.filterTokenList(tokenList);

      for (const tkn of filteredTokenList) {
        // create ERC20 token contract instance
        const erc20 = new this.client.Contract(ERC20_ABI.data, tkn.address);
        // save request in array of Promises
        proms.push(erc20.methods.balanceOf(wallet));
      }

      // actually requests all balances simultaneously
      const promiseResults = await Promise.allSettled(proms);

      // loop through all responses to format response
      for (let index = 0; index < filteredTokenList.length; index++) {
        const balance = await (promiseResults[index] as any).value.call();
        //   transforms balance to decimal
        const formattedBalance = this.convertToNumber(
          balance,
          filteredTokenList[index].decimals,
        );
        // save balance with token name and symbol
        results.push({
          address: filteredTokenList[index].address,
          name: filteredTokenList[index].name,
          symbol: filteredTokenList[index].symbol,
          decimals: filteredTokenList[index].decimals,
          balance: formattedBalance,
        });
      }

      return results;
    } catch (error) {
      console.error(error);
      throw new Error(`Error while getting wallet content: ${error.message}`);
    }
  }

  convertToNumber(value, decimals = 18) {
    return value / 10 ** decimals;
  }

  filterTokenList(tokenList) {
    const filteredTokenList = tokenList.filter((token) => {
      return ADDED_TOKENS.includes(token.address);
    });

    return filteredTokenList;
  }
}
