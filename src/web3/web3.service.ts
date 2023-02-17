import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TOKEN_LISTS, ADDED_TOKENS } from '../../config/token-lists';
import { HttpService } from '@nestjs/axios';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';

@Injectable()
export class Web3Service {
  private web3Instance: Web3;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.web3Instance = new Web3(
      this.configService.get<string>('WEB3_RPC_ENDPOINT'),
    );
  }

  async getWalletContent(network: string, wallet: string): Promise<Balance[]> {
    try {
      // any is used here because of balanceOf() definition in ERC20 ABI
      const proms: Promise<any>[] = [];
      const results: Balance[] = [];
      const ERC20_ABI: AbiItem = (
        await this.httpService.axiosRef.get(
          'https://gist.githubusercontent.com/veox/8800debbf56e24718f9f483e1e40c35c/raw/f853187315486225002ba56e5283c1dba0556e6f/erc20.abi.json',
        )
      ).data;

      const tokenList: ChainToken[] = await this.getTokens(network);
      const filteredTokenList: ChainToken[] = this.filterTokenList(tokenList);

      for (const token of filteredTokenList) {
        // create ERC20 token contract instance
        const contract: Contract = new this.web3Instance.eth.Contract(
          ERC20_ABI,
          token.address,
        );
        // save request in array of Promises
        proms.push(contract.methods.balanceOf(wallet));
      }

      // actually requests all balances simultaneously
      // any is used here because of balanceOf() definition in ERC20 ABI
      const promiseResults: any[] = await Promise.all(proms);

      // loop through all responses to format response
      for (let index = 0; index < filteredTokenList.length; index++) {
        const balance: string = await (promiseResults[index] as any).call();

        //   transforms balance to decimal
        const formattedBalance: number = this.convertToNumber(
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

  async getTokens(chain: string): Promise<ChainToken[]> {
    try {
      // get token list file URL by chain
      const tokenSource: string = TOKEN_LISTS[chain];
      // retrieve token list from URL
      return (await this.httpService.axiosRef.get(tokenSource)).data;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to retrieve token list for chain ${chain}`);
    }
  }

  convertToNumber(value: string, decimals = 18): number {
    return parseInt(value) / 10 ** decimals;
  }

  filterTokenList(tokenList: ChainToken[]): ChainToken[] {
    const filteredTokenList: ChainToken[] = tokenList.filter(
      (token: ChainToken) => {
        return ADDED_TOKENS.includes(token.address);
      },
    );

    return filteredTokenList;
  }
}
