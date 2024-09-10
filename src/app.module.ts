import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { RestaurantModule } from './api/restaurant/restaurant.module'
import { ChefModule } from './api/chef/chef.module'
import { LoggerService } from './services/logger.service'

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
    ],
    controllers: [],
    providers: [
        LoggerService
    ],
    exports: [LoggerService]
})
export class AppModule { }
