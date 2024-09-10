import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { LoggerService } from 'src/services/logger.service'
import { ChefController } from './chef.controller'
import { Chef, ChefSchema } from './chef.schema'
import { ChefService } from './chef.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: Chef.name, schema: ChefSchema }])],
  controllers: [ChefController],
  providers: [ChefService, LoggerService],
  exports: [LoggerService]
})
export class ChefModule { }
