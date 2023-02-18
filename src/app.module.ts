import { CacheModule, Module } from '@nestjs/common';
import { BalancesModule } from './balances/balances.module';
import { ConfigModule } from '@nestjs/config';
import { Web3Module } from './web3/web3.module';
import { PricingModule } from './pricing/pricing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
