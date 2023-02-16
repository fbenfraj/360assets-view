import { Module } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { BalancesController } from './balances.controller';
import { HttpModule } from '@nestjs/axios';
import { Web3Service } from 'src/web3/web3.service';
import { PricingService } from 'src/pricing/pricing.service';

@Module({
  imports: [HttpModule],
  controllers: [BalancesController],
  providers: [BalancesService, Web3Service, PricingService],
})
export class BalancesModule {}
