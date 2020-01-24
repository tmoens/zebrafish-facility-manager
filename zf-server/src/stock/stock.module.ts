import { Module } from '@nestjs/common';
import { getCustomRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { Stock } from './stock.entity';
import { StockRepository } from './stock.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, StockRepository]),
  ],
  providers: [
    StockService,
  ],
  controllers: [
    StockController,
  ],
})
export class StockModule {}
