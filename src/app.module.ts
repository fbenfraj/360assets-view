import { CacheModule, Module } from '@nestjs/common';
import { BalancesModule } from './balances/balances.module';
import { Web3Module } from './web3/web3.module';
import { PricingModule } from './pricing/pricing.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes
    }),
    BalancesModule,
    Web3Module,
    PricingModule,
  ],
})
export class AppModule {}
