import { Injectable } from '@nestjs/common';
import { PricingService } from 'src/pricing/pricing.service';
import { Web3Service } from 'src/web3/web3.service';

@Injectable()
export class BalancesService {
  constructor(
    private readonly web3Service: Web3Service,
    private readonly pricingService: PricingService,
  ) {}

  async getBalances(network: string, address: string) {
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
