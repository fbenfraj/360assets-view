import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Web3Service } from './web3.service';

describe('Web3Service', () => {
  let web3Service: Web3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, HttpModule],
      providers: [Web3Service],
    }).compile();

    web3Service = module.get<Web3Service>(Web3Service);
  });

  it.only('should be defined', () => {
    expect(web3Service).toBeDefined();
  });
});
