import { Test, TestingModule } from '@nestjs/testing';
import { ZfinController } from './zfin.controller';
import { ZfinService } from './zfin.service';

describe('ZfinController', () => {
  let controller: ZfinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZfinController],
      providers: [ZfinService],
    }).compile();

    controller = module.get<ZfinController>(ZfinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
