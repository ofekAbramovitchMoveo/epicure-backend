import { Module } from '@nestjs/common'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { LoggerService } from 'src/services/logger.service'
import { UserModule } from '../user/user.module'

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, LoggerService],
  exports: [LoggerService]
})
export class AuthModule { }
