import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PricingService],
})
export class PricingModule {}
