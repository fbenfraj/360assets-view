import { Module } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [Web3Service],
})
export class Web3Module {}
