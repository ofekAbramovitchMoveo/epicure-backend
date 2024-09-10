import { Test, TestingModule } from '@nestjs/testing';
import { ChefController } from './chef.controller';

describe('ChefController', () => {
  let controller: ChefController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChefController],
    }).compile();

    controller = module.get<ChefController>(ChefController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
