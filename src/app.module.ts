import { Module } from '@nestjs/common';
import { BalancesModule } from './balances/balances.module';
import { ConfigModule } from '@nestjs/config';
import { Web3Module } from './web3/web3.module';
import { PricingModule } from './pricing/pricing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BalancesModule,
    Web3Module,
    PricingModule,
  ],
})
export class AppModule {}
