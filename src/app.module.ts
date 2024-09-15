import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { RestaurantModule } from './api/restaurant/restaurant.module'
import { ChefModule } from './api/chef/chef.module'
import { LoggerService } from './services/logger.service'
import { UserModule } from './api/user/user.module'
import { AuthModule } from './api/auth/auth.module'
import { OrderModule } from './api/order/order.module'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('DB_URL'),
            }),
            inject: [ConfigService],
        }),
        RestaurantModule,
        ChefModule,
        UserModule,
        AuthModule,
        OrderModule,
    ],
    controllers: [],
    providers: [
        LoggerService
    ],
    exports: [LoggerService]
})
export class AppModule { }
