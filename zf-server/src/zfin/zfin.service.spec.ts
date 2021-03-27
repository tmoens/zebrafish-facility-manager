import { Test, TestingModule } from '@nestjs/testing';
import { ZfinService } from './zfin.service';

describe('ZfinService', () => {
  let service: ZfinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZfinService],
    }).compile();

    service = module.get<ZfinService>(ZfinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
