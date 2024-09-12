import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UserController } from './user.controller'
import { User, UserSchema } from './user.schema'
import { UserService } from './user.service'
import { LoggerService } from 'src/services/logger.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserService, LoggerService],
  exports: [LoggerService, UserService]
})
export class UserModule { }
