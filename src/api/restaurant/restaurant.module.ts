import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"

import { LoggerService } from "src/services/logger.service"
import { RestaurantService } from "./restaurant.service"
import { RestaurantController } from "./restaurant.controller"
import { Restaurant, RestaurantSchema } from "./restaurant.schema"
import { Dish, DishSchema } from "./dish.schema"

@Module({
    imports: [MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }]),
    MongooseModule.forFeature([{ name: Dish.name, schema: DishSchema }])],
    controllers: [RestaurantController],
    providers: [RestaurantService, LoggerService],
    exports: [LoggerService]
})
export class RestaurantModule { }
