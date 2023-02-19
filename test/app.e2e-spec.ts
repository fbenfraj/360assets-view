import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should return the balance of the ETHEREUM wallet 0xb21090C8f6bAC1ba614A3F529aAe728eA92B6487', () => {
    return request(app.getHttpServer())
      .get('/balances/eth/0xb21090C8f6bAC1ba614A3F529aAe728eA92B6487')
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              balanceUsd: expect.any(Number),
            }),
          ]),
        );
      });
  });

  it('should return the balance of the POLYGON wallet 0xb21090C8f6bAC1ba614A3F529aAe728eA92B6487', () => {
    return request(app.getHttpServer())
      .get('/balances/poly/0x592Df3c5C823884fA44A854e7bF9c5a03a7Fb1E2')
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              balanceUsd: expect.any(Number),
            }),
          ]),
        );
      });
  });

  it('should return the balance of the ARBITRUM wallet 0xb21090C8f6bAC1ba614A3F529aAe728eA92B6487', () => {
    return request(app.getHttpServer())
      .get('/balances/arb/0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868')
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              balanceUsd: expect.any(Number),
            }),
          ]),
        );
      });
  });

  it('should return an error if the wallet address is invalid', () => {
    return request(app.getHttpServer())
      .get('/balances/eth/invalidwalletaddress')
      .then((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: expect.stringMatching('Invalid wallet address'),
          }),
        );
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
