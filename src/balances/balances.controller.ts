import { Controller, Get, Param, Res } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { Response } from 'express';

@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get(':network/:address')
  async getBalances(
    @Param('network') network: string,
    @Param('address') address: string,
    @Res() res: Response,
  ) {
    try {
      const balances = await this.balancesService.getBalances(network, address);
      res.send(balances);
    } catch (error) {
      res.status(500).send({ error: 'Failed to retrieve token balances' });
    }
  }
}
