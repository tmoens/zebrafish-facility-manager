import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {StockService} from './stock.service';
import {StockController} from './stock.controller';
import {Stock} from './stock.entity';
import {StockRepository} from './stock.repository';
import {UserModule} from '../user/user.module';
import {MutationModule} from '../mutation/mutation.module';
import {TransgeneModule} from '../transgene/transgene.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, StockRepository]),
    UserModule,
    TransgeneModule,
    MutationModule,
  ],
  providers: [
    StockService,
  ],
  controllers: [
    StockController,
  ],
})
export class StockModule {}
