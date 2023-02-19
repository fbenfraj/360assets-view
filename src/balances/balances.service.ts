import { Injectable } from '@nestjs/common';
import { PricingService } from '../pricing/pricing.service';
import { Web3Service } from '../web3/web3.service';

@Injectable()
export class BalancesService {
  constructor(
    private readonly web3Service: Web3Service,
    private readonly pricingService: PricingService,
  ) {}

  /**
   * Returns an array of balances for a wallet, along with their respective USD values.
   * @param {string} network - The blockchain network to get the balances for.
   * @param {string} address - The address of the wallet to get the balances for.
   * @returns {Promise<Balance[]>} An array of balances with their respective USD values.
   */
  async getBalances(network: string, address: string): Promise<Balance[]> {
    const balances: Balance[] = await this.web3Service.getWalletContent(
      network,
      address,
    );
    const balancesWithUsd: Balance[] = await this.pricingService.addUsdValues(
      balances,
    );

    return balancesWithUsd;
  }
}
