import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { MutationModule } from './mutation/mutation.module';
import { TankModule } from './tank/tank.module';
import { TransgeneModule } from './transgene/transgene.module';
import { BackgroundModule } from './background/background.module';
import { Stock2tankModule } from './stock2tank/stock2tank.module';
import { StockModule } from './stock/stock.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    BackgroundModule,
    ConfigModule,
    MutationModule,
    StockModule,
    Stock2tankModule,
    TankModule,
    TransgeneModule,
    TypeOrmModule.forRootAsync(
      {
        imports: [ConfigModule],
        useExisting: ConfigService,
      }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
