import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Web3Service } from './web3.service';
import Web3 from 'web3';

describe('Web3Service', () => {
  let web3Service: Web3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, HttpModule],
      providers: [Web3Service],
    }).compile();

    web3Service = module.get<Web3Service>(Web3Service);
  });

  it('should be defined', () => {
    expect(web3Service).toBeDefined();
  });

  it('should retrieve the ERC20 ABI', async () => {
    const ERC20_ABI = await web3Service.getERC20ABI();
    expect(ERC20_ABI).toBeDefined();
  });

  it('should filter the token list', () => {
    const tokenList: ChainToken[] = [
      {
        address: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
        name: 'Token 1',
        symbol: 'T1',
        decimals: 18,
        logoURI: 'https://example.com/logo.png',
        chainId: 1,
        coingeckoId: 'token-1',
        listedIn: ['https://example.com/listed-in'],
      },
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        name: 'Token 2',
        symbol: 'T2',
        decimals: 18,
        logoURI: 'https://example.com/logo.png',
        chainId: 1,
        coingeckoId: 'token-2',
        listedIn: ['https://example.com/listed-in'],
      },
      {
        address: '0x333',
        name: 'Token 3',
        symbol: 'T3',
        decimals: 18,
        logoURI: 'https://example.com/logo.png',
        chainId: 1,
        coingeckoId: 'token-3',
        listedIn: ['https://example.com/listed-in'],
      },
    ];
    const filteredTokenList = web3Service.filterTokenList('eth', tokenList);
    expect(filteredTokenList).toHaveLength(2);
    expect(filteredTokenList).toContainEqual(
      expect.objectContaining({
        address: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
      }),
    );
    expect(filteredTokenList).toContainEqual(
      expect.objectContaining({
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      }),
    );
  });

  it('should convert a value to a number', () => {
    const value = '1000000000000000000'; // 1 ETH in wei
    const result = web3Service.convertToNumber(value);
    expect(result).toBe(1);
  });

  describe('getTokens', () => {
    it('should return an array of ChainToken objects with the addresses specified in ADDED_TOKENS', async () => {
      const chain = 'eth';
      const tokens = await web3Service.getTokens(chain);

      expect(tokens).toBeInstanceOf(Array);
      expect(
        tokens.every((token) => typeof token === 'object' && token !== null),
      ).toBe(true);
      expect(
        tokens.every(
          (token) =>
            'symbol' in token &&
            'name' in token &&
            'address' in token &&
            'decimals' in token &&
            'chainId' in token &&
            'logoURI' in token &&
            'coingeckoId' in token &&
            'listedIn' in token,
        ),
      ).toBe(true);
    });
  });

  it('should return a Web3 instance for the specified network', () => {
    const network = 'poly';
    const result: Web3 = web3Service.getWeb3Instance(network);

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Web3);
  });
});
