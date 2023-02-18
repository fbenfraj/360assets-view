import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { PricingService } from './pricing.service';
import { CacheModule } from '@nestjs/common';

describe('PricingService', () => {
  let pricingService: PricingService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, CacheModule.register({})],
      providers: [PricingService],
    }).compile();

    pricingService = module.get<PricingService>(PricingService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(pricingService).toBeDefined();
  });

  describe('addUsdValues', () => {
    it('should return an empty array when given an empty array of balances', async () => {
      const balances: Balance[] = [];
      const result: Balance[] = await pricingService.addUsdValues(balances);
      expect(result).toEqual([]);
    });

    it('should return an array of balances with USD values calculated', async () => {
      const balances: Balance[] = [
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          name: 'Tether',
          symbol: 'USDT',
          decimals: 6,
          balance: 2000,
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          name: 'WETH',
          symbol: 'WETH',
          decimals: 18,
          balance: 2,
        },
      ];

      const expected: Balance[] = [
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          name: 'Tether',
          symbol: 'USDT',
          decimals: 6,
          balance: 2000,
          balanceUsd: 2000,
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          name: 'WETH',
          symbol: 'WETH',
          decimals: 18,
          balance: 2,
          balanceUsd: 6000,
        },
      ];

      jest.spyOn(pricingService, 'getTokenList').mockResolvedValue([
        { name: 'USDT', id: 'usdt', symbol: 'usdt' },
        { name: 'WETH', id: 'wrapped-ethereum', symbol: 'weth' },
      ]);
      jest.spyOn(pricingService, 'getTokenPrices').mockResolvedValue({
        Tether: 1,
        WETH: 3000,
      });

      const result: Balance[] = await pricingService.addUsdValues(balances);
      expect(result).toEqual(expected);
    });
  });

  it('should calculate the USD balance for a given token balance and USD pricing', () => {
    const balance: Balance = {
      name: 'Tether',
      balance: 2000,
      decimals: 6,
      symbol: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    };
    const usdPricings: TokenPrices = {
      Tether: 1.0,
    };
    const result: number = pricingService.calculateBalanceUsd(
      balance,
      usdPricings,
    );
    expect(result).toEqual(2000);
  });

  it('should return an array of balances with USD values calculated', async () => {
    const usdPrices: CoingeckoPrices = (
      await httpService.axiosRef.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd',
      )
    ).data;

    expect(usdPrices).toHaveProperty('tether');
    expect(usdPrices.tether).toHaveProperty('usd');
    expect(typeof usdPrices.tether.usd).toBe('number');
  });

  it('should process a large number of balances quickly', async () => {
    const numberOfBalances = 100000;
    const balances: Balance[] = Array.from({ length: numberOfBalances }).map(
      (_, index) => ({
        address: `0x${index.toString().padStart(40, '0')}`,
        name: 'Test Token',
        symbol: 'TTT',
        decimals: 18,
        balance: 1,
      }),
    );

    jest
      .spyOn(pricingService, 'getTokenList')
      .mockResolvedValue([
        { name: 'Test Token', id: 'test-token', symbol: 'TTT' },
      ]);
    jest
      .spyOn(pricingService, 'getTokenPrices')
      .mockResolvedValue({ 'Test Token': 1 });

    const startTime: number = Date.now();
    const result: Balance[] = await pricingService.addUsdValues(balances);
    const endTime: number = Date.now();
    const duration: number = endTime - startTime;

    expect(duration).toBeLessThan(100);
    expect(result.length).toEqual(numberOfBalances);
  });
});
